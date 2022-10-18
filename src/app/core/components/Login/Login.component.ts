import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocialUser } from '../../../shared/model/socialusers';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginActions } from 'antra-ui';
import { LoginResult } from '../../interface/auth.interface';
import { MatNotificationService } from 'src/app/shared/service/mat-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  user: SocialUser = new SocialUser();
  token: string | undefined;
  isLoading = false;
  showLoginError = false;
  emailPattern = '^[a-zA-Z0-9+_.-]+[@]?[a-zA-Z0-9.-]+$';

  loginErrorMessage = '';

  emailAddressValidationMsg = [
    'Username is required',
    'Please Enter Valid Username',
  ];
  passwordValidationMsg = ['Password is required'];

  loginFailCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private matNotificationService: MatNotificationService
  ) {}

  ngOnInit(): void {
    const jwtToken = localStorage.getItem('jwtToken');

    if (jwtToken) {
      this.authService.checkLocalAuthenticationInfoFromUrlToken();
    }

    this.subs.push(
      // tslint:disable-next-line: deprecation
      this.socialAuthService.authState.subscribe((userdata) => {
        this.user = userdata;
      })
    );
  }

  getLoginActionEvent(loginActions: LoginActions): void {
    this.showLoginError = false;
    switch (loginActions.actionType) {
      case 'Login':
        this.login(loginActions);
        break;
      case 'GoogleLogin':
        this.googleLogin();
        break;
      case 'ForgotPassword':
        this.router.navigate(['/pwd-reset']);
        break;
    }
  }

  googleLogin(): void {
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((socialuser) => {
        this.token = socialuser.idToken;
        if (socialuser) {
          this.isLoading = true;
          this.subs.push(
            // tslint:disable-next-line: deprecation
            this.authService.authenticate(this.token).subscribe(
              (res) => {
                if (res.errorCode === 0 && res.result?.jwtAccessToken) {
                  // SIGN-IN TO AURA
                  this.isLoading = false;
                  this.authService.signInToAura(
                    res.result as LoginResult,
                    true
                  );
                } else {
                  this.isLoading = false;
                  this.matNotificationService.showSnackBarMessage(
                    'User not found for:' + socialuser.email,
                    'error'
                  );
                }
              },

              (error) => {
                console.warn(error);
                this.isLoading = false;
                this.showLoginError = true;
                this.loginErrorMessage = 'Failed to login';
              }
            )
          );
        }
      })
      .catch((err) => {});
  }

  login(loginActions: LoginActions): void {
    this.showLoginError = false;
    this.isLoading = true;
    this.subs.push(
      this.authService
        .login(loginActions.email, loginActions.password)
        // tslint:disable-next-line: deprecation
        .subscribe(
          (res) => {
            if (res.errorCode === 0 && res.result?.jwtAccessToken) {
              this.isLoading = false;
              this.authService.signInToAura(res.result, true);
            } else {
              this.isLoading = false;
              this.loginErrorMessage = res.errorMessage;
              this.showLoginError = true;
            }
          },
          (error) => {
            console.warn(error);
            this.isLoading = false;
            this.showLoginError = true;
            this.loginErrorMessage = 'Failed to login';
          }
        )
    );
  }

  // Unsubscribe when the component dies
  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.map((sub) => {
        sub.unsubscribe();
      });
    }
  }
}
