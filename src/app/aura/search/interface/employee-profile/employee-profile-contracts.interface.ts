import { DocumentInformation } from '../../../../shared/interface/document-info.interface';

// EmployeePurchaseOrderResponse interface
export interface EmployeePurchaseOrderResponse {
  errorCode: number;
  errorMessage: string;
  result: EmployeePurchaseOrderResult[];
}
// EmployeePurchaseOrderResult
export interface EmployeePurchaseOrderResult {
  purchaseOrderId: string;
  clientId: string;
  msaId: string;
  employeeId: string;
  jobRequirementId: string;
  poStartDate: string;
  poEndDate: string;
  projectStartDate: string;
  projectEndDate: string;
  statusCode: number;
  salesPersonId: string;
  clientSignatoryContactId: string;
  clientSignatoryTitle: string;
  signedby: string;
  signedOnDate: string;
  billRate: number;
  billRateTypeCode: number;
  payFrequencyTypeCode: number;
  clientPOCId: string;
  clientInvoiceContactId: string;
  parentPOId: string;
  comment: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  closingComment: string;
  submissionId: string;
  closedOnDate: string;
  poClosingReasonTypeCode: number;
  timeSheetFrequencyTypeCode: number;
  invoiceFrequencyTypeCode: number;
  timesheetStartDate: string;
  endClientId: string;
  originalRate: number;
  consultantTypeCode: number;
  techTypeCode: number;
  poNumber: string;
  clientTimesheetFrequencyCode: number;
  rateChange: number;
  clientName: string;
  salesPersonName: string;
  endClientName: string;
  workLocation: string;
  interviewDate: string;
  submissionData: EmployeePurchaseOrderSubmissionData;
  confirmationDate: string;
  status: string;
  documents: DocumentInformation[];
}
// EmployeePurchaseOrderSubmissionData
interface EmployeePurchaseOrderSubmissionData {
  submissionId: string;
  jobRequirementId: string;
  profileId: string;
  submittedOn: string;
  submittedBy: string;
  submissionStatusCode: number;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  benchConsultantId: string;
  activeFlag: boolean;
  confirmedOn: string;
  closedOn: string;
  rejectedOn: string;
  closedReasonTypeCode: number;
  rejectedReasonTypeCode: number;
  submittedRate: number;
  submittedToEndClientOn: string;
  bcMarketingPriorityCode: number;
}

export interface FilteredPOList {
  key: string;
  poList: EmployeePurchaseOrderResult[];
}
