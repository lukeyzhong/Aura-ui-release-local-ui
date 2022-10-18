import {
  HttpParams,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  AllOnboardingDocumentsInfoResponse,
  CompensationInformationResponse,
  CompensationInformationResult,
  DocumentsInfoResult,
  EmploymentInformationResponse,
  EmploymentInformationResult,
  OfferLetterEmailContentResponse,
  OfferLetterEmailContentResult,
  OnboardingDetailsResponse,
  PersonalInformationResponse,
  PersonalInformationResult,
  PreviewInfoResponse,
  WebFormAllDocumentsInfoResponse,
  WebFormsAndDocumentsByPkgCodeResponse,
} from '../../interface/dashboard/candidate-onboarding.interface';

@Injectable({
  providedIn: 'root',
})
export class CandidateOnboardingService {
  baseUrl = environment.apiBaseUrl;

  // tslint:disable-next-line: no-any
  private pkgTypeSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private atsToAuraSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private piStateSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private eiWorkLocSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private jobTitleSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private emailSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private docSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private editPISubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  sendPkgTypeName(pkgType: any): void {
    this.pkgTypeSubject.next(pkgType);
  }
  // tslint:disable-next-line: no-any
  getPkgTypeName(): Observable<any> {
    return this.pkgTypeSubject.asObservable();
  }

  sendATSToAuraUpdate(status: boolean): void {
    this.atsToAuraSubject.next(status);
  }

  getATSToAuraUpdate(): Observable<boolean> {
    return this.atsToAuraSubject.asObservable();
  }

  sendUpdatedState(state: boolean): void {
    this.piStateSubject.next(state);
  }

  getUpdatedState(): Observable<boolean> {
    return this.piStateSubject.asObservable();
  }
  sendUpdatedWorkLocation(workLocation: boolean): void {
    this.eiWorkLocSubject.next(workLocation);
  }

  getUpdatedWorkLocation(): Observable<boolean> {
    return this.eiWorkLocSubject.asObservable();
  }

  sendUpdatedEmail(email: string): void {
    this.emailSubject.next({ email });
  }
  // tslint:disable-next-line: no-any
  getUpdatedEmail(): Observable<any> {
    return this.emailSubject.asObservable();
  }
  sendUpdatedJobTitle(jobTitle: string): void {
    this.jobTitleSubject.next({ jobTitle });
  }
  // tslint:disable-next-line: no-any
  getUpdatedJobTitle(): Observable<any> {
    return this.jobTitleSubject.asObservable();
  }
  sendDocsUpdated(status: boolean): void {
    this.docSubject.next({ status });
  }
  // tslint:disable-next-line: no-any
  getDocsUpdated(): Observable<any> {
    return this.docSubject.asObservable();
  }

  sendPIStatus(status: boolean): void {
    this.editPISubject.next({ status });
  }
  // tslint:disable-next-line: no-any
  getPIStatus(): Observable<any> {
    return this.editPISubject.asObservable();
  }

  constructor(private httpClient: HttpClient) {}

