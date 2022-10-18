import { CertificationResult } from '../../aura/search/interface/certification.interface';
import { EducationResult } from '../../aura/search/interface/education.interface';
// tslint:disable-next-line: max-line-length
import { EmployeeImmigrationAddEditRecord } from '../../aura/search/interface/employee-profile/employee-profile-immigration.interface';
import { PassportResult } from '../../aura/search/interface/passport.interface';
import {
  Addresses,
  ContactAddresses,
  SocialMediaLinks,
} from '../../aura/search/interface/person.interface';
import {
  AllOnboardingDocumentsInfoResult,
  CompensationInformationResult,
  EmploymentInformationResult,
} from '../../aura/hr/interface/dashboard/candidate-onboarding.interface';
import { SSNResult } from '../../aura/search/interface/ssn.interface';
import { DrivingLicenseResult } from '../../aura/search/interface/driving-license.interface';
import { DocumentInformation } from './document-info.interface';

// Banks Paychecks Response
export interface BanksPaychecksResponse {
  errorCode: number;
  errorMessage: string;
  result: BanksPaychecksResult;
}

// Banks Paychecks Result
export interface BanksPaychecksResult {
  employeeOnboardingId: string;
  candidateId: string;
  candidateJobRequirementId: string;
  bankInfo: BankPaycheckInfo[];
}

// Bank Paycheck Info
export interface BankPaycheckInfo {
  bankAccountData: BankAccountData;
  updateBankAccountData: string;
}

// Bank Account Data
export interface BankAccountData {
  bankAccountId: string;
  resourceTypeCode: number;
  resourceValue: string;
  accountName: string;
  bankAccountTypeCode: number;
  bankName: string;
  routingNumber: string;
  accountNumber: string;
  branchName: string;
  calculationTypeCode: number;
  calculationValue: number;
  amount: number;
  primaryAccount: boolean;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  bankAccountType: string;
  calculationType: string;
  document: DocumentInformation;
}

// CANDIDATE SIGNATURE
export interface CandidateSignatureListResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateSignatureListResult[];
}
export interface CandidateSignatureListResult {
  documentId: string;
  resourceTypeCode: number;
  resourceValue: string;
  displayName: string;
  fileLocation: string;
  fileExtension: string;
  uploadedDateTime: string;
  fileName: string;
  fileDescription: string;
  documentPurposeCode: number;
  creatorId: string;
  createdDateTime: string;
  lastUpdatedId: string;
  lastUpdatedDateTime: string;
  contentType: string;
  imageBase64String: string;
}

// CANDIDATE ONBOARDING WORKFLOW
// Onboarding Information
export interface CandidateOnboardingInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingInformationResult;
}
export interface CandidateOnboardingInformationResult {
  profilePictureDocumentId: string;
  personId: string;
  employmentInfo: EmploymentInformationResult;
  compensationInfo: CompensationInformationResult;
  documentInfo: AllOnboardingDocumentsInfoResult[];
}

// Personal Information
export interface CandidateOnboardingPersonalInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingPersonalInformationResult;
}
export interface CandidateOnboardingPersonalInformationResult {
  employeeOnboardingId: string;
  middleName: string;
  dateOfBirth: string;
  socialMediaLinks: SocialMediaLinks[];
  candidateId: string;
  candidateJobRequirementId: string;
  personId: string;
  firstName: string;
  lastName: string;
  aliasName: string;
  gender: string;
  genderCode: number;
  ethnicity: string;
  ethnicityCode: number;
  race: string;
  raceCode: number;
  maritalStatus: string;
  maritalStatusCode: number;
  socialSecurityNumber: string;
  workAuthorizationStatus: string;
  workAuthorizationStatusCode: number;
  contactAddresses: ContactAddresses[];
  address: Addresses;
  ssnApplied: boolean;
}

