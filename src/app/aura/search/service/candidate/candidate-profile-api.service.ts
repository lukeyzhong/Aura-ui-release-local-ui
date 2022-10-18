import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  CandidateEditProfilePhotoUpload,
  CandidateProfileResponse,
  CandidateProfileResult
} from '../../interface/candidate-profile/candidate-profile-api.interface';
import { CandidateSubmissionResponse } from '../../interface/candidate-profile/candidate-submission-interface';

@Injectable({
  providedIn: 'root'
})
export class CandidateProfileApiService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) { }

  // Get Candidate Profile By CandidateId
  getCandidateProfileById(candidateId: string): Observable<CandidateProfileResponse> {
    const httpParams = new HttpParams().set('candidateId', candidateId);

    const url = `${this.baseUrl}/Candidate/getCandidateById`;
    return this.httpClient
      .get<CandidateProfileResponse>(`${url}`, {
        params: httpParams
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  updateCandidateProfile(canProfile: CandidateProfileResult): Observable<CandidateProfileResult> {
    const url = `${this.baseUrl}/candidate/Save`;
    return this.httpClient
      .post<CandidateProfileResult>(`${url}`, canProfile, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  uploadCandidateProfilePhoto(
    empProfilePhoto: File,
    displayName: string,
    documentPurposeCode: string,
    documentId: string,
    personId: string,
    resourceTypeCode: string,
    isOverwrite: string,
    isNewDocument: string
  ): Observable<CandidateEditProfilePhotoUpload> {
    const url = `${this.baseUrl}/Document/SaveDocument`;
    const formData = new FormData();
    formData.append('documents[0].DocumentInfo', empProfilePhoto);
    formData.append('documents[0].DisplayName', displayName);
    formData.append('documents[0].DocumentPurposeCode', documentPurposeCode);
    if (isNewDocument === 'false') {
      formData.append('documents[0].DocumentId', documentId);
    }
    formData.append('documents[0].ResourceValue', personId);
    formData.append('documents[0].ResourceTypeCode', resourceTypeCode);
    formData.append('documents[0].IsOverwrite', isOverwrite);
    formData.append('documents[0].IsNewDocument', isNewDocument);
    return this.httpClient
      .post<CandidateEditProfilePhotoUpload>(`${url}`, formData)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCandidateSubmissionByPersonId(personId: string, pageNum: number, pageSize: number,
                                   sortDirection: number, sortColumn: string, searchString: string):
    Observable<CandidateSubmissionResponse> {
    const httpParams = new HttpParams()
      .set('PersonId', personId)
      .set('pageNumber', pageNum.toString())
      .set('pageSize', pageSize.toString())
      .set('sortDirection', sortDirection.toString())
      .set('sortColumn', sortColumn)
      .set('searchString', searchString);
    const url = `${this.baseUrl}/submission/getbyPersonId`;
    return this.httpClient
      .get<CandidateSubmissionResponse>(`${url}`, {
        params: httpParams
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: typedef
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
