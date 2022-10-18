import { ProcessedResponse } from '../../interface/auraAPI.interface';

export interface LoginResponse extends ProcessedResponse {
  result: LoginResult | null;
}
export interface LoginResult {
  jwtAccessToken: string; /// will be parse to JwtAccessToken in the UI
  lastLoginDateTime?: string;
}

export interface JwtAccessTokenData {
  emailAddress: string;
  fullName: string;
  avatarUrl: string;
  // tslint:disable-next-line: no-any
  features: any;
  userId: string;
  userName: string;
  refreshToken: string;
  refreshTokenExpireTime: string;
  rolecode: string;
  nbf: number; // UTC timestamp: not valid before
  exp: number; // UTC timestamp: expiration time
  iat: number; // UTC timestamp: issued at time
}

export interface LogoutResponse extends ProcessedResponse {
  result: null;
}

export interface PasswordResetResponse extends ProcessedResponse {
  result: {
    message: string;
  };
}

export interface ValidateResetPassowrdLinkResponse extends ProcessedResponse {
  result: {
    userId: string;
    userName: string;
  };
}

export interface UpdatePwdResponse extends ProcessedResponse {
  result: {
    message: string;
  };
}
