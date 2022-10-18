export interface ExceptionResponse {
  title: string;
  status: 500;
  detial: string;
}

export interface ProcessedResponse {
  // tslint:disable-next-line: no-any
  result: any;
  errorCode: number;
  errorMessage: string;
}
