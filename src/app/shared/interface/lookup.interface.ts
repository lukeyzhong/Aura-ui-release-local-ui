// LookupResultResponse interface
export interface LookupResultResponse {
  errorCode: number;
  errorMessage: string;
  result: LookupResult[];
}

// LookupResult
export interface LookupResult {
  lookupCode: number;
  description: string;
  inActiveDate: string;
  name: string;
  abbr: string;
  longDisplayValue: string;
  shortDisplayValue: string;
  adminInactivateFlag: boolean;
}

// DepartmentLookupResultResponse interface
export interface DepartmentLookupResultResponse {
  errorCode: number;
  errorMessage: string;
  result: DepartmentLookupResult[];
}

// DepartmentLookupResult
export interface DepartmentLookupResult {
  departmentId: string;
  departmentName: string;
}

// LookupByCodeResponse interface
export interface LookupBySearchStringResponse {
  errorCode: number;
  errorMessage: string;
  result: Map<string, string>;
}

// WorkAuthorizationDocumentMapResultResponse interface
export interface WorkAuthorizationDocumentMapResultResponse {
  errorCode: number;
  errorMessage: string;
  result: WorkAuthorizationDocumentMapLookupResult[];
}

// WorkAuthorizationDocumentMapLookupResult
export interface WorkAuthorizationDocumentMapLookupResult {
  workAuthorizationTypeCode: number;
  workAuthorizationType: string;
  documentPurposeCode: number;
  documentPurpose: string;
}

// HR Verify List Of Documents Response
export interface HRVerifyListOfDocumentsResponse {
  errorCode: number;
  errorMessage: string;
  result: HRVerifyListOfDocumentsResult[];
}

// HR Verify List Of Documents Result
export interface HRVerifyListOfDocumentsResult {
  thirdPartyLookupCode: number;
  thirdPartyType: string;
  lookupType: string;
  lookupCode: string;
  name: string;
  description: string;
  mappingCode: number;
  inActiveDate: string;
  createdDateTime: string;
  lastUpdateDateTime: string;
  adminInactivateFlag: boolean;
  mappingEntity: string;
  parentLookupCode: number;
  category: string;
}

// ThirdParty Lookup's
// ThirdPartyLookupResponse interface
export interface ThirdPartyLookupResponse {
  errorCode: number;
  errorMessage: string;
  result: ThirdPartyLookupResult[];
}

// ThirdPartyLookupResult
export interface ThirdPartyLookupResult {
  thirdPartyLookupCode: number;
  description: string;
  name: string;
}
