import { TableColumns } from '../../search/interface/table.interface';

// AllUsersResponse interface
export interface AllUsersResponse {
  errorCode: number;
  errorMessage: string;
  result: AllUsersResult;
}

// AllUsersResult
export interface AllUsersResult {
  virtualCount: number;
  results: AllUsersResults[];
}

// AllUsersResults
export interface AllUsersResults {
  userId: string;
  userName: string;
  emailAddress: string;
  phoneNumber: string;
  countryCode: number;
  userType: string;
  firstName: string;
  lastName: string;
  personId: string;
  createdDateTime: string;
  status: string;
}

export interface AllUsersConfig {
  isLoading: boolean;
  columns: TableColumns[];
  displayedColumns: string[];
  tableData: AllUsersResults[] | null;
  totalRows: number;
}

export interface UserInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: UserInfoResult;
}
export interface UserInfoResult {
  fullName: string;
  email: string;
  phone: string;
  userType: string;
  createdDateTime: string;
  status: string;
}
