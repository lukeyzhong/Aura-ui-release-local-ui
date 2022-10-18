import {
  DocumentRequest,
  DocumentInformation,
} from '../../../shared/interface/document-info.interface';

// EmploymentAgreementResponse interface
export interface EmploymentAgreementResponse {
  errorCode: number;
  errorMessage: string;
  result: DocumentInformation[];
}

// EmploymentAgreementResult
export interface EmploymentAgreementResult {
  id?: string;
  documentRequest?: DocumentRequest;
}

export interface EmploymentAgreementAddEditRecord {
  id: string;
  documentType: string;
  documentRequest?: DocumentRequest;
}
// EmploymentAgreementAddPopupRecord
export interface EmploymentAgreementAddPopupRecord {
  action: string;
  id: string;
  employmentAgreementData: EmploymentAgreementResult;
  mapDocType: Map<number, string>;
  title?: string;
  resourceTypeCode?: number;
}
// EmploymentAgreementEditPopupRecord
export interface EmploymentAgreementEditPopupRecord {
  action: string;
  id: string;
  docPurposeCode: number;
  mapDocType: Map<number, string>;
  documentInfo: DocumentInformation[] | DocumentInformation;
  title?: string;
  resourceTypeCode?: number;
}
