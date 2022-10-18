import { DocumentInformation } from '../../../shared/interface/document-info.interface';

// SSNResponse interface
export interface SSNResponse {
  errorCode: number;
  errorMessage: string;
  result: SSNResult;
}

// SSNResult
export interface SSNResult {
  personId: string;
  socialSecurityNumber: string;
  documents?: DocumentInformation[];
  isNewDocument?: boolean;
  resourceTypeCode?: number;
  documentPurposeCode?: number;
}
