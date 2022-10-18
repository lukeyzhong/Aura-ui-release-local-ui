import { DocumentInformation } from '../../../shared/interface/document-info.interface';

// PassportResponse interface
export interface PassportResponse {
  errorCode: number;
  errorMessage: string;
  result: PassportResult[];
}

// PassportResult
export interface PassportResult {
  passportInfoId?: string;
  personId: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssueCountryCode: number;
  passportIssuedCity: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
  passportIssueCountry: string;
  documents?: DocumentInformation[];
  isNewDocument: boolean;
  resourceTypeCode: number;
  documentPurposeCode: number;
}

export interface PassportAddEditRecord {
  passportInfoId: string;
  personId: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  passportIssueCountryCode: number;
  passportIssuedCity: string;
  passportIssueCountry: string;
  documents?: DocumentInformation[];
}

// PassportAddPopupRecord
export interface PassportAddPopupRecord {
  action: string;
  personId: string;
  passportData: PassportResult[];
}
// PassportEditPopupRecord
export interface PassportEditPopupRecord {
  action: string;
  personId: string;
  passportData: PassportResult;
}
