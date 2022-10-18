import { DocumentInformation } from '../../../../shared/interface/document-info.interface';
import { PersonData } from '../person.interface';

// CandidateProfileResponse interface
export interface CandidateProfileResponse {
  errorCode: number;
  errorMessage: string;
  result: CandidateProfileResult;
}

// CandidateProfileResult
export interface CandidateProfileResult {
  candidateId: string;
  workAuthorizationStatusCode: number;
  sourceTypeCode: number;
  candidateStatusCode: number;
  telecommuteFlag: boolean;
  relocationFlag: boolean;
  candidateCode: string;
  sourceInfo: string;
  candidateTypeCode: number;
  workExperience: number;
  jobAppliedFor: string;
  availabilityCode: number;
  employmentTypeCode: number;
  personData: PersonData;
  workAuthorizationStatus: string;
  candidateProfilePhotoId: string;
  candidateType: string;
  recruiterName: string;
  availability: string;
  employmentType: string;
  sourceType: string;
  resumeDocument: DocumentInformation;
  candidateStatus: string;
  resumeDocumentId: string;
}

// CandidateEditProfilePopupData interface
export interface CandidateEditProfilePopupData {
  action: string;
  profileData: CandidateProfileResult;
  profileSrc: string;
}

// CandidateEditProfilePhotoUpload interface
export interface CandidateEditProfilePhotoUpload {
  documentInfo: File;
  displayName: string;
  documentPurposeCode: string;
  documentId: string;
  resourceValue: string;
  resourceTypeCode: string;
  isOverwrite: string;
}