// Identification & Immigration Information
export interface CandidateOnboardingIdentificationImmigrationInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingIdentificationImmigrationInformationResult;
}
export interface CandidateOnboardingIdentificationImmigrationInformationResult {
  employeeOnboardingId: string;
  candidateId: string;
  candidateJobRequirementId: string;
  passportInfo: PassportResult;
  ssnInfo: SSNResult;
  drivingLicenseInfo: DrivingLicenseResult;
  immigrationData: ImmigrationData[];
  updatePassportInfo: PassportResult;
  updateSSNInfo: SSNResult;
  updateDrivingLicenseInfo: DrivingLicenseResult;
  updateImmigrationInfo: EmployeeImmigrationAddEditRecord[];
}
export interface ImmigrationData {
  immigrationInfo: EmployeeImmigrationAddEditRecord;
  updateImmigrationInfo?: EmployeeImmigrationAddEditRecord;
}
// Education Information
export interface CandidateOnboardingEducationInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingEducationInformationResult;
}
export interface CandidateOnboardingEducationInformationResult {
  employeeOnboardingId: string;
  candidateId: string;
  candidateJobRequirementId: string;
  educationInfo: EducationInfo[];
  certificateInfo: CertificateInfo[];
}
export interface EducationInfo {
  educationData: EducationResult;
  updateEducationData?: EducationResult;
}
export interface CertificateInfo {
  certificateData: CertificationResult;
  updateCertificateData?: CertificationResult;
}

export interface UploadFile {
  file: File;
  id: string;
  displayName: string;
  fileDescription: string;
  status: boolean;
}
export interface UploadedEducationDocuments {
  id: string;
  fileList: UploadFile[];
  status: string;
  entityType: string;
}

// EMERGENCY CONTACTS
export interface CandidateOnboardingEmergencyContactsResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingEmergencyContactsResult;
}
export interface CandidateOnboardingEmergencyContactsResult {
  employeeOnboardingId: string;
  emergencyContacts: EmergencyContacts[];
}
export interface EmergencyContacts {
  firstName: string;
  lastName: string;
  relationShipTypeCode: number;
  relationShipType?: string;
  isPrimary: boolean;
  address: Addresses;
  contactAddresses: ContactAddresses[];
}

export interface EmploymentCompensationInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: EmploymentCompensationInfoResult;
}

export interface EmploymentCompensationInfoResult {
  employmentInfo: EmploymentInfo;
  compensationInfo: CompensationInfo;
}

export interface EmploymentInfo {
  candidateId: string;
  candidateJobRequirementId: string;
  jobTitle: string;
  department: string;
  departmentId: string;
  employmentType: string;
  employmentTypeCode: string;
  employmentCategory: string;
  employmentCategoryCode: string;
  startDate: string;
  hrManagerId: string;
  hrManager: string;
  reportingManagerId: string;
  reportingManager: string;
  backgroundVerificationStatus: string;
  backgroundVerificationCompanyName: string;
  backgroundVerificationResult: string;
  backgroundVerificationInitiationDate: string;
  workLocation: string;
  recruiterId: string;
  recruiter: string;
}

export interface CompensationInfo {
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

// WORK ELIGIBILITY & I9 FORM
export interface CandidateOnboardingWorkEligibilityAndI9FormResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingWorkEligibilityAndI9FormResult;
}
export interface CandidateOnboardingWorkEligibilityAndI9FormResult {
  // Candidate
  i9Id: string;
  employeeOnboardingId: string;
  employeeId: string;
  candidateFilledLastName: string;
  candidateFilledFirstName: string;
  candidateFilledMiddleInitial: string;
  candidateFilledOtherLastNames: string;
  address: string;
  unitOrApartmentNumber: string;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  phoneNumber: string;
  preparerUsed: boolean;
  preparerSignDocumentId: string;
  preparerFirstName: string;
  preparerLastName: string;
  preparerAddress: string;
  preparerCity: string;
  preparerState: string;
  preparerZIPCode: string;
  citizenshipStatusCode: number;
  citizenshipStatus: string;
  usCitizen: boolean | null;
  nonUSCitizen: boolean | null;
  lawfulPermanentResident: boolean;
  alienAuthorizedToWork: boolean;
  alienAuthorizedToWorkExpiryDate: string;
  uscisNumber: string | null;
  i94Number: string;
  foriegnPassportNumber: string;
  foriegnPassportIssuanceCountry: string;
  candidateSignDocumentId: string | null;
  i9Status: string;

