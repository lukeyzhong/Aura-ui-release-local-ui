// CandidateSubmissionResponse interface
export interface CandidateSubmissionResponse {
    errorCode: number;
    errorMessage: string;
    result: CandidateSubmissionResult;
  }

// CandidateSubmissionResult
export interface CandidateSubmissionResult {
    virtualCount: number;
    results: CandidateSubmissionResults[];
  }

  // CandidateSubmissionResults
export interface CandidateSubmissionResults {
    submissionId: string;
    jobTitle: string;
    jobCode: string;
    jobDescription: string;
    vendorName: string;
    endClientName: string;
    consultantName: string;
    marketingName: string;
    profileName: string;
    clientPOCName: string;
    endClientLocation: string;
    techType: string;
    submittedOn: string;
    submittedBy: string;
    profileNameAlias: string;
    submissionStatusCode: number;
    endClientSubmissionBillRate: number;
    submittedToEndClientOn: string;
    rtrDocumentId: string;
    rtrDocumentName: string;
    rtrDocumentFileExtension: string;
    priorityTypeCode: number;
    priorityType: string;
    submissionStatus: string;
    clientSubmissionBillRate: number;
  }

export interface SubmissionTable {
    isLoading: boolean;
    columns: TblColumns[];
    displayedColumns: string[];
    tableData: CandidateSubmissionResults[] | null;
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
