import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  DownloadToExcelOrCSV,
  OnboardingMyDocumentsResponse,
} from '../../../shared/interface/document-info.interface';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  baseUrl = environment.apiBaseUrl;

  // tslint:disable-next-line: no-any
  private downloadSubject = new Subject<any>();

  getDownloadDetails(): Observable<DownloadToExcelOrCSV> {
    return this.downloadSubject.asObservable();
  }

  sendDownloadDetails(details: DownloadToExcelOrCSV): void {
    this.downloadSubject.next(details);
  }
  constructor(private httpClient: HttpClient) {}

  getDocumentFile(
    id?: string,
    docType: number = 0
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    let url = '';
    if (docType === 0) {
      url = `${this.baseUrl}/Document/GetDocumentFile/${id}/view`;
    } else if (docType === 40 || docType === 41) {
      url = `${this.baseUrl}/Document/GetResourceDocument/${docType}/${id}/view`;
    }

    return this.httpClient
      .get(`${url}`, { responseType: 'arraybuffer' as 'json' })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Onboarding My documents
  getOnboardingMyDocuments(
    id: string
    // tslint:disable-next-line: no-any
  ): Observable<OnboardingMyDocumentsResponse> {
    const httpParams = new HttpParams().set('employeeid', id);
    const url = `${this.baseUrl}/Employee/Documents`;

    return this.httpClient
      .get<OnboardingMyDocumentsResponse>(`${url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  // download all documents to zip
  downloadOnboardingAllDocuments(
    id: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set('employeeid', id);
    const url = `${this.baseUrl}/Employee/Documents/download`;

    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // No cache
  getDocument(
    id?: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Document/GetDocument/${id}/view`;

    return this.httpClient
      .get(`${url}`, { responseType: 'arraybuffer' as 'json' })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  downloadDocumentFile(id?: string, docType: number = 0): Observable<any> {
    let url = '';
    if (docType === 0) {
      url = `${this.baseUrl}/Document/GetDocumentFile/${id}/download`;
    } else if (docType === 40 || docType === 41) {
      url = `${this.baseUrl}/Document/GetResourceDocument/${docType}/${id}/download`;
    }
    return this.httpClient
      .get(`${url}`, { responseType: 'arraybuffer' as 'json' })
      .pipe(retry(1), catchError(this.handleError));
  }

  // DOWNLOAD TO EXCEL OR CSV - GENERIC
  downloadToExcelOrCSV(
    downloadType: string,
    typeName: string,
    format: string,
    searchKey: string,
    searchTerm: string,
    key1: string,
    value1: string | Date | null,
    key2: string,
    value2: string | Date | null
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchTerm)
      .set('inputParams[1].Key', key1)
      .set('inputParams[1].Value', String(value1))
      .set('inputParams[2].Key', key2)
      .set('inputParams[2].Value', String(value2));
    const url = `${this.baseUrl}/Statistics/download/${downloadType}/${typeName}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Project Onboarding
  mileStonesDownloadToExcelOrCSV(
    typeName: string,
    format: string,
    searchKey: string,
    searchTerm: string,
    key1: string,
    value1: string | Date | null,
    key2: string,
    value2: string | Date | null
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchTerm)
      .set('inputParams[1].Key', key1)
      .set('inputParams[1].Value', String(value1))
      .set('inputParams[2].Key', key2)
      .set('inputParams[2].Value', String(value2));
    const url = `${this.baseUrl}/Milestone/download/${typeName}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Payroll Calendar Download
  payrollCalendarDownloadToExcelOrCSV(
    format: string,
    year: number,
    month: number = 0
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    let httpParams;
    let url;
    if (month === 0) {
      httpParams = new HttpParams().set('year', String(year));

      url = `${this.baseUrl}/PayCalendar/download/${format}`;
    } else {
      httpParams = new HttpParams()
        .set('year', String(year))
        .set('month', String(month));

      url = `${this.baseUrl}/PayCalendar/download/${format}`;
    }
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
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