  // HR
  employerFilledLastName?: string;
  employerFilledFirstName?: string;
  employerFilledMiddleInitial?: string;
  listADocCode1?: string | null;
  listADocIssuingAuthority1?: string | null;
  listADocNumber1?: string | null;
  listADocExpirationDate1?: string | null;
  listADocCode2?: string | null;
  listADocIssuingAuthority2?: string | null;
  listADocNumber2?: string | null;
  listADocExpirationDate2?: string | null;
  listADocCode3?: string | null;
  listADocIssuingAuthority3?: string | null;
  listADocNumber3?: string | null;
  listADocExpirationDate3?: string | null;
  listBDocCode?: string | null;
  listBDocIssuingAuthority?: string | null;
  listBDocNumber?: string | null;
  listBDocExpirationDate?: string | null;
  listCDocCode?: string | null;
  listCDocIssuingAuthority?: string | null;
  listCDocNumber?: string | null;
  listCDocExpirationDate?: string | null;
  employmentDate?: string;
  employerSignDocumentId?: string | null;
  employerTitle?: string;
  employerLastName?: string;
  employerFirstName?: string;
  employerOrgName?: string;
  employerOrgAddress?: string;
  employerOrgCity?: string;
  employerOrgState?: string;
  employerOrgZIP?: string;
  immigrationType?: number;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
  candidateSubmissionDateTime?: string;
  i9SubmissionDateTime?: string;
  docSubTypeCode?: string | null;
  noExpirationDate?: boolean | null;
  usStateCode?: string | null;
}
export interface CandidateOnboardingI9FormPreviewResponse {
  errorCode: number;
  errorMessage: string;
  result: DocumentInformation;
}

// Create USCIS Case
export interface CreateUSCISCase {
  errorCode: number;
  errorMessage: string;
  result: USCISResult;
}

// USCIS Result
export interface USCISResult {
  caseStatus: string;
  data: USCISData;
}

// USCIS Data
export interface USCISData {
  case_number?: string;
  case_status?: string;
  case_eligibility_statement?: string;
  case_status_display?: string;
  dhs_referral_status?: string;
  ssa_referral_status?: string;
  document_photo?: string;
}

// tnc action
export interface TncAction {
  errorCode: number;
  errorMessage: string;
  result: TncActionResult;
}

// tnc action result
export interface TncActionResult {
  case_number: string;
  case_status: string;
  case_status_display: string;
  dhs_referral_status: string;
  ssa_referral_status: string;
  case_eligibility_statement: string;
  errors: string;
}

// get Case Data
export interface GetCaseData {
  errorCode: number;
  errorMessage: string;
  result: CaseResult;
}

// Case Result
export interface CaseResult {
  caseNumber?: string;
  userAccountId?: string;
  userAccountName?: string;
  caseClosureReason?: CaseClosureReason;
  employeeInformation?: EmployeeInformation;
  documentDetails?: DocumentDetail;
  additionalDetails?: AdditionalDetails;
  caseStatus?: CaseStatus;
  createdByDetails?: CreatedByDetails;
}

export interface CaseClosureReason {
  currentlyEmployedReason: string;
  currentlyEmployed: string;
  otherReasonText: string;
  caseClosureReasonCodeDisplay: string;
}

export interface EmployeeInformation {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  ssn?: string;
  citizenshipStatusCode?: string;
  citizenshipStatusDescription?: string;
  alienNumber?: string;
}

