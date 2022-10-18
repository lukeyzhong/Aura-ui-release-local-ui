export interface PersonInfoShare {
  firstName: string;
  lastName: string;
  aliasName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  cellPhoneNumber: string;
  maritalStatus: string;
}

// TERMS & CONDITIONS
export interface ValidatePersonInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: ValidatePersonInfoResult;
}
export interface ValidatePersonInfoResult {
  errors: string;
  personId: string;
  userName: string;
  failedCount: number;
}
export interface ValidatePersonInfo {
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  countryCode: string;
  phone: string;
  token: string;
}

export interface SaveUserInfo {
  userName: string;
  newPassword: string;
  personId: string;
  UserRegisterToken: string;
}
