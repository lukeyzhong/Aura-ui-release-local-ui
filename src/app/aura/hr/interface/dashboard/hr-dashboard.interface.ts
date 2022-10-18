import { TableColumns } from '../../../search/interface/table.interface';

// Response chart
export interface ChartResponse {
  errorCode: number;
  errorMessage: string;
  result: ChartResponseData;
}

// ChartResponseData results
export interface ChartResponseData {
  totalActiveEmployeesCount: number;
  totalNewEmployeeCount: number;
  totalAttritedEmployeeCount: number;
  result: ChartResult[];
}

// chart result
export interface ChartResult {
  month: number;
  activeEmployeeCount: number;
  newEmployeeCount: number;
  attritedEmployeeCount: number;
}

export interface PayrollMapByPayDate {
  [payDate: string]: PayrollCalendarResult;
}

// PayrollCalendarResponse interface
export interface PayrollCalendarResponse {
  errorCode: number;
  errorMessage: string;
  result: PayrollCalendarResult[];
}

// PayrollCalendarResult
export interface PayrollCalendarResult {
  payperiodId: string;
  year: number;
  payperiodNumber: number;
  startDate: string;
  endDate: string;
  payDate: string;
  lastDayToSubmit: string;
}
export interface PayrollCalendarInfo {
  monthStartDate: Date;
}
export interface PayRollConfig {
  isLoading: boolean;
  columns: TableColumns[];
  displayedColumns: string[];
  tableData: PayrollCalendarResult[] | null;
  totalRows: number;
}

// Payroll Data
export interface PayrollData {
  id?: number;
  payMonth: string;
  payDate: number;
  payDay: string;
  subDate: string;
}

// Response AnniversariesBirthdays
export interface AnniversariesBirthdaysResponse {
  errorCode: number;
  errorMessage: string;
  result: AnniversaryBirthdayData[];
}

// AnniversaryBirthday Data
export interface AnniversaryBirthdayData {
  employeeId?: string;
  profilePicDocumentId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  alias: string;
  email: string;
  phone: string;
  totalHoursWorked?: number;
  dateOfBirth?: string;
  startDate: string;
  yearsCompleted?: number;
  displayPictureBase64: string;
  month?: string;
}

// AnniversaryBirthday Details
export interface AnniversaryBirthdayDetails {
  name: string;
  lname: string;
  date: string;
  month: string;
  years?: number;
  image: string;
}

// Response Holidays
export interface HolidaysResponse {
  errorCode: number;
  errorMessage: string;
  result: HolidaysResultData[];
}

// Holidays Result Data
export interface HolidaysResultData {
  holidayId: string;
  name: string;
  description: string;
  date: string;
  inActiveDate: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  adminInactivateFlag: boolean;
  lastUpdatedDateTime: string;
}

// Holidays Data
export interface HolidaysData {
  id?: number;
  name: string;
  month: string;
  date: number;
  day: string;
  fDate: string;
}

// HolidaysPopupData interface
export interface HolidaysPopupData {
  holidaysData: HolidaysData[];
  name: string;
  month: string;
  date: number;
  day: string;
  index: number;
}

// Response charts popup screen response
export interface ChartsPopupScreenResponse {
  errorCode: number;
  errorMessage: string;
  result: ChartsPopupScreenData;
}

// Charts Popup Screen Data
export interface ChartsPopupScreenData {
  totalCount: number;
  result: ChartsPopupScreenResult[];
}

// Charts Popup Screen Result
export interface ChartsPopupScreenResult {
  code: number;
  description: string;
  count: number;
}

// Chart Get All Active Employees Response
export interface ChartGetAllActiveEmpResponse {
  errorCode: number;
  errorMessage: string;
  result: ChartGetAllActiveEmpData;
}

// Chart Get All Active Employees Data
export interface ChartGetAllActiveEmpData {
  virtualCount: number;
  results: ChartGetAllActiveEmpResults[];
}

// Chart Get All Active Employees Results
export interface ChartGetAllActiveEmpResults {
  employeeId?: string;
  personId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workAuthorizationStatusCode?: number;
  workAuthorizationStatus: string;
  employmentTypeCode?: number;
  employmentType: string;
  startDate: string;
  projectStartDate: string;
  recruiterId?: string;
  recruiterName: string;
  salesPersonId?: string;
  salesPerson: string;
  clientId?: string;
  client: string;
  endClientId?: string;
  endClient: string;
}

// Chart Get New Hire Employees Response
export interface ChartGetNewHireEmpResponse {
  errorCode: number;
  errorMessage: string;
  result: ChartGetNewHireEmpData;
}

// Chart Get New Hire Employees Data
export interface ChartGetNewHireEmpData {
  virtualCount: number;
  results: ChartGetNewHireEmpResults[];
}

