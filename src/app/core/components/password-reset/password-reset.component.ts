import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PasswordResetActions } from 'antra-ui';
import { LoginResponse } from '../../interface/auth.interface';
import { LoginStatus } from '../../enum/auth.enum';
import { AuthService } from '../../service/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit, OnDestroy {
  sub!: Subscription;
  isEmailValid!: boolean;
  passwordResetActions: PasswordResetActions;
  loginErrorMessage: string | undefined;
  showLoginError = false;
  loginResponse!: LoginResponse;
  loginStatus = LoginStatus;
  isLoading = false;
  resetEmailSendSuccess = false;
  resetEmailSendSuccessMsg = '';
  notificationStatus = true;
  successMessage = '';

  emailAddressValidationMsg = [
    'Email Address is required',
    'Please Enter Valid Email Address',
  ];

  constructor(private router: Router, private authService: AuthService) {
    this.passwordResetActions = {
      actionType: 'PasswordReset',
      email: '',
      password: '',
      confirmPassword: '',
    };
  }

  ngOnInit(): void { }

  sendVerificationEmail(pwdResetActions: PasswordResetActions): void {
    this.passwordResetActions = {
      actionType: pwdResetActions.actionType,
      email: pwdResetActions.email,
      password: pwdResetActions.password,
      confirmPassword: pwdResetActions.confirmPassword,
    };
    this.isLoading = true;
    this.showLoginError = false;
    this.loginErrorMessage = '';
    this.sub = this.authService
      .sendResetPasswordLink(this.passwordResetActions.email)
      // tslint:disable-next-line: deprecation
      .subscribe(
        (res) => {
          this.isLoading = false;
          if (res.errorCode === 0) {
            this.resetEmailSendSuccess = true;
            this.successMessage = res.result.message;
          } else {
            this.showLoginError = true;
            this.loginErrorMessage = res.errorMessage;
          }
        },
        (error) => {
          this.isLoading = false;
          this.showLoginError = true;
          this.loginErrorMessage = 'Oops! Request has failed';
        }
      );
  }

  showActionDetails(actionName: string): void {
    this.router.navigate(['/login']);
  }

  // Unsubscribe when the component dies
  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}
