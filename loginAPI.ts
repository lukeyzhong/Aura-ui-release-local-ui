// Aura API Design with Limit RESTFUL

// Response with server side exception
// status 500
interface ExceptionResponse {
  title: string;
  status: number;
  detial: string;
  error: any;
}

// Processed Response
// status 200
interface ProcessedResponse {
  result: any;
  errorCode: number;
  errorMessage: string;
}

/// LOGIN API
/**
 * POST https://{{baseUrl}}/api/login/authenticate
 *
 * Parameter: {
 *       "userName":"jingchuan.zhou",
 *       "password":"Xinjiang2017!"
 * }
 */

interface LoginResponse extends ProcessedResponse {
  result: LoginResult | null;
}
interface LoginResult {
  jwtAccessToken: string; /// will be parse to JwtAccessToken in the UI
  refreshToken: string;
}

interface JwtAccessToken {
  emailAddress: string;
  fullName: string;
  avatarUrl: string;
  features: any;
  userId: string;
  userName: string;
  nbf: number; // UTC timestamp: not valid before
  exp: number; // UTC timestamp: expiration time
  iat: number; // UTC timestamp: issued at time
}

// example
const BadRequest: LoginResponse = {
  result: null,
  errorCode: 3,
  errorMessage: 'Bad Request',
};

const FailedRequest: LoginResponse = {
  result: null,
  errorCode: 4,
  errorMessage: 'Wrong Password',
};

const SuccessedRequest: LoginResponse = {
  result: {
    jwtAccessToken: 'dsasfsfsdfsfd',
    refreshToken: 'sdfsdfd',
  },
  errorCode: 0,
  errorMessage: '',
};

const features = {
  canViewPageA: {
    canEditDataInPageA: 1,
    canRemoveDataInPageA: 1,
  },
  canViewPageB: {
    canEditDataInPageB: 1,
    canRemoveDataInPageB: -1,
    canViewPageC: {
      canEditDataInPageC: 1,
      canRemoveDataInPageC: -1,
    },
  },
};

// ERROR: https://atstest.antra.net/aura/api/oauth/authenticate
