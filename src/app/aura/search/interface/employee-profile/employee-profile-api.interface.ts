import {
  PersonData,
  SecurityClearances,
  SocialMediaLinks,
} from '../person.interface';

// EmployeeProfileResponse interface
export interface EmployeeProfileResponse {
  errorCode: number;
  errorMessage: string;
  result: EmployeeProfileResult;
}

// EmployeeProfileResult
export interface EmployeeProfileResult {
  employeeId: string;
  employeeCode: string;
  hireDate: string;
  terminationDate: string;
  startDate: string;
  branchId: string;
  locationId: string;
  supervisorId: string;
  supervisor: string;
  subDepartmentId: string;
  department: string;
  employeeCategoryCode: number;
  employeeStatusCode: number;
  employeeStatus: string;
  employmentTypeCode: number;
  employmentType: string;
  employeeAgreementSignedOn: string;
  workAuthorizationStatusCode: number;
  workAuthorizationStatus: string;
  employeeCurrentStatusCode: number;
  employeeCurrentStatus: string;
  totalHoursWorked: number;
  wageTypeCode: number;
  wageType: string;
  recruiter: string;
  withBenefits: boolean;
  employeeTitle: string;
  totalHoursWorkedLastUpdateDateTime: string;
  personData: PersonData;
  employeeProfilePhotoId: string;
  adpFileNumber: string;
}

// EmployeeEditProfilePopupData interface
export interface EmployeeEditProfilePopupData {
  action: string;
  profileData: EmployeeProfileResult;
  profileSrc: string;
  mapSuper: Map<string, string>;
}

// EmployeeEditProfilePhotoUpload interface
export interface EmployeeEditProfilePhotoUpload {
  documentInfo: File;
  displayName: string;
  documentPurposeCode: string;
  documentId: string;
  resourceValue: string;
  resourceTypeCode: string;
  isOverwrite: string;
}

// Employee Termination
export interface EmployeeTermination {
  employeeId: string;
  employeeOnboardingId?: string;
  terminationDate: string;
  lastWorkingDate: string;
  comment: string;
  rehireEligibleIndicator: boolean | null;
  severanceEligibleIndicator: boolean | null;
}

// EmployeeTerminationDetails
export interface EmployeeTerminationDetails {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
}

// E-Verify Info Response Interface
export interface EVerifyInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: EVerifyInfoResult;
}

// E-Verify Info Result Interface
export interface EVerifyInfoResult {
  employeeOnboardingId: string;
  employeeId: string;
  uscisCaseNumber: string;
  caseStatus: string;
  caseStatusCode: number;
  caseEligibilityStatement: string;
  documentExpiryDate: string;
}


