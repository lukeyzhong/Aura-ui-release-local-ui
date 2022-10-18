// DocumentInformation
export interface DocumentInformation {
  documentId?: string;
  resourceTypeCode: number;
  resourceValue: string;
  displayName: string;
  fileLocation?: string;
  fileExtension?: string;
  uploadedDateTime?: string;
  fileName?: string;
  fileDescription: string;
  documentPurposeCode: number;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdatedId?: string;
  lastUpdatedDateTime?: string;
  contentType?: string;
  documentPurpose: string;
  encryptionFlag?: boolean;
  documentStream?: string;
  documentBytes?: string;
  readFeatureId?: string;
  writeFeatureId?: string;
  isNewDocument?: boolean;
  documentInfo?: File;
  signatureImage?: File;
}
export interface DocumentRequest {
  documents: DocumentInformation[];
  deletedDocuments?: string[];
  reNameDocuments?: RenameDocuments;
}
interface RenameDocuments {
  documentId: string;
  newName: string;
  newDescription: string;
}

export interface DownloadToExcelOrCSV {
  componentName?: string;
  downloadType: string;
  typeName: string;
  format: string;
  searchKey?: string;
  searchTerm?: string;
  key1?: string;
  value1?: string | Date | null;
  key2?: string;
  value2?: string | Date | null;
}

// my documents

export interface OnboardingMyDocumentsResponse {
  errorCode: number;
  errorMessage: string;
  result: OnboardingMyDocumentsResult[];
}
export interface OnboardingMyDocumentsResult {
  resourceId: string;
  resourceName: string;
  isTemplate: boolean;
  contentType: string;
  fileName: string;
  fileExtension: string;
}
