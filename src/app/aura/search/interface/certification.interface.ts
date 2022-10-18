import { DocumentInformation } from '../../../shared/interface/document-info.interface';

// CertificationResponse interface
export interface CertificationResponse {
  errorCode: number;
  errorMessage: string;
  result: CertificationResult[];
}

// CertificationResult
export interface CertificationResult {
  certificationId?: string;
  personId: string;
  certificationName: string;
  certificationCode: string;
  certificateSerialNumber: string;
  certifyingAgencyId: string;
  certifyingAgency?: string;
  certifyingAgencyDomain?: string;
  issuedDate: string;
  expiryDate: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
  inActiveDate?: string;
  certificationStatusCode: number;
  certificationStatus?: string;
  documents?: DocumentInformation[];
  isNewDocument: boolean;
  resourceTypeCode: number;
  documentPurposeCode: number;
}

export interface CertificationAddEditRecord {
  certificationId: string;
  personId: string;
  certificationName: string;
  certificationCode: string;
  certificateSerialNumber: string;
  certifyingAgencyId: string;
  certifyingAgency: string;
  certifyingAgencyDomain: string;
  issuedDate: string;
  expiryDate: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
  inActiveDate?: string;
  certificationStatusCode: number;
  certificationStatus: string;
  documents?: DocumentInformation[];
}

// CertificationAddPopupRecord
export interface CertificationAddPopupRecord {
  action: string;
  personId: string;
  certificationData: CertificationResult[];
  mapCertificationAgency: Map<string, string>;
}

// CertificationEditPopupRecord
export interface CertificationEditPopupRecord {
  action: string;
  personId: string;
  certificationData: CertificationResult;
  mapCertificationAgency: Map<string, string>;
}