export interface DocumentDetail {
  documents?: Documents[];
}

export interface Documents {
  documentNumber?: string;
  expirationDate?: string;
  noDocumentNumber?: boolean;
  documentTypeDisplay?: string;
  documentCategoryDisplay?: string;
  countryDisplay?: string;
}

export interface AdditionalDetails {
  dateOfHire?: string;
}

export interface CaseStatus {
  caseEligibilityStatement?: string;
  statusDescription?: string;
}

export interface CreatedByDetails {
  firstName?: string;
  lastName?: string;
}

// DOCUMENTS
export interface CandidateOnboardingDocumentsResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingDocumentsResult[];
}
export interface CandidateOnboardingDocumentsResult {
  signed: boolean;
  signatureRequired: boolean;
  documentPurposeCode: number;
  documentId: string;
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

export interface SaveSignAndGenerateDocumentsResponse {
  errorCode: number;
  errorMessage: string;
  result: SaveSignAndGenerateDocumentsResult;
}
export interface SaveSignAndGenerateDocumentsResult {
  resourceTypeCode: number;
  resourceValue: string;
  docResourceTypeCode: number;
  docResourceValue: string;
  docDisplayName: string;
  docFileDescription: string;
  docPurposeCode: number;
  signatureName: string;
  signature?: File;
  inputParamsKey1: string;
  inputParamsKey2: string;
  inputParamsValue1: string;
  inputParamsValue2: string;
}

// TAX INFORMATION
export interface CandidateOnboardingTaxInformationResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateOnboardingTaxInformationResult;
}
export interface CandidateOnboardingTaxInformationResult {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  federalFilingStatusCode: number;
  federalFilingStatus: string;
  estimateWithIRS: boolean;
  useMultipleJobWorkSheet: boolean;
  onlyUseTwoJobs: boolean;
  multipleJobs: boolean;
  twoJobsAmount: number;
  threeJobsAmount: number;
  threeJobs2aAmount: number;
  threeJobs2bAmount: number;
  threeJobs2cAmount: number;
  numberOfPayPeriods: number;
  amountPerPayPeriod: number;
  numberOfChildren: number;
  numberOfDependents: number;
  childrenClaimAmount: number;
  dependentClaimAmount: number;
  totalClaimAmount: number;
  otherIncome: number;
  hasDeductions: boolean;
  numberOfDeductions: number;
  deductionAmount: number;
  deduction1Amount: number;
  deduction2Amount: number;
  deductionDifferenceAmount: number;
  adjustmentAmount: number;
  totalDeductionAmount: number;
  additionalTaxAmount: number;
  candidateSignature?: File;
  candidateSignatureId: string | null;
  stateFilingstatusCode: number;
  stateFilingStatus: string;
  workedState: number;
  exemptionInWorkedState: number;
  livedInState: number;
  exemptionsInLivedInState: number;
  totalExemptionsForAgeOrBlind: number;
  stateAdditionalTaxAmount: number;
  workedinCity: string;
  exemptionsInWorkedCity: number;
  livedInCity: string;

  // HR Side
  workAuthorizationCode?: number;
  workAuthorizationTypeCode?: number;
  notLivedForFiveYearsInUSA?: boolean;
  livedForFiveYearsInUSA?: boolean;
  ignoreSSNCalculation?: boolean;
  ignoreMedicareCalculation?: boolean;
  createdBy?: string;
  createdDateTime?: string;
  lastUpdatedBy?: string;
  lastUpdatedDateTime?: string;
  firstName?: string;
  lastName?: string;
  ssn?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  firstEmploymentDate?: string;
  employerName?: string;
  employerIdentificationNumber?: string;
  employerAddress?: string;
  employerCountry?: string;
  employerState?: string;
  employerCity?: string;
  employerZIPCode?: string;
  maritalStatusCode?: number;
  maritalStatus?: string;
  resourceDocuments: ResourceDocuments[];
}

