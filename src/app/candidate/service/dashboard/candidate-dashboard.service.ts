import {
  HttpParams,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  DashboardAssignmentsResponse,
  DashboardProfileInfoResponse,
} from '../../../shared/interface/generic-dashboard.interface';
import {
  SaveUserInfo,
  ValidatePersonInfo,
  ValidatePersonInfoResponse,
} from '../../interface/dashboard/candidate-dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class CandidateDashboardService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  /* CANDIDATE ASSIGNMENTS */
  getCandidateAssignmentsByAssigneeId(
    assigneeId: string
  ): Observable<DashboardAssignmentsResponse> {
    const httpParams = new HttpParams().set('assigneeId', assigneeId);
    const url = `${this.baseUrl}/Assignment/GetByAssigneeId`;
    return this.httpClient
      .get<DashboardAssignmentsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  /* BASICINFO */
  getBasicInfoByUserId(
    personType: string,
    userId: string
  ): Observable<DashboardProfileInfoResponse> {
    const url = `${this.baseUrl}/${personType}/BasicInfoByUserId/${userId}`;
    return this.httpClient
      .get<DashboardProfileInfoResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // TERMS & CONDITIONS
  // tslint:disable-next-line: no-any
  getTermsAndConditionsTemplate(): Observable<any> {
    const url = `${this.baseUrl}/user/tnc`;
    return this.httpClient
      .get(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Validate Token
  // tslint:disable-next-line: no-any
  termCondValidateToken(token: string): Observable<any> {
    const url = `${this.baseUrl}/User/ValidateToken`;
    return this.httpClient
      .post(`${url}`, { token })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Validate Person
  validatePerson(
    validatePersonInfo: ValidatePersonInfo
  ): Observable<ValidatePersonInfoResponse> {
    const httpParams = new HttpParams()
      .set('firstName', validatePersonInfo.firstName)
      .set('lastname', validatePersonInfo.lastName)
      .set('dob', validatePersonInfo.dob)
      .set('email', encodeURIComponent(validatePersonInfo.email))
      .set('countryCode', validatePersonInfo.countryCode)
      .set('phone', validatePersonInfo.phone)
      .set('token', validatePersonInfo.token);

    const url = `${this.baseUrl}/person/validatePerson`;
    return this.httpClient
      .get<ValidatePersonInfoResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Create Password
  // tslint:disable-next-line: no-any
  saveUserAndCreatePassword(saveUserInfo: SaveUserInfo): Observable<any> {
    const url = `${this.baseUrl}/User/register`;
    return this.httpClient
      .post<SaveUserInfo>(`${url}`, saveUserInfo)
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  rejectTermsAndConditions(token: string): Observable<any> {
    const url = `${this.baseUrl}/User/RejectTerms`;
    return this.httpClient
      .post(`${url}`, { token })
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
