export interface GoogleMapKeyResponse {
  errorCode: number;
  errorMessage: string;
  result: GoogleMapKeyResult;
}
export interface GoogleMapKeyResult {
  masterControlsId: string;
  fieldName: string;
  fieldValue: string;
  category: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  inActiveDate: string;
}
