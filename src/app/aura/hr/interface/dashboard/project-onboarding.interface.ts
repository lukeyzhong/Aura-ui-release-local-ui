import { TableColumns } from '../../../search/interface/table.interface';

// ProjectOnboardingResponse interface
export interface ProjectOnboardingResponse {
  errorCode: number;
  errorMessage: string;
  result: ProjectOnboardingResult;
}

// ProjectOnboardingResult
export interface ProjectOnboardingResult {
  virtualCount: number;
  results: ProjectOnboardingResults[];
}

// ProjectOnboardingResults
export interface ProjectOnboardingResults {
  employeeId: string;
  profilePicDocumentId: string;
  employeeCode: number;
  firstName: string;
  lastName: string;
  jobTitle: string;
  client: string;
  endClient: string;
  billRate: number;
  projectStartDate: string;
  workLocation: string;
  confirmedBy: string;
  displayPictureBase64: string;
}

export interface ProjectOnboardingConfig {
  isLoading: boolean;
  columns: TableColumns[];
  displayedColumns: string[];
  tableData: ProjectOnboardingResults[] | null;
  totalRows: number;
}

export enum FetchType {
  All = 0,
  Pagination = 1,
  LatestThree = 2,
}
