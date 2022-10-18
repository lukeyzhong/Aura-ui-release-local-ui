import {
  Addresses,
  ContactAddresses,
  PersonData,
} from '../../aura/search/interface/person.interface';
import { DocumentInformation } from './document-info.interface';

// DashboardAssignmentsResponse
export interface DashboardAssignmentsResponse {
  errorCode: number;
  errorMessage: string;
  result: DashboardAssignmentsResult[];
}
export interface DashboardAssignmentsResult {
  assignmentId: string;
  assignmentTypeCode: number;
  resourceTypeCode: number;
  resourceValue: string;
  assignedOnDate: string;
  assigneeId: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdatedId: string;
  lastUpdatedDateTime: string;
  assignmentStatusCode: number;
  assignmnetDueDate: string;
  closedOnDate: string;
  resourceCode: string;
  resourceTitle: string;
  additionalQueryString: string;
  startedOnDateTime: string;
  availableDateTime: string;
  roleId: string;
  assignmentType: string;
  assignmentStatus: string;
  url: string;
}

// DashboardProfileInfoResponse
export interface DashboardProfileInfoResponse {
  errorCode: number;
  errorMessage: string;
  result: DashboardProfileInfoResult;
}
export interface DashboardProfileInfoResult {
  // employee
  employeeId: string;
  onProject: boolean;
  employeeTitle: string;
  clientId: string;
  client: string;

  // candidate
  candidateId: string;
  jobTitle: string;

  // common
  personData: PersonData;
  personId: string;
  profilePhoto: DocumentInformation;
}
