import { DocumentInformation } from '../../../shared/interface/document-info.interface';

// EmployeeProfileResponse interface
export interface EducationResponse {
  errorCode: number;
  errorMessage: string;
  result: EducationResult[];
}

// EducationResult
export interface EducationResult {
  educationInfoId?: string;
  personId: string;
  degreeName?: string;
  universityName?: string;
  universityCountry?: string;
  degreeTypeCode: number;
  universityId: string;
  highestDegreeFlag: boolean;
  stemFlag?: boolean;
  startDate: string;
  endDate: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
  majorTypeCode: number;
  majorTypeCode1: string;
  majorType?: string;
  majorType1?: string;
  documents?: DocumentInformation[];
  isNewDocument: boolean;
  resourceTypeCode: number;
  documentPurposeCode: number;
}

export interface EducationAddEditRecord {
  educationInfoId: string;
  personId: string;
  degreeTypeCode: number;
  universityName?: string;
  stemFlag?: boolean;
  startDate: string;
  endDate: string;
  majorType?: string;
  majorType1?: string;
  documents?: DocumentInformation[];
}
// EducationAddPopupRecord
export interface EducationAddPopupRecord {
  action: string;
  personId: string;
  educationData: EducationResult[];
  mapUniversity: Map<string, string>;
  mapMajor: Map<string, string>;
  mapMajor1: Map<string, string>;
}
// EducationEditPopupRecord
export interface EducationEditPopupRecord {
  action: string;
  personId: string;
  educationData: EducationResult;
  mapUniversity: Map<string, string>;
  mapMajor: Map<string, string>;
  mapMajor1: Map<string, string>;
}
