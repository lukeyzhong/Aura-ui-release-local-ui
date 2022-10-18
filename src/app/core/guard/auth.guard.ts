import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { UtilHelperService } from '../../shared/service/util-helper.service';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private utilHelperService: UtilHelperService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentUser = this.authService.user;
    if (currentUser) {
      if (next.data.roles) {
        if (
          this.utilHelperService.roleMatch(
            next.data.roles,
            currentUser.rolecode
          )
        ) {
          return true;
        } else {
          this.authService.AuthErrorSubject$.next('Unauthorized access');
          this.router.navigateByUrl(this.authService.unAuthRedirectUrl);
          return false;
        }
      }
      return true;
    }
    return (
      this.authService
        .checkLocalAuthenticationInfo()
        // tslint:disable-next-line: no-any
        .then((_: any) => {
          return Promise.resolve(true);
        })
        // tslint:disable-next-line: no-any
        .catch((errMsg: any) => {
          this.authService.AuthErrorSubject$.next(errMsg);
          return Promise.resolve(false);
        })
    );
  }
}