  /* PERSONAL INFORMATION */
  getOnboardingDetails(
    candidateJobRequirementId: string
  ): Observable<OnboardingDetailsResponse> {
    const httpParams = new HttpParams().set(
      'candidateJobRequirementId',
      candidateJobRequirementId
    );
    const url = `${this.baseUrl}/Onboarding/GetOnboardingDetails`;
    return this.httpClient
      .get<OnboardingDetailsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getPersonalInformation(
    candidateId: string,
    candidateJobRequirementId: string
  ): Observable<PersonalInformationResponse> {
    const httpParams = new HttpParams()
      .set('candidateId', candidateId)
      .set('candidateJobRequirementId', candidateJobRequirementId);
    const url = `${this.baseUrl}/Onboarding/personalinfo/get`;
    return this.httpClient
      .get<PersonalInformationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  savePersonalInformation(
    personalInformationResult: PersonalInformationResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/personalInfo/save`;

    return this.httpClient
      .post<string[]>(`${url}`, personalInformationResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* EMPLOYMENT INFORMATION */
  getEmploymentInformation(
    candidateId: string,
    candidateJobRequirementId: string
  ): Observable<EmploymentInformationResponse> {
    const httpParams = new HttpParams()
      .set('candidateId', candidateId)
      .set('candidateJobRequirementId', candidateJobRequirementId);
    const url = `${this.baseUrl}/Onboarding/employmentinfo/get`;
    return this.httpClient
      .get<EmploymentInformationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  saveEmploymentInformation(
    employmentInformationResult: EmploymentInformationResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/employmentinfo/save`;

    return this.httpClient
      .post<string[]>(`${url}`, employmentInformationResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* COMPENSATION INFORMATION */
  getCompensationInformation(
    candidateId: string,
    candidateJobRequirementId: string
  ): Observable<CompensationInformationResponse> {
    const httpParams = new HttpParams()
      .set('candidateId', candidateId)
      .set('candidateJobRequirementId', candidateJobRequirementId);
    const url = `${this.baseUrl}/Onboarding/compensation/get`;
    return this.httpClient
      .get<CompensationInformationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  saveCompensationInformation(
    compensationInformationResult: CompensationInformationResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/compensation/save`;

    return this.httpClient
      .post<string[]>(`${url}`, compensationInformationResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* ALL ONBOARDING DOCUMENTS INFORMATION */
  getAllOnboardingDocumentsInformation(
    searchTerm: string = ''
  ): Observable<AllOnboardingDocumentsInfoResponse> {
    let url = `${this.baseUrl}/Onboarding/documents/all`;
    if (searchTerm.length > 0) {
      url += `?searchTerm=${searchTerm}`;
    }
    return this.httpClient
      .get<AllOnboardingDocumentsInfoResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* ALL WEBFORM DOC INFORMATION */
  getAllWebFormDocInformation(
    searchTerm: string = ''
  ): Observable<WebFormAllDocumentsInfoResponse> {
    let url = `${this.baseUrl}/Onboarding/webforms/all`;
    if (searchTerm.length > 0) {
      url += `?searchTerm=${searchTerm}`;
    }
    return this.httpClient
      .get<WebFormAllDocumentsInfoResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* GET WEBFORMS AND DOCUMENTS BY PACKAGE CODE*/
  getWebFormsAndDocumentsByPackageTypeCode(
    candidateId: string,
    candidateJobRequirementId: string,
    pkgCode: number
  ): Observable<WebFormsAndDocumentsByPkgCodeResponse> {
    const httpParams = new HttpParams()
      .set('candidateId', candidateId)
      .set('candidateJobRequirementId', candidateJobRequirementId)
      .set('packageCode', pkgCode.toString());

    const url = `${this.baseUrl}/Onboarding/candidate/docsandwebforms`;
    return this.httpClient
      .get<WebFormsAndDocumentsByPkgCodeResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  saveDocumentsInformation(
    documentsInfoResult: DocumentsInfoResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/documentinfo/save`;

    return this.httpClient
      .post<string[]>(`${url}`, documentsInfoResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  /* PREVIEW INFORMATION */
  getPreviewInformation(
    candidateId: string,
    candidateJobRequirementId: string
  ): Observable<PreviewInfoResponse> {
    const httpParams = new HttpParams()
      .set('candidateId', candidateId)
      .set('candidateJobRequirementId', candidateJobRequirementId);
    const url = `${this.baseUrl}/Onboarding/preview`;
    return this.httpClient
      .get<PreviewInfoResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  /* SEND OFFER LETTER EMAIL CONTENT INFORMATION */
  getOfferLetterEmailContent(
    candidateId: string,
    candidateJobRequirementId: string
  ): Observable<OfferLetterEmailContentResponse> {
    const httpParams = new HttpParams()
      .set('candidateId', candidateId)
      .set('candidateJobRequirementId', candidateJobRequirementId);
    const url = `${this.baseUrl}/Onboarding/GetOfferLetterEmailContent`;
    return this.httpClient
      .get<OfferLetterEmailContentResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  saveSendOfferLetterEmailContentInformation(
    offerLetterEmailContentResult: OfferLetterEmailContentResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SendOffer`;

    const sendOffer = new FormData();
    sendOffer.append('candidateId', offerLetterEmailContentResult.candidateId);
    sendOffer.append(
      'candidateJobRequirementId',
      offerLetterEmailContentResult.candidateJobRequirementId
    );
    const toS = offerLetterEmailContentResult.to.includes(',')
      ? offerLetterEmailContentResult.to.split(',')
      : offerLetterEmailContentResult.to;

    for (let i = 0; i < toS.length; i++) {
      sendOffer.append(`to[${i}]`, toS[i]);
    }

    sendOffer.append('subject', offerLetterEmailContentResult.subject);
    sendOffer.append('body', offerLetterEmailContentResult.body);
    return this.httpClient
      .post<OfferLetterEmailContentResult>(`${url}`, sendOffer)
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
