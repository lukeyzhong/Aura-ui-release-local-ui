import {
  HttpParams,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { LookupResultResponse } from '../../../shared/interface/lookup.interface';
import { environment } from '../../../../environments/environment';
import { AllFeaturesResponse } from '../interface/all-features.interface';
import {
  AllUsersResponse,
  UserInfoResponse,
} from '../interface/all-users.interface';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  getFeatureCategoryCode(): Observable<LookupResultResponse> {
    const url = `${environment.apiBaseUrl}/lookup/featurecategory`;

    return this.httpClient
      .get<LookupResultResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getAllFeaturesByFeatureCategoryCode(
    userId: string,
    code: number
  ): Observable<AllFeaturesResponse> {
    const httpParams = new HttpParams()
      .set('userId', userId)
      .set('featureCategoryCode', String(code));
    const url = `${this.baseUrl}/UserPermission/getByUserId`;
    return this.httpClient
      .get<AllFeaturesResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getAllFeatures(userId: string): Observable<AllFeaturesResponse> {
    const url = `${this.baseUrl}/UserPermission/getByUserId`;
    const httpParams = new HttpParams().set('userId', userId);
    return this.httpClient
      .get<AllFeaturesResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getAllUsers(
    pageNum: number = 1,
    pageSize: number = 10,
    searchTerm: string = '',
    fetchType: string = 'All',
    sortColumn: string = 'userName',
    sortDirection: number = 1
  ): Observable<AllUsersResponse> {
    let url = `${this.baseUrl}/user/GetAllUsers?fetchType=${fetchType}&pageSize=${pageSize}&pageNum=${pageNum}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
    if (searchTerm.length > 0) {
      url += `&searchTerm=${searchTerm}`;
    }
    return this.httpClient
      .get<AllUsersResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getUserInfo(userId: string): Observable<UserInfoResponse> {
    const url = `${this.baseUrl}/user/info/${userId}`;

    return this.httpClient
      .get<UserInfoResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  saveUserPermission(userId: string, listAbbre: string[]): Observable<any> {
    const url = `${this.baseUrl}/UserPermission/save/${userId}`;

    return this.httpClient
      .post<string[]>(`${url}`, listAbbre)
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  activateUser(userId: string): Observable<any> {
    const url = `${this.baseUrl}/user/ActivateUser`;

    return this.httpClient
      .put(`${url}`, { userId })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  deactivateUser(userId: string): Observable<any> {
    const url = `${this.baseUrl}/user/DeActivateUser`;

    return this.httpClient
      .put(`${url}`, { userId })
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
