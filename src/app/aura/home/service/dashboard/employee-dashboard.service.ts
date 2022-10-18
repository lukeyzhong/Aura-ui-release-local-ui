import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { EmployeeChartsResponse, EmployeeTimesheetResponse, OfferDeclineInfoResponse, OnBoardStatus } from '../../interface/employee-dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class EmployeeDashboardService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) { }

  getEmployeeTimesheetByEmployeeIdAndStatus(
    employeeId: string,
    timeSheetStatusCode: number,
    pageNum: number,
    pageSize: number
  ): Observable<EmployeeTimesheetResponse> {
    const httpParams = new HttpParams()
      .set('EmployeeId', employeeId)
      .set('TimeSheetStatusCode', timeSheetStatusCode.toString())
      .set('pageNumber', pageNum.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.baseUrl}/TimeSheet/GetByTimeSheetStatusAndEmployeeId`;
    return this.httpClient
      .get<EmployeeTimesheetResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getEmployeeDashboardPTOCharts(
    empKey: string,
    empValue: string
  ): Observable<EmployeeChartsResponse> {
    const httpParams = new HttpParams()
      .set('widgetParams[0].Key', empKey)
      .set('widgetParams[0].Value', empValue);
    const url = `${this.baseUrl}/Statistics/GetDataForWidget/EmployeePTOHours`; 
    return this.httpClient
      .get<EmployeeChartsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getEmployeeDashboardTotalHoursWorkedCharts(
    yearKey: string,
    yearValue: string,
    empKey: string,
    empValue: string
  ): Observable<EmployeeChartsResponse> {
    const httpParams = new HttpParams()
      .set('widgetParams[0].Key', yearKey)
      .set('widgetParams[0].Value', yearValue)
      .set('widgetParams[1].Key', empKey)
      .set('widgetParams[1].Value', empValue);
    const url = `${this.baseUrl}/Statistics/GetDataForWidget/EmployeeTotalHoursWorkedByYear`;
    return this.httpClient
      .get<EmployeeChartsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getOfferDeclineInfo(
    employeeOnboardingId: string
  ): Observable<OfferDeclineInfoResponse> {
    const httpParams = new HttpParams()
      .set('employeeOnboardingId', employeeOnboardingId);
    const url = `${this.baseUrl}/Onboarding/GetOfferDeclineInfo`;
    return this.httpClient
      .get<OfferDeclineInfoResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  SaveOnboardingStatus(
    statusType: string,
    statusList: OnBoardStatus[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveOnboardingStatus/${statusType}`;

    return this.httpClient
      .post<string[]>(`${url}`, statusList)
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
