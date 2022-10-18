import { DocumentInformation } from '../../../shared/interface/document-info.interface';

// DrivingLicenseResponse interface
export interface DrivingLicenseResponse {
  errorCode: number;
  errorMessage: string;
  result: DrivingLicenseResult[];
}

// DrivingLicenseResult
export interface DrivingLicenseResult {
  drivingLicenseID?: string;
  personId: string;
  drivingLicenseNo: string;
  issueDate: string;
  expiryDate: string;
  location: LocationResult;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdatedId?: string;
  lastUpdateDateTime?: string;
  documents?: DocumentInformation[];
  isNewDocument: boolean;
  resourceTypeCode: number;
  documentPurposeCode: number;
}
export interface DrivingLicenseAddEditRecord {
  drivingLicenseID: string;
  personId: string;
  drivingLicenseNo: string;
  issueDate: string;
  expiryDate: string;
  location: LocationResult;
  documents?: DocumentInformation[];
}
export interface LocationResult {
  locationId?: string;
  locationTypeCode: number;
  resourceTypeCode: number;
  resourceValue?: string;
  city: string;
  stateCode: number;
  zip: string;
  zip4?: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdatedId?: string;
  lastUpdateDateTime?: string;
}

// DrivingLicenseAddPopupRecord
export interface DrivingLicenseAddPopupRecord {
  action: string;
  personId: string;
  drivingLicenseData: DrivingLicenseResult[];
}
// DrivingLicenseEditPopupRecord
export interface DrivingLicenseEditPopupRecord {
  action: string;
  personId: string;
  drivingLicenseData: DrivingLicenseResult;
}