// Chart Get New Hire Employees Results
export interface ChartGetNewHireEmpResults {
  employeeId?: string;
  personId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workAuthorizationStatusCode?: number;
  workAuthorizationStatus: string;
  employmentTypeCode?: number;
  employmentType: string;
  employmentStartDate: string;
  recruiterId?: string;
  recruiterName: string;
  nationality: string;
}

// Chart Attrition Employees Response
export interface ChartGetAttritionEmpResponse {
  errorCode: number;
  errorMessage: string;
  result: ChartGetAttritionEmpData;
}

// Chart Get Attrition Employees Data
export interface ChartGetAttritionEmpData {
  virtualCount: number;
  results: ChartGetAttritionEmpResults[];
}

// Chart Get Attrition Employees Results
export interface ChartGetAttritionEmpResults {
  employeeId?: string;
  personId?: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workAuthorizationStatusCode?: number;
  workAuthorizationStatus: string;
  employmentStartDate: string;
  resignDate: string;
  recruiterId?: string;
  recruiterName: string;
  salesPersonId?: string;
  salesPerson: string;
  clientId?: string;
  client: string;
  endClientId?: string;
  endClient: string;
  addressId?: string;
  address?: string;
  projectStartDate: string;
  projectEndDate: string;
  nationality?: string;
}

// Get Task Response
export interface GetTaskResponse {
  errorCode: number;
  errorMessage: string;
  result: GetTaskData;
}

// Get Task Data
export interface GetTaskData {
  virtualCount: number;
  results: GetTaskResults[];
}

// Get Task Results
export interface GetTaskResults {
  assignmentId?: string;
  code: string;
  title: string;
  assignedTo: string;
  assignedToId: string;
  assignedBy: string;
  createdOn: number;
  assignedOn?: string;
  dueOn: string;
  status: string;
}

// Dashboard Onboarding Response
export interface DashboardOnboardingResponse {
  errorCode: number;
  errorMessage: string;
  result: DashboardOnboardingResultData;
}

// DashboardOnboarding Result Data
export interface DashboardOnboardingResultData {
  virtualCount: number;
  results: DashboardOnboardingResults[];
}

// DashboardOnboarding Results
export interface DashboardOnboardingResults {
  employeeOnboardingId: string;
  candidateCode: string;
  candidateJobRequirementId: string;
  candidateId: string;
  lastName: string;
  firstName: string;
  fullName: string;
  email: string;
  jobTitle: string;
  statusCode: number;
  status: string;
  comments: string;
  inviteDate: string;
  progress: number;
  dueDate: string;
  actionDate: string;
  displayPictureDocumentId: string;
  displayPictureBase64: string;
  recruiterId: string;
  recruiterName: string;
  actionBy: string;
}
export interface DetailsConfig {
  isLoading: boolean;
  columns: TableColumns[];
  displayedColumns: string[];
  // tslint:disable-next-line: no-any
  tableData: any[] | null;
  totalRows: number;
}

export interface OnBoardStatus {
  Key: string;
  Value: string;
}

// Response ADP
export interface ADPResponse {
  errorCode: number;
  errorMessage: string;
  result: ADPResponseData;
}

// ADP Response Data results
export interface ADPResponseData {
  virtualCount: number;
  results: ADPResults[];
}

// ADP Results
export interface ADPResults {
  employeeCode: string;
  adpOnboardingId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  statusCode: number;
  status: string;
  employeeOnboardingId: string;
  associateOId: string;
  applicantId: string;
  fileNumber: string;
  positionID: string;
  additionalInfo: string;
  failedDate: string;
  hireDate: string;
}

// Response USCIS
export interface USCISResponse {
  errorCode: number;
  errorMessage: string;
  result: USCISResponseData;
}

// USCIS Response Data results
export interface USCISResponseData {
  virtualCount: number;
  results: USCISResults[];
}

// USCIS Results
export interface USCISResults {
  employeeId: string;
  employeeOnboardingId: string;
  employeeCode: string;
  fullName: string;
  uscisCaseNumber: string;
  caseResults?: string;
  hireDate: string;
  status?: string;
  submittedOn: string;
  document?: string;
  documentExpiryDate?: string;
  eligibilityStatement?: string;
}

// Data For Counts DataGrids
export interface CountsDataGridsResponseData {
  errorCode: number;
  errorMessage: string;
  result: CountsDataGridsResultData;
}

export interface CountsDataGridsResultData {
  virtualCount: number;
  results: CountsDataGridsResults[];
}

export interface CountsDataGridsResults {
  employeeId: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  employmentType: string;
  issueDate: string;
  expiryDate: string;
  displayPictureBase64: string;
}

