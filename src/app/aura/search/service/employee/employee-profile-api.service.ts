import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  EmployeeEditProfilePhotoUpload,
  EmployeeProfileResponse,
  EmployeeProfileResult,
  EmployeeTermination,
  EVerifyInfoResponse,
} from '../../interface/employee-profile/employee-profile-api.interface';
import { EmployeeImmigrationResponse } from '../../interface/employee-profile/employee-profile-immigration.interface';
import {
  EmployeePTOSummaryResponse,
  EmployeeVacationHistoryResponse,
  EmployeeVacationTimesheetResponse,
} from '../../interface/employee-profile/employee-profile-vacation.interface';
import { EmployeePurchaseOrderResponse } from '../../interface/employee-profile/employee-profile-contracts.interface';
import { DocumentInformation } from '../../../../shared/interface/document-info.interface';
import { GetCaseData } from '../../../../shared/interface/candidate-onboarding-workflow.interface';

@Injectable({
  providedIn: 'root',
})
export class EmployeeProfileApiService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  // Get Employee Profile By EmployeeId
  getEmployeeProfileById(
    employeeId: string
  ): Observable<EmployeeProfileResponse> {
    const httpParams = new HttpParams().set('EmployeeId', employeeId);

    const url = `${this.baseUrl}/Employee/getbyId`;
    return this.httpClient
      .get<EmployeeProfileResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  updateEmployeeProfile(
    empProfile: EmployeeProfileResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Employee/save`;
    return this.httpClient
      .post<EmployeeProfileResult>(`${url}`, empProfile, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // uploadEmployeeProfilePhoto()
  uploadEmployeeProfilePhoto(
    docInfo: File,
    displayName: string,
    documentPurposeCode: string,
    documentId: string = '',
    resourceValue: string,
    resourceTypeCode: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const profileDocData = new FormData();

    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].DocumentInfo`,
      docInfo
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].ResourceTypeCode`,
      resourceTypeCode
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].ResourceValue`,
      resourceValue
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].DisplayName`,
      displayName
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].FileDescription`,
      displayName
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].DocumentPurposeCode`,
      documentPurposeCode
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].IsNewDocument`,
      documentId ? 'false' : 'true'
    );
    if (documentId) {
      profileDocData.append(
        `DocumentRequest.ReplacedDocuments[0].DocumentId`,
        documentId
      );
    }
    return this.httpClient.put<string>(
      `${this.baseUrl}/Document/update`,
      profileDocData
    );
  }

  getImmigrationByPersonId(
    personId: string
  ): Observable<EmployeeImmigrationResponse> {
    const url = `${this.baseUrl}/Immigration/getbypersonid/${personId}`;
    return this.httpClient
      .get<EmployeeImmigrationResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getPTOSummaryEmpId(empId: string): Observable<EmployeePTOSummaryResponse> {
    const url = `${this.baseUrl}/vacation/ptosummary/${empId}`;
    return this.httpClient
      .get<EmployeePTOSummaryResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getVacationHistoryEmpId(
    empId: string,
    pageNum: number,
    pageSize: number
  ): Observable<EmployeeVacationHistoryResponse> {
    const httpParams = new HttpParams()
      .set('employeeid', empId)
      .set('pageNumber', pageNum.toString())
      .set('pageSize', pageSize.toString());
    const url = `${this.baseUrl}/vacation/GetVacationHistoryByEmployeeId`;
    return this.httpClient
      .get<EmployeeVacationHistoryResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getTimesheetEmpId(
    empId: string,
    startDate: string,
    endDate: string
  ): Observable<EmployeeVacationTimesheetResponse> {
    const httpParams = new HttpParams()
      .set('vacationDataRequest.EmployeeId', empId)
      .set('vacationDataRequest.StartDate', startDate)
      .set('vacationDataRequest.EndDate', endDate);
    const url = `${this.baseUrl}/timesheet/getCurrentPTO_TS_Stat`;
    return this.httpClient
      .get<EmployeeVacationTimesheetResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  uploadEmployeeImmigrationRecord(
    actionType: string,
    newFileAddedCount: number,
    personId: string,
    immigrationInfoId: string,
    workAuthorizationTypeCode: string,
    workAuthorizationNumber: string,
    workAuthorizationStartDate: string,
    workAuthorizationExpiryDate: string,
    prevailingWage: string,
    eadCategoryCode: number,
    eadCategory: string,
    documentPurposeCode: string,
    resourceTypeCode: string,
    isNewDocument: boolean,
    docAddFileDescription: string[],
    docAddDisplayName: string[],
    docAddFile: File[],
    docUpdateId: string[],
    docUpdateDisplayName: string[],
    docUpdateFileDescription: string[],
    docDeleteId: string[]
  ): Observable<EmployeeEditProfilePhotoUpload> {
    const formData = new FormData();
    if (immigrationInfoId) {
      formData.append('ImmigrationInfoId', immigrationInfoId);
    }
    formData.append('PersonId', personId);
    formData.append('WorkAuthorizationTypeCode', workAuthorizationTypeCode);
    formData.append('WorkAuthorizationNumber', workAuthorizationNumber);
    formData.append('WorkAuthorizationStartDate', workAuthorizationStartDate);
    formData.append('WorkAuthorizationExpiryDate', workAuthorizationExpiryDate);
    if (prevailingWage) {
      formData.append('PrevailingWage', prevailingWage);
    }
    if (eadCategoryCode) {
      formData.append('eadCategoryCode', eadCategoryCode.toString());
    }
    if (eadCategory) {
      formData.append('eadCategory', eadCategory);
    }
    if (newFileAddedCount > 0) {
      switch (actionType) {
        case 'Add':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              formData.append(
                `Documents[${i}].IsNewDocument`,
                isNewDocument.toString()
              );
              formData.append(
                `Documents[${i}].ResourceTypeCode`,
                resourceTypeCode
              );
              formData.append(
                `Documents[${i}].FileDescription`,
                docAddFileDescription[i]
              );
              formData.append(
                `Documents[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              formData.append(
                `Documents[${i}].DocumentPurposeCode`,
                documentPurposeCode
              );
              formData.append(`Documents[${i}].DocumentInfo`, docAddFile[i]);
            }
          }
          break;

        case 'Edit':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              formData.append(
                `DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
                isNewDocument.toString()
              );
              formData.append(
                `DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
                resourceTypeCode
              );
              formData.append(
                `DocumentsData.ReplacedDocuments[${i}].FileDescription`,
                docAddFileDescription[i]
              );
              formData.append(
                `DocumentsData.ReplacedDocuments[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              formData.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
                documentPurposeCode
              );
              formData.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
                docAddFile[i]
              );
            }
          }
          break;
      }
    }

    if (docUpdateId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docUpdateId.length; i++) {
        formData.append(
          `DocumentsData.ReNamedDocuments[${i}].DocumentId`,
          docUpdateId[i]
        );
        formData.append(
          `DocumentsData.ReNamedDocuments[${i}].NewName`,
          docUpdateDisplayName[i]
        );
        formData.append(
          `DocumentsData.ReNamedDocuments[${i}].NewDescription`,
          docUpdateFileDescription[i]
        );
      }
    }

    if (docDeleteId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docDeleteId.length; i++) {
        formData.append(`DocumentsData.DeletedDocuments[${i}]`, docDeleteId[i]);
      }
    }
    let url!: Observable<EmployeeEditProfilePhotoUpload>;
    switch (actionType) {
      case 'Add':
        url = this.httpClient
          .post<EmployeeEditProfilePhotoUpload>(
            `${this.baseUrl}/Immigration/add`,
            formData
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
      case 'Edit':
        url = this.httpClient
          .put<EmployeeEditProfilePhotoUpload>(
            `${this.baseUrl}/Immigration/update`,
            formData
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
    }

    return url;
  }

  // Get Contracts/PurchaseOrder By EmployeeId
  getPurchaseOrderByEmployeeId(
    employeeId: string
  ): Observable<EmployeePurchaseOrderResponse> {
    const url = `${this.baseUrl}/PurchaseOrder/GetPOs/${employeeId}`;
    return this.httpClient
      .get<EmployeePurchaseOrderResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Terminate Employee
  terminateEmployeeProfile(
    empTermination: EmployeeTermination
  ): Observable<EmployeeTermination> {
    const url = `${this.baseUrl}/Employee/terminate`;
    return this.httpClient
      .post<EmployeeTermination>(`${url}`, empTermination)
      .pipe(retry(1), catchError(this.handleError));
  }

  // I-9 & E-Verify
  getDocumentsByPurposeIds(
    resourceTypeCode: string,
    employeeId: string,
    documentPurposeTypes: string
  // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('resourceTypeCode', resourceTypeCode)
      .set('resourceId', employeeId)
      .set('documentPurposeTypes', documentPurposeTypes);
    const url = `${this.baseUrl}/Document/DocumentsByPurposeIds`;
    return this.httpClient
      // tslint:disable-next-line: no-any
      .get<any>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getEVerifyInfoByEmployeeId(employeeId: string): Observable<EVerifyInfoResponse> {
    const url = `${this.baseUrl}/Employee/EVerifyInfo/${employeeId}`;
    return this.httpClient
      .get<EVerifyInfoResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  getCrdByEmployeeId(employeeId: string): Observable<any> {
    const httpParams = new HttpParams().set('employeeId', employeeId);
    const url = `${this.baseUrl}/Employee/get-crd`;
    return this.httpClient
      // tslint:disable-next-line: no-any
      .get<any>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getUSCISRetrieveByCaseNumber(caseNumber: string): Observable<GetCaseData> {
    const httpParams = new HttpParams().set('caseNumber', caseNumber);
    const url = `${this.baseUrl}/USCIS/retrieve-case`;
    return this.httpClient
      .get<GetCaseData>(`${url}`, {
        params: httpParams,
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
