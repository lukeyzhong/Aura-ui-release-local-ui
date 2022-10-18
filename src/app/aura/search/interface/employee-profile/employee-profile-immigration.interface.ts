import { DocumentInformation } from '../../../../shared/interface/document-info.interface';

// EmployeeImmigrationResponse interface
export interface EmployeeImmigrationResponse {
  errorCode: number;
  errorMessage: string;
  result: EmployeeImmigrationResult[];
}

// EmployeeImmigrationResult
export interface EmployeeImmigrationResult {
  immigrationInfoId: string;
  personId: string;
  workAuthorizationTypeCode: number;
  workAuthorizationNumber: string;
  workAuthorizationStartDate: string;
  workAuthorizationExpiryDate: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  parentImmigrationInfoId: string;
  immigrationInfoTypeCode: number;
  prevailingWage: number;
  workAuthorizationType: string;
  immigrationInfoType: string;
  documents: DocumentInformation[];
  eadCategoryCode?: number;
  eadCategory: string;
  eadabbr?: string;
}

// EmployeeImmigrationAddEditRecord
export interface EmployeeImmigrationAddEditRecord {
  personId: string;
  immigrationInfoId?: string;
  workAuthorizationTypeCode: number;
  workAuthorizationType?: string;
  workAuthorizationNumber: string;
  workAuthorizationStartDate: string;
  workAuthorizationExpiryDate: string;
  immigrationInfoTypeCode?: number;
  action?: string;
  documents?: DocumentInformation[];
  isNewDocument?: boolean;
  resourceTypeCode?: number;
  documentPurposeCode: number;
  eadCategoryCode?: number;
  eadCategory: string;
  eadabbr?: string;
}

// ImmigrationAddPopupRecord
export interface ImmigrationAddPopupRecord {
  action: string;
  personId: string;
  immigrationData: EmployeeImmigrationResult[];
}

// ImmigrationEditPopupRecord
export interface ImmigrationEditPopupRecord {
  action: string;
  personId: string;
  immigrationData: EmployeeImmigrationResult;
}
