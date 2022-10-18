import { Injectable } from '@angular/core';
import jwtDecode from 'jwt-decode';
import { JwtAccessTokenData } from '../interface/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class JwtTokenService {
  constructor() {}

  getUserFromJwtToken(token: string): JwtAccessTokenData {
    return jwtDecode(token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
  getLastLogin(): string | null {
    return localStorage.getItem('lastLogin');
  }
}
