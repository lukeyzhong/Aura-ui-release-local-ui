import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subject, BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { User } from '../model/auth.model';
import { SocialAuthService } from 'angularx-social-login';
import {
  LoginResponse,
  LogoutResponse,
  LoginResult,
  PasswordResetResponse,
  ValidateResetPassowrdLinkResponse,
  UpdatePwdResponse,
} from '../interface/auth.interface';
import { JwtTokenService } from './jwt-token.service';
import jwtDecode from 'jwt-decode';
import { GlobalEndpointsConfiguration } from '../../../assets/config/config-api-baseurl';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = environment.apiBaseUrl;
  loginEndpoint = [this.baseUrl, 'login', 'authenticate'].join('/');
  errorData: {} | undefined;
  unAuthRedirectUrl = '/login';
  signinRedirectUrl = '/aura';
  unAuthATSRedirectUrl = '/WebATS/Interface/Login.aspx?forcedLogout=true';
  candidateSignInRedirectUrl = '/candidate';
  AuthErrorSubject$ = new Subject();
  AuthError$ = this.AuthErrorSubject$.asObservable();

  private readonly activeUser = new BehaviorSubject<User | null>(null);
  user$ = this.activeUser.asObservable();

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private jwtTokenService: JwtTokenService
  ) {}

  // =========== User State Management BEGIN ===============
  get user(): User | null {
    return this.activeUser.getValue();
  }
  set user(val: User | null) {
    this.activeUser.next(val);
  }

  addUser(val: User): void {
    this.user = val;
  }

  removeUser(): void {
    this.user = null;
  }
  // ============  User State Management END =============

  signInToAura(res: LoginResult, redirect: boolean): void {
    const user = this.jwtTokenService.getUserFromJwtToken(res.jwtAccessToken);
    const authUser = jwtDecode(res.jwtAccessToken);
    // tslint:disable-next-line: no-any
    const { userName, userId, emailAddress, fullName, rolecode }: any =
      authUser;

    this.addUser(new User(user as User));

    localStorage.setItem('jwt_token', res.jwtAccessToken);
    localStorage.setItem('lastLogin', String(res.lastLoginDateTime));
    localStorage.setItem('rolecode', rolecode);
    if (redirect) {
      if (rolecode === 'CAN') {
        this.router.navigateByUrl(this.candidateSignInRedirectUrl);
      } else {
        this.router.navigateByUrl(this.signinRedirectUrl);
      }
    }
  }

  checkLocalAuthenticationInfo(): Promise<boolean> {
    const curToken = localStorage.getItem('jwt_token');

    const curUser = curToken
      ? this.jwtTokenService.getUserFromJwtToken(curToken)
      : null;
    const lastLogin = String(localStorage.getItem('lastLogin'));

    return new Promise((resolve, reject) => {
      if (curToken && curUser && lastLogin) {
        const refreshTokenDate = new Date(
          Date.parse(curUser.refreshTokenExpireTime)
        );

        const refreshTokenDateUTC = refreshTokenDate + ' UTC';
        const refreshTokenIST = new Date(refreshTokenDateUTC);
        const diff = Math.abs(
          new Date().getTime() - new Date(refreshTokenIST).getTime()
        );
        const minutes = Math.floor(diff / 1000 / 60);

        if (minutes < GlobalEndpointsConfiguration.refreshTokenExpireMinutes) {
          this.signInToAura(
            { jwtAccessToken: curToken, lastLoginDateTime: lastLogin },
            false
          );
          resolve(true);
        } else {
          this.logOut();
          reject('Jwt token expired');
        }
      } else {
        this.logOut();
      }
    });
  }

  checkLocalAuthenticationInfoFromUrlToken(): Promise<boolean> {
    const curToken = localStorage.getItem('jwt_token');

    const curUser = curToken
      ? this.jwtTokenService.getUserFromJwtToken(curToken)
      : null;
    const lastLogin = String(localStorage.getItem('lastLogin'));

    return new Promise((resolve, reject) => {
      if (curToken && curUser && lastLogin) {
        const refreshTokenDate = new Date(
          Date.parse(curUser.refreshTokenExpireTime)
        );

        const refreshTokenDateUTC = refreshTokenDate + ' UTC';
        const refreshTokenIST = new Date(refreshTokenDateUTC);
        const diff = Math.abs(
          new Date().getTime() - new Date(refreshTokenIST).getTime()
        );
        const minutes = Math.floor(diff / 1000 / 60);

        if (minutes < GlobalEndpointsConfiguration.refreshTokenExpireMinutes) {
          this.signInToAura(
            { jwtAccessToken: curToken, lastLoginDateTime: lastLogin },
            true
          );
          resolve(true);
        } else {
          this.logOutRedirectToATS();
          reject('Jwt token expired');
        }
      } else {
        this.logOutRedirectToATS();
      }
    });
  }

  // ===================== LOGOUT BEGIN ============================
  logOut(): void {
    this.logOutGoogle();
    this.removeUser();
    this.clearLocalStorage();
    if (localStorage.getItem('rolecode') === 'CAN') {
      this.router.navigateByUrl(this.unAuthRedirectUrl);
    } else {
      window.location.href = environment.hostUrl + this.unAuthATSRedirectUrl;
    }
  }
  logOutRedirectToATS(): void {
    this.logOutGoogle();
    this.removeUser();
    this.clearLocalStorage();
    window.location.href = environment.hostUrl + this.unAuthATSRedirectUrl;
  }

  clearLocalStorage(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('apiTestUrl');
    localStorage.removeItem('lastLogin');
    localStorage.removeItem('id');
    localStorage.clear();
  }
  // =================== DB LOGOUT ===================
  // tslint:disable-next-line: no-any
  logOutFromDB(tokenNo: string): Observable<LogoutResponse> {
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<any>(`${this.baseUrl}/login/logout`, {
          token: tokenNo,
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  logOutGoogle(): void {
    this.socialAuthService
      .signOut()
      .then((_) => {})
      .catch((err) => {});
  }
  // ===================== LOGOUT END ============================

  // =================== DB LOGIN ===================
  login(username: string, password: string): Observable<LoginResponse> {
    return this.httpClient
      .post<LoginResponse>(this.loginEndpoint, {
        userName: username,
        password,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // =================== GMAIL LOGIN ===================

  // tslint:disable-next-line: no-any
  authenticate(token: string): Observable<LoginResponse> {
    // tslint:disable-next-line: no-any
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<LoginResponse>(`${this.baseUrl}/oauth/authenticate`, {
          Token: token,
          TokenSourceType: 2,
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // =================== RESET PASSWORD BEGIN ===================
  // tslint:disable-next-line: no-any
  sendResetPasswordLink(emailid: string): Observable<PasswordResetResponse> {
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<PasswordResetResponse>(
          `${this.baseUrl}/user/SendResetPasswordLink`,
          {
            email: emailid,
          }
        )
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // tslint:disable-next-line: no-any
  validateResetPassowrdLink(
    tokenNo: string
  ): Observable<ValidateResetPassowrdLinkResponse> {
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<ValidateResetPassowrdLinkResponse>(
          `${this.baseUrl}/user/ValidateResetPassowrdLink`,
          {
            token: tokenNo,
          }
        )
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // tslint:disable-next-line: no-any
  updatePassword(
    usrId: string,
    pwd: string,
    tokenNo: string
  ): Observable<UpdatePwdResponse> {
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<UpdatePwdResponse>(`${this.baseUrl}/user/UpdatePassword`, {
          userId: usrId,
          password: pwd,
          token: tokenNo,
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }
  // =================== RESET PASSWORD END ===================

  // =================== ERROR HANDLER ===================
  // tslint:disable-next-line: typedef
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }

    this.errorData = {
      errorTitle: 'Oops! Request has failed',
      errorDesc: 'Something bad happened. Please try again later.',
    };
    return throwError(this.errorData);
  }
}
