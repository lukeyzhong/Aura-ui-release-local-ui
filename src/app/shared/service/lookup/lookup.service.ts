import { Injectable } from '@angular/core';
import { forkJoin, Observable, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  DepartmentLookupResultResponse,
  HRVerifyListOfDocumentsResponse,
  LookupBySearchStringResponse,
  LookupResultResponse,
  ThirdPartyLookupResponse,
  WorkAuthorizationDocumentMapResultResponse,
} from '../../interface/lookup.interface';

@Injectable({
  providedIn: 'root',
})
export class LookupService {
  url!: string;
  constructor(private httpClient: HttpClient) {}

  getEmployeeStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/EmployeeStatusCode`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCandidateStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/EmployeeOnboardingStatus`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getJobsStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/JobRequirementStatus`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getOrganizationStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/OrgStatus`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getDepartmentLookup(): Observable<DepartmentLookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/Department/All`;

    return this.httpClient
      .get<DepartmentLookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // WorkAuthorizationStatus
  getWorkAuthorizationStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/WorkAuthorizationStatus`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  getWorkAuthorizationTypeCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/WorkAuthorizationType`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  getEADCategoryType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/EADCategory`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  // EmploymentType
  getEmploymentTypeStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/EmploymentType`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  // EmployeeCategory
  getEmploymentCategory(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/EmployeeCategory`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  getWorkAuthorizationDocumentMap(): Observable<WorkAuthorizationDocumentMapResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/WorkAuthorizationDocumentMap`;

    return this.httpClient
      .get<WorkAuthorizationDocumentMapResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  // CalculatedBy
  getWageTypeStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/WageType`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCompensationLookupTypes(): Observable<LookupResultResponse[]> {
    const wageComponentTypeUrl = `${environment.apiBaseUrl}/lookup/WageComponentType`;
    const calculatedByUrl = `${environment.apiBaseUrl}/lookup/WageType`;
    const payFrequencyTypeUrl = `${environment.apiBaseUrl}/lookup/PayFrequency`;

    const wageComponentTypeResponse = this.httpClient
      .get<LookupResultResponse>(`${wageComponentTypeUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const calculatedByResponse = this.httpClient
      .get<LookupResultResponse>(`${calculatedByUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const payFrequencyTypeResponse = this.httpClient
      .get<LookupResultResponse>(`${payFrequencyTypeUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    return forkJoin([
      wageComponentTypeResponse,
      calculatedByResponse,
      payFrequencyTypeResponse,
    ]);
  }

  // DOCUMENTPACKAGE TYPES
  getDocumentPackageTypes(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/DocumentPackage`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCountryCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/Country`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getStateCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/State`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  // Gender
  getGenderCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/Gender`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getMajorCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/Major`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getMajorByCode(
    searchString: string = ''
  ): Observable<LookupBySearchStringResponse> {
    const httpParams = new HttpParams().set('searchString', searchString);
    this.url = `${environment.apiBaseUrl}/lookup/SearchMajor`;
    return this.httpClient
      .get<LookupBySearchStringResponse>(`${this.url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  getUniversityByName(
    searchString: string = ''
  ): Observable<LookupBySearchStringResponse> {
    const httpParams = new HttpParams().set('searchString', searchString);
    this.url = `${environment.apiBaseUrl}/University/SearchUniversities`;
    return this.httpClient
      .get<LookupBySearchStringResponse>(`${this.url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  getReportingManagerByName(
    searchString: string = ''
  ): Observable<LookupBySearchStringResponse> {
    const httpParams = new HttpParams().set('searchString', searchString);
    this.url = `${environment.apiBaseUrl}/User/GetAllReportingManagers`;
    return this.httpClient
      .get<LookupBySearchStringResponse>(`${this.url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  getDegreeCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/Degree`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getMultipleDropDownData(): Observable<LookupResultResponse[]> {
    const workAuthorizationStatusUrl = `${environment.apiBaseUrl}/lookup/WorkAuthorizationStatus`;
    const employmentTypeStatusUrl = `${environment.apiBaseUrl}/lookup/EmploymentType`;
    const wageTypeStatusUrl = `${environment.apiBaseUrl}/lookup/WageType`;
    const countryUrl = `${environment.apiBaseUrl}/lookup/Country`;
    const stateUrl = `${environment.apiBaseUrl}/lookup/State`;
    const genderUrl = `${environment.apiBaseUrl}/lookup/Gender`;

    const workAuthorizationStatusResponse = this.httpClient
      .get<LookupResultResponse>(`${workAuthorizationStatusUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const employmentTypeStatusResponse = this.httpClient
      .get<LookupResultResponse>(`${employmentTypeStatusUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const wageTypeStatusResponse = this.httpClient
      .get<LookupResultResponse>(`${wageTypeStatusUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const countryResponse = this.httpClient
      .get<LookupResultResponse>(`${countryUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const stateResponse = this.httpClient
      .get<LookupResultResponse>(`${stateUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const genderResponse = this.httpClient
      .get<LookupResultResponse>(`${genderUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    return forkJoin([
      workAuthorizationStatusResponse,
      employmentTypeStatusResponse,
      wageTypeStatusResponse,
      countryResponse,
      stateResponse,
      genderResponse,
    ]);
  }

  getAllDropDownDataForCandidate(): Observable<LookupResultResponse[]> {
    const maritalStatusUrl = `${environment.apiBaseUrl}/lookup/MaritalStatus`;
    const genderUrl = `${environment.apiBaseUrl}/lookup/Gender`;
    const countryUrl = `${environment.apiBaseUrl}/lookup/Country`;
    const stateUrl = `${environment.apiBaseUrl}/lookup/State`;
    const employmentTypeStatusUrl = `${environment.apiBaseUrl}/lookup/EmploymentType`;
    const workAuthorizationStatusUrl = `${environment.apiBaseUrl}/lookup/WorkAuthorizationStatus`;
    const sourceTypeUrl = `${environment.apiBaseUrl}/lookup/Source`;
    const availabilityPeriodUrl = `${environment.apiBaseUrl}/lookup/Availability`;
    const socialMediaLinkUrl = `${environment.apiBaseUrl}/lookup/SocialMediaLink`;
    const ethnicityUrl = `${environment.apiBaseUrl}/lookup/Ethnicity`;
    const raceUrl = `${environment.apiBaseUrl}/lookup/Race`;

    const maritalStatusResponse = this.httpClient
      .get<LookupResultResponse>(`${maritalStatusUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const genderResponse = this.httpClient
      .get<LookupResultResponse>(`${genderUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const countryResponse = this.httpClient
      .get<LookupResultResponse>(`${countryUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const stateResponse = this.httpClient
      .get<LookupResultResponse>(`${stateUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const employmentTypeStatusResponse = this.httpClient
      .get<LookupResultResponse>(`${employmentTypeStatusUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const workAuthorizationStatusResponse = this.httpClient
      .get<LookupResultResponse>(`${workAuthorizationStatusUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const sourceTypeResponse = this.httpClient
      .get<LookupResultResponse>(`${sourceTypeUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const availabilityTypeResponse = this.httpClient
      .get<LookupResultResponse>(`${availabilityPeriodUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const socialMediaLinkTypeResponse = this.httpClient
      .get<LookupResultResponse>(`${socialMediaLinkUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const ethnicityeResponse = this.httpClient
      .get<LookupResultResponse>(`${ethnicityUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const raceResponse = this.httpClient
      .get<LookupResultResponse>(`${raceUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    return forkJoin([
      maritalStatusResponse,
      genderResponse,
      countryResponse,
      stateResponse,
      employmentTypeStatusResponse,
      workAuthorizationStatusResponse,
      sourceTypeResponse,
      availabilityTypeResponse,
      socialMediaLinkTypeResponse,
      ethnicityeResponse,
      raceResponse,
    ]);
  }

  getEmploymentType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/EmploymentType`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  getEmploymentAgreementDocumentType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/get/EmployeeAgreement`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getEmployeeUserActivityTypeCategory(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/UserActivityTypeCategory`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getMaritalStatusCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/MaritalStatus`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCandidateTypeCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/CandidateType`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getSourceTypeCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/Source`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getNoticePerioCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/NoticePeriod`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCandidateDocumentType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/get/CandidateDocument`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // SKILL
  getSkillType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/skill`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getSkillLevelType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/skilllevel`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getSkillByName(
    searchString: string = ''
  ): Observable<LookupBySearchStringResponse> {
    const httpParams = new HttpParams().set('searchString', searchString);
    this.url = `${environment.apiBaseUrl}/Lookup/Skill/search`;
    return this.httpClient
      .get<LookupBySearchStringResponse>(`${this.url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  // CERTIFICATION
  getCertificationStatus(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/CertificationStatus`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getCertificationAgencyByOrgName(
    searchString: string = ''
  ): Observable<LookupBySearchStringResponse> {
    const httpParams = new HttpParams().set('searchString', searchString);
    this.url = `${environment.apiBaseUrl}/Organization/search`;
    return this.httpClient
      .get<LookupBySearchStringResponse>(`${this.url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  getSecurityClearancePolygraphTypes(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/polygraphtype`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getRejectionOfferReasonsCode(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/OnboardingRejectionReason`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // CANDIDATE ONBOARDING WORKFLOW LOOKUP's
  getSocialMediaLinkTypes(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/SocialMediaLink`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getRelationshipTypes(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/RelationshipType`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getWageComponentCalculationType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/CalculationType`;
    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getAccountType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/BankAccountType`;
    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getListOfUSCISDocuments(
    citizenshipStatusCode: number,
    category: string
  ): Observable<HRVerifyListOfDocumentsResponse> {
    const httpParams = new HttpParams()
      .set('parentLookupCode', citizenshipStatusCode?.toString())
      .set('category', category);
    this.url = `${environment.apiBaseUrl}/lookup/GetUSCISDocumentTypes`;
    return this.httpClient
      .get<HRVerifyListOfDocumentsResponse>(`${this.url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getCitizenshipStatusesType(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/thirdparty?lookuptype=CitizenshipStatuses`;
    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getUniversityTypesAndCertifyingAgencyNames(): Observable<
    LookupBySearchStringResponse[]
  > {
    const universityUrl = `${environment.apiBaseUrl}/University/SearchUniversities`;
    const certifyingAgencyUrl = `${environment.apiBaseUrl}/Organization/search`;

    const universityUrlResponse = this.httpClient
      .get<LookupBySearchStringResponse>(`${universityUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    const certifyingAgencyUrlResponse = this.httpClient
      .get<LookupBySearchStringResponse>(`${certifyingAgencyUrl}`)
      .pipe(retry(1), catchError(this.handleError));

    return forkJoin([universityUrlResponse, certifyingAgencyUrlResponse]);
  }

  getBusinessUnitNames(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/BusinessUnit`;

    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Tax Info Thirdparty Lookup's
  getThirdPartyLookupCodes(
    lookUpType: string
  ): Observable<ThirdPartyLookupResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/thirdparty?lookuptype=${lookUpType}`;

    return this.httpClient
      .get<ThirdPartyLookupResponse>(`${this.url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getTimesheetStatus(): Observable<LookupResultResponse> {
    this.url = `${environment.apiBaseUrl}/lookup/TimeSheetStatus`;
    return this.httpClient
      .get<LookupResultResponse>(`${this.url}`)
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
