// EmployeeTimesheetResponse interface
export interface EmployeeTimesheetResponse {
  errorCode: number;
  errorMessage: string;
  result: EmployeeTimesheetResult;
}

// EmployeeTimesheetResult
export interface EmployeeTimesheetResult {
  virtualCount: number;
  results: EmployeeTimesheetResults[];
}

// EmployeeTimesheetResults
export interface EmployeeTimesheetResults {
  timeSheetId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  comments: string;
  timeSheetStatus: string;
  timesheetFrequency: string;
  submittedOn: string;
  approvedOn: string;
  rejectedOn: string;
}

export interface TimesheetTable {
  isLoading: boolean;
  columns: TblColumns[];
  displayedColumns: string[];
  tableData: EmployeeTimesheetResults[] | null;
  totalRows: number;
}

export interface TblColumns {
  headerDisplay: string;
  key: string;
}

export interface PageConfig {
  pageIndex: number;
  pageSize: number;
}

// Employee charts response
export interface EmployeeChartsResponse {
  errorCode: number;
  errorMessage: string;
  result: EmployeeChartsData;
}

// Employee Charts Data
export interface EmployeeChartsData {
  totalCount: number;
  result: EmployeeChartsResult[];
}

// Employee Charts Result
export interface EmployeeChartsResult {
  code: number;
  description: string;
  count: number;
}

// Offer Decline Info Response
export interface OfferDeclineInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: OfferDeclineInfoResult;
}

// Offer Decline Info Result
export interface OfferDeclineInfoResult {
  additionalComments: string;
  candidateCode: string;
  candidateId: string;
  candidateJobRequirementId: string;
  cellPhone: string;
  email: string;
  employeeOnboardingId: string;
  employeeTitle: string;
  firstName: string;
  homePhone: string;
  lastName: string;
  offerDeclineDate: string;
  offerSentDate: string;
  rejectionReasonCodes: number[];
}

export interface OnBoardStatus {
  Key: string;
  Value: string;
}



