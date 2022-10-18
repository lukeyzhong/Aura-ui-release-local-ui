import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PasswordResetActions } from 'antra-ui/lib/interfaces/password-reset.interface';
import { Subscription } from 'rxjs';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  private subs: Subscription[] = [];
  tokenNo = '';
  userId = '';
  userName = '';

  btnText = 'BACK TO LOGIN';

  passwordResetActions: PasswordResetActions;
  passwordPattern = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$';

  passwordValidationMsg = [
    'Password is required',
    'Password should have minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter and 1 number',
  ];
  confirmPasswordValidationMsg = [
    'Confirm Password is required',
    'Passwords do not match',
  ];
  isLoading = false;
  notificationStatus = true;
  changePwdSuccess = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.passwordResetActions = {
      actionType: 'ChangePassword',
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  ngOnInit(): void {
    this.subs.push(this.activatedRoute.queryParams.subscribe((parameter) => {
      this.tokenNo = parameter.resettoken;
    }));
    this.subs.push(this.authService.validateResetPassowrdLink(this.tokenNo).subscribe(
      (res) => {
        if (res.errorCode === 0) {
          this.userId = res.result.userId;
          this.userName = res.result.userName;
        } else {
          this.changePwdSuccess = true;
          this.notificationStatus = false;
          this.errorMessage = res.errorMessage;
          if (res.errorMessage === '\n\t\tInvalid URL!\n\t') {
            this.btnText = '';
          } else {
            this.btnText = 'BACK TO PASSWORD RESET';
          }
        }
      },
      (error) => {
        console.warn('error', error);
        this.changePwdSuccess = true;
        this.notificationStatus = false;
        this.errorMessage = 'Oops! Request has failed';
      }
    ));
  }

  changePassword(pwdResetActions: PasswordResetActions): void {
    this.passwordResetActions = {
      actionType: pwdResetActions.actionType,
      email: pwdResetActions.email,
      password: pwdResetActions.password,
      confirmPassword: pwdResetActions.confirmPassword,
    };

    this.isLoading = true;
    this.subs.push(this.authService
      .updatePassword(
        this.userId,
        this.passwordResetActions.password,
        this.tokenNo
      )
      .subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.isLoading = false;
            this.changePwdSuccess = true;
            this.notificationStatus = true;
            this.successMessage = res.result.message;
          } else {
            this.isLoading = false;
            this.changePwdSuccess = true;
            this.notificationStatus = false;
            this.errorMessage = res.errorMessage;
          }
        },
        (error) => {
          this.isLoading = false;
          this.changePwdSuccess = true;
          this.notificationStatus = false;
          this.errorMessage = 'Oops! Request has failed';
        }
      ));
  }

  showActionDetails(actionName: string): void {
    if (actionName === 'BACK TO LOGIN') {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/pwd-reset']);
    }
  }

  // Unsubscribe when the component dies
  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.map(sub => {
        sub.unsubscribe();
      });
    }
  }

}
