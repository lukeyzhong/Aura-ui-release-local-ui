import { DocumentInformation } from '../../../../shared/interface/document-info.interface';
import {
  Addresses,
  ContactAddresses,
} from '../../../search/interface/person.interface';

export interface OnboardingDetailsResponse {
  errorCode: number;
  errorMessage: string;
  result: OnboardingDetailsResult;
}
export interface OnboardingDetailsResult {
  candidateId: string;
  candidateJobRequirementId: string;
  jobRequirementId: string;
  personId: string;
  candidateCode: string;
  candidateName: string;
  recruiterId: string;
  recruiterName: string;
  resumeDocumentId: string;
  jobcode: string;
  jobTitle: string;
  jobDescription: string;
  title?: string;
  resumeDocument: DocumentInformation;
}
// PersonalInformationResponse interface
export interface PersonalInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: PersonalInformationResult;
}

export interface PersonalInformationResult {
  candidateId: string;
  candidateJobRequirementId: string;
  personId: string;
  firstName: string;
  lastName: string;
  aliasName: string;
  dateOfBirth: string;
  gender: string;
  genderCode: number;
  maritalStatus: string;
  maritalStatusCode: number;
  socialSecurityNumber: string;
  workAuthorizationStatus: string;
  workAuthorizationStatusCode: number;
  contactAddresses: ContactAddresses[];
  address: Addresses;
  ssnApplied: boolean;
}
export interface GoogleAddress {
  route: string;
  sublocality: string;
  cityName: string;
  districtName: string;
  stateName: string;
  countryName: string;
  postalCode: string;
}

// EmploymentInformationResponse
export interface EmploymentInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: EmploymentInformationResult;
}

export interface EmploymentInformationResult {
  candidateId: string;
  candidateJobRequirementId: string;
  jobTitle: string;
  department: string;
  departmentId: string;
  employmentType: string;
  employmentTypeCode: number;
  employmentCategory: string;
  employmentCategoryCode: number;
  hireDate: string;
  startDate: string;
  hrManagerId: string;
  hrManager: string;
  reportingManagerId: string;
  reportingManager: string;
  backgroundVerificationStatus: string;
  backgroundVerificationCompanyName: string;
  backgroundVerificationResult: string;
  backgroundVerificationInitiationDate: string;
  recruiterId: string;
  recruiter: string;
  workLocation: string;
  workLocationCode: number;
  businessUnitCode: number;
  businessUnit: string;
}

// CompensationInformationResponse
export interface CompensationInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: CompensationInformationResult;
}
export interface CompensationInformationResult {
  candidateId: string;
  candidateJobRequirementId: string;
  compensationTypeCode: number;
  compensationType: string;
  calculatedByCode: number;
  calculatedBy: string;
  amount: number;
  paymentFrequencyCode: number;
  paymentFrequency: string;
  additionalEarnings: AdditionalEarnings[];
  flsaClassification: boolean;
  overTimePayInfo: number;
}
export interface AdditionalEarnings {
  compensationTypeCode: number;
  compensationType?: string;
  calculatedByCode: number;
  calculatedBy?: string;
  paymentFrequencyCode: number;
  paymentFrequency?: string;
  amount: number;
}

// DocumentsInfoResponse
export interface DocumentsInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: DocumentsInfoResult;
}
export interface DocumentsInfoResult {
  candidateId: string;
  candidateJobRequirementId: string;
  documentPackageCode: number;
  addtionalDocuments: AddtionalDocuments[];
}
export interface AddtionalDocuments {
  resourceValue: string;
  resourceTypeCode: number;
}

// AllOnboardingDocumentsInfoResponse
export interface AllOnboardingDocumentsInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: AllOnboardingDocumentsInfoResult[];
}
export interface AllOnboardingDocumentsInfoResult {
  templateId: string;
  templateTypeCode: number;
  templateName: string;
  description: string;
  sqlStatement: string;
  className: string;
  methodName: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  templatePath: string;
  replaceParameters: string;
}

// WebFormAllDocumentsInfoResponse
export interface WebFormAllDocumentsInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: WebFormAllDocumentsInfoResult[];
}
export interface WebFormAllDocumentsInfoResult {
  webFormTypeId: string;
  description: string;
  webformName: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdatedId: string;
  lastUpdatedDateTime: string;
  adminInactivateFlag: null;
}

// WebForms & Documents By Package Code
export interface WebFormsAndDocumentsByPkgCodeResponse {
  errorCode: number;
  errorMessage: string;
  result: WebFormsAndDocumentsByPkgCodeResult;
}
export interface WebFormsAndDocumentsByPkgCodeResult {
  documents: AllOnboardingDocumentsInfoResult[];
  additionalDocuments: AllOnboardingDocumentsInfoResult[];
  webForms: WebFormAllDocumentsInfoResult[];
  additionalWebForms: WebFormAllDocumentsInfoResult[];
}

// PreviewInfoResponse
export interface PreviewInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: PreviewInfoResult;
}

export interface PreviewInfoResult {
  employeeOnboardingId: string;
  personalInfo: PersonalInformationResult;
  employmentInfo: EmploymentInformationResult;
  compensationInfo: CompensationInformationResult;
  documentInfo: WebFormsAndDocumentsByPkgCodeResult;
}

// OfferLetterEmailContentResponse
export interface OfferLetterEmailContentResponse {
  errorCode: number;
  errorMessage: string;
  result: OfferLetterEmailContentResult;
}

export interface OfferLetterEmailContentResult {
  candidateId: string;
  candidateJobRequirementId: string;
  to: string;
  subject: string;
  body: string;
  attachments?: string;
}

export interface EmailList {
  value: string;
  invalid?: boolean;
}