export interface ResourceDocuments {
  displayName: string;
  resourceTypeCode: number;
  resourceValue: string;
  isFederalForm: boolean;
}

// Save FICA Tax Info
export interface SaveFICATaxInfo {
  taxInformationId: string;
  employeeOnboardingId: string;
  workAuthorizationTypeCode: number;
  livedForFiveYearsInUSA: boolean;
  notLivedForFiveYearsInUSA: boolean;
  ignoreSSNCalculation: boolean;
  ignoreMedicareCalculation: boolean;
}

// Get Fedral Tax With Holding
export interface GetFedralTaxWithHolding {
  errorCode: number;
  errorMessage: string;
  result: GetFedralTaxWithHoldingResult;
}

// Get Fedral Tax With Holding Result
export interface GetFedralTaxWithHoldingResult {
  documentId: string;
  resourceTypeCode: number;
  resourceValue: string;
  displayName: string;
  fileLocation: string;
  fileExtension: string;
  uploadedDateTime: string;
  fileName: string;
  fileDescription: string;
  documentPurposeCode: number;
  creatorId: string;
  createdDateTime: string;
  lastUpdatedId: string;
  lastUpdatedDateTime: string;
  contentType: string;
  documentPurpose: string;
  encryptionFlag: boolean;
  documentStream: string;
  documentBytes: string;
  readFeatureId: string;
  writeFeatureId: string;
  signatureImage: string;
}
// Step1
export interface FilingStatus {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  federalFilingStatusCode: number;
  federalFilingStatus?: string;
}
// Step2
export interface MultipleJobs {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  estimateWithIRS: boolean;
  useMultipleJobWorkSheet: boolean;
  onlyUseTwoJobs: boolean;
  multipleJobs: boolean;

  twoJobsAmount: number;
  threeJobsAmount: number;
  threeJobs2aAmount: number;
  threeJobs2bAmount: number;
  threeJobs2cAmount: number;
  numberOfPayPeriods: number;
  amountPerPayPeriod: number;
}
// Step3
export interface ClaimDependents {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  numberOfChildren: number;
  numberOfDependents: number;
  childrenClaimAmount: number;
  dependentClaimAmount: number;
  totalClaimAmount: number;
}
// Step4
export interface OtherAdjustments {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  otherIncome: number;
  hasDeductions: boolean;
  numberOfDeductions: number;
  deductionAmount: number;
  deduction1Amount: number;
  deduction2Amount: number;
  deductionDifferenceAmount: number;
  adjustmentAmount: number;
  totalDeductionAmount: number;
  additionalTaxAmount: number;
}
// Sign
export interface GenerateW4 {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  candidateSignature?: File;
  candidateSignatureId: string | null;
}
// State Tax
export interface StateTax {
  taxInformationId?: string;
  employeeOnboardingId?: string;
  stateFilingstatusCode: number;
  stateFilingStatus: string;
  workedState: number;
  exemptionInWorkedState: number;
  livedInState: number;
  exemptionsInLivedInState: number;
  totalExemptionsForAgeOrBlind: number;
  stateAdditionalTaxAmount: number;
  suisdiTaxCode: number;
  suisdiTax: string;
  stateUnemploymentInsuranceSUI: boolean;
  workedinCity: string;
  exemptionsInWorkedCity: number;
  livedInCity: string;
}

// Get Rejection Email Content Response
export interface GetRejectionEmailContentResponse {
  errorCode: number;
  errorMessage: string;
  result: GetRejectionEmailContentResult;
}

// Get Rejection Email Content Result
export interface GetRejectionEmailContentResult {
  employeeOnboardingId: string;
  candidateId: string;
  candidateJobRequirementId: string;
  to: string[];
  subject: string;
  body: string;
  attachments?: string;
}

// EAD Info
export interface EADInfo {
  eadCode: string;
  eadName: string;
  eadDescription: string;
}
