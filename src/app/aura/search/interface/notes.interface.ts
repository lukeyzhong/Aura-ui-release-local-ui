import { DocumentRequest } from '../../../shared/interface/document-info.interface';

// NotesResponse interface
export interface NotesResponse {
  errorCode: number;
  errorMessage: string;
  result: NotesResult[];
}

// NotesResult
export interface NotesResult {
  commentId?: string;
  commentTypeCode: number;
  resourceTypeCode: number;
  resourceValue: string;
  comment: string;
  createdDateTime?: string;
  userId?: string;
  commentType?: string;
  activityBy?: string;
}

export interface NotesAddRecord {
  commentTypeCode: number;
  resourceTypeCode: number;
  resourceValue: string;
  comment: string;
}

// NotesAddPopupRecord
export interface NotesAddPopupRecord {
  notesData: NotesResult[];
  id: string;
  personName: string;
}
