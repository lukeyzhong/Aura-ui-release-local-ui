// GlobalSearchResultResponse interface
export interface GlobalSearchResultResponse {
  errorCode: number;
  errorMessage: string;
  result: GlobalSearchResult;
}

// GlobalSearchResult
export interface GlobalSearchResult {
  totalCount: number;
  EmployeeSearchList: EmployeeSearchList;
  CandidateSearchList: CandidateSearchList;
  JobSearchList: JobSearchList;
  OrganizationSearchList: OrganizationSearchList;
}
// EmployeeSearchList interface
export interface EmployeeSearchList {
  virtualCount: number;
  results: SearchResultEmployees[];
}

// CandidateSearchList interface
export interface CandidateSearchList {
  virtualCount: number;
  results: SearchResultCandidates[];
}

// JobSearchList interface
export interface JobSearchList {
  virtualCount: number;
  results: SearchResultJobs[];
}

// OrganizationSearchList interface
export interface OrganizationSearchList {
  virtualCount: number;
  results: SearchResultOrganizations[];
}

// SearchResultEmployees interface
export interface SearchResultEmployees {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  aliasName: string;
  email: string;
  phone: string;
  employeeCode: string;
  statusCode: string;
  jobTitle: string;
  employeeStatus: string;
  employeePhoto: string;
  city: string;
  state: string;
  country: string;
  photoId: string;
  department: string;
  reportingTo: string;
}

// SearchResultCandidates interface
export interface SearchResultCandidates {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  aliasName: string;
  candidateCode: string;
  email: string;
  phone: string;
  candidateStatus: string;
  candidatePhoto: string;
}

// SearchResultJobs interface
export interface SearchResultJobs {
  id: string;
  title: string;
  jobCode: string;
  jobDescription: string;
  status: string;
  department: string;
  subDepartment: string;
  jobStartDate: string;
  jobRecruitmentStart: string;
  employmentType: string;
  noOfPositions: number;
  postedOn: string;
  expiredOn: string;
  client: string;
}

// SearchResultOrganizations interface
export interface SearchResultOrganizations {
  id: string;
  name: string;
  noOfConsultants: number;
  ein: string;
  duns: string;
  status: string;
  domain: string;
}

// Global Search PopOver Details
export interface EmployeePopOverDetails {
  email: string;
  phone: string;
  reportingTo: string;
  department: string;
}

export interface CandidatePopOverDetails {
  email: string;
  phone: string;
  aliasName: string;
}

export interface JobPopOverDetails {
  noOfPositions: number;
  jobStartDate: string;
}

export interface OrganizationPopOverDetails {
  noOfConsultants: number;
  ein: string;
}
