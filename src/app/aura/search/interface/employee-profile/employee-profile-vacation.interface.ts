// EmployeePTOSummaryResponse interface
export interface EmployeePTOSummaryResponse {
 errorCode: number;
 errorMessage: string;
 result: EmployeePTOSummaryResult;
}

// EmployeePTOSummaryResult
export interface EmployeePTOSummaryResult {
 availableHours: number;
 accuredHours: number;
 consumedHours: number;
 approvalPendingHours: number;
}

// EmployeeVacationHistoryResponse interface
export interface EmployeeVacationHistoryResponse {
 errorCode: number;
 errorMessage: string;
 result: EmployeeVacationHistoryResult;
}

// EmployeeVacationHistoryResult
export interface EmployeeVacationHistoryResult {
 virtualCount: number;
 results: EmployeeVacations[];
}

// EmployeeVacations
export interface EmployeeVacations {
 fromDate: string;
 toDate: string;
 hours: number;
 leaveType: string;
 status: string;
 approvedBy: string;
 appliedDate: string;
 approvedDate: string;
 comments: string;
}

// EmployeeTimeSheetEntries
export interface EmployeeTimeSheetEntries {
 timeSheetId: string;
 employeeId: string;
 startDate: string;
 endDate: string;
 comments: string;
 timeSheetStatusCode: number;
 submittedOn: string;
 timesheetFrequencyCode: number;
 creatorId: string;
 createdDateTime: string;
 lastUpdateId: string;
 lastUpdateDateTime: string;
 inActiveDate: string;
}

export interface VacationTable {
 isLoading: boolean;
 columns: TblColumns[];
 displayedColumns: string[];
 tableData: EmployeeVacations[] | null;
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

// EmployeeVacationTimesheetResponse interface
export interface EmployeeVacationTimesheetResponse {
 errorCode: number;
 errorMessage: string;
 result: EmployeeVacationTimesheetResult;
}

// EmployeeVacationTimesheetResult
export interface EmployeeVacationTimesheetResult {
 result: EmployeeTimesheetDetails[];
}

// EmployeeTimesheetDetails
export interface EmployeeTimesheetDetails {
 entryDate: string;
 chargeCodeType: string;
 hours: number;
}
