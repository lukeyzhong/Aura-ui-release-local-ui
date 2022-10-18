import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtTokenService } from '../core/service/jwt-token.service';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptor implements HttpInterceptor {
  constructor(private jwtTokenService: JwtTokenService) {}

  // tslint:disable-next-line: no-any
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.jwtTokenService.getToken();
    if (token !== null) {
      authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY,  token) });
    }
    return next.handle(authReq);
  }
}
