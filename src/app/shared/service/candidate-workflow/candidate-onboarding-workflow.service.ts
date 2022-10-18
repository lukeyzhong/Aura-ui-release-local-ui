import {
  HttpParams,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { CertificationResult } from '../../../aura/search/interface/certification.interface';
import { EducationResult } from '../../../aura/search/interface/education.interface';
import { environment } from '../../../../environments/environment';
import {
  CandidateOnboardingDocumentsResponse,
  CandidateOnboardingEducationInformationResponse,
  CandidateOnboardingEducationInformationResult,
  CandidateOnboardingEmergencyContactsResponse,
  CandidateOnboardingEmergencyContactsResult,
  CandidateOnboardingI9FormPreviewResponse,
  CandidateOnboardingIdentificationImmigrationInformationResponse,
  CandidateOnboardingIdentificationImmigrationInformationResult,
  CandidateOnboardingInformationResponse,
  CandidateOnboardingPersonalInformationResponse,
  CandidateOnboardingPersonalInformationResult,
  CandidateSignatureListResponse,
  UploadedEducationDocuments,
  EmploymentCompensationInfoResponse,
  CandidateOnboardingWorkEligibilityAndI9FormResponse,
  CandidateOnboardingWorkEligibilityAndI9FormResult,
  CreateUSCISCase,
  GetCaseData,
  SaveSignAndGenerateDocumentsResponse,
  SaveSignAndGenerateDocumentsResult,
  CandidateOnboardingTaxInformationResponse,
  FilingStatus,
  MultipleJobs,
  ClaimDependents,
  OtherAdjustments,
  GenerateW4,
  StateTax,
  TncAction,
  SaveFICATaxInfo,
  GetFedralTaxWithHolding,
  GetRejectionEmailContentResponse,
  GetRejectionEmailContentResult,
} from '../../interface/candidate-onboarding-workflow.interface';
import {
  BankAccountData,
  BanksPaychecksResponse,
} from '../../interface/candidate-onboarding-workflow.interface';
import { EmployeeImmigrationAddEditRecord } from '../../../aura/search/interface/employee-profile/employee-profile-immigration.interface';
import { OnBoardStatus } from '../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { GlobalVariables } from '../../enums/global-variables.enum';

@Injectable({
  providedIn: 'root',
})
export class CandidateOnboardingWorkflowService {
  baseUrl = environment.apiBaseUrl;

  private profilePicSubject = new Subject<boolean>();

  // tslint:disable-next-line: no-any
  private passportInfoSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private hideTaxSubject = new Subject<any>();
  // tslint:disable-next-line: no-any
  private salaryInfo = new Subject<any>();
  // tslint:disable-next-line: no-any
  private stateTaxDetailsSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private taxFilingStatusSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private empTypeSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private ssnSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private piSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private taxDocIdSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  private i9DocIdSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  sendPassportInfoDetails(passInfo: any): void {
    this.passportInfoSubject.next(passInfo);
  }
  // tslint:disable-next-line: no-any
  getPassportInfoDetails(): Observable<any> {
    return this.passportInfoSubject.asObservable();
  }

  sendProfilePicStatus(status: boolean): void {
    this.profilePicSubject.next(status);
  }

  getProfilePicStatus(): Observable<boolean> {
    return this.profilePicSubject.asObservable();
  }

  sendHideTaxDetails(status: boolean): void {
    this.hideTaxSubject.next(status);
  }

  getHideTaxDetails(): Observable<boolean> {
    return this.hideTaxSubject.asObservable();
  }

  setSalaryInfo(amount: number): void {
    this.salaryInfo.next(amount);
  }

  getSalaryInfo(): Observable<number> {
    return this.salaryInfo.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendStateTaxDetails(stateTax: any): void {
    this.stateTaxDetailsSubject.next({ stateTax });
  }
  // tslint:disable-next-line: no-any
  getStateTaxDetails(): Observable<any> {
    return this.stateTaxDetailsSubject.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendTaxFilingStatus(taxFiling: any): void {
    this.taxFilingStatusSubject.next({ taxFiling });
  }
  // tslint:disable-next-line: no-any
  getTaxFilingStatus(): Observable<any> {
    return this.taxFilingStatusSubject.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendI9DocURL(docURL: any): void {
    this.i9DocIdSubject.next({ docURL });
  }
  // tslint:disable-next-line: no-any
  getI9DocURL(): Observable<any> {
    return this.i9DocIdSubject.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendTaxDocURL(docURL: any): void {
    this.taxDocIdSubject.next({ docURL });
  }
  // tslint:disable-next-line: no-any
  getTaxDocURL(): Observable<any> {
    return this.taxDocIdSubject.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendPersInfo(piObj: any): void {
    this.piSubject.next({ piObj });
  }
  // tslint:disable-next-line: no-any
  getPersInfo(): Observable<any> {
    return this.piSubject.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendSSN(ssn: any): void {
    this.ssnSubject.next({ ssn });
  }
  // tslint:disable-next-line: no-any
  getSSN(): Observable<any> {
    return this.ssnSubject.asObservable();
  }

  // tslint:disable-next-line: no-any
  sendEmpType(empType: any): void {
    this.empTypeSubject.next({ empType });
  }
  // tslint:disable-next-line: no-any
  getEmpType(): Observable<any> {
    return this.empTypeSubject.asObservable();
  }

  constructor(private httpClient: HttpClient) {}

  getBanksAndPaychecks(
    employeeOnboardingId: string
  ): Observable<BanksPaychecksResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      employeeOnboardingId
    );
    const url = `${this.baseUrl}/onboarding/GetCandidateBankInfo`;
    return this.httpClient
      .get<BanksPaychecksResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  deleteCandidateBankInfo(bankAccountId: string): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/DeleteCandidateBankInfo/${bankAccountId}`;
    return this.httpClient
      .delete(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  saveBanksAndPaychecks(
    bankAccountCount: number,
    employeeOnboardingId: string,
    bankAccountId: string[],
    resourceTypeCode: number,
    resourceValue: string,
    name: string[],
    accountType: number[],
    bankName: string[],
    routingNumber: string[],
    accountNumber: string[],
    branchName: string[],
    paycheckDistribution: number[],
    percentage: number[],
    amount: number[],
    primaryAccount: boolean[],
    fileId: string[],
    fileName: string[],
    documentPurposeCodeFile: number,
    isNewDocument: boolean[],
    resourceTypeCodeFile: number,
    file: File[],
    docDeleteId: string[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveCandidateBankInfo`;
    const formData = new FormData();

    formData.append('EmployeeOnboardingId', employeeOnboardingId);
    for (let i = 0; i < bankAccountCount; i++) {
      if (bankAccountId[i] === '') {
        formData.append(
          `BankInfo[${i}].BankAccountData.ResourceTypeCode`,
          resourceTypeCode?.toString()
        );
        formData.append(
          `BankInfo[${i}].BankAccountData.ResourceValue`,
          resourceValue?.toString()
        );
        formData.append(`BankInfo[${i}].BankAccountData.AccountName`, name[i]);
        formData.append(
          `BankInfo[${i}].BankAccountData.BankAccountTypeCode`,
          accountType[i]?.toString()
        );
        formData.append(`BankInfo[${i}].BankAccountData.BankName`, bankName[i]);
        formData.append(
          `BankInfo[${i}].BankAccountData.RoutingNumber`,
          routingNumber[i]
        );
        formData.append(
          `BankInfo[${i}].BankAccountData.AccountNumber`,
          accountNumber[i]
        );
        formData.append(
          `BankInfo[${i}].BankAccountData.BranchName`,
          branchName[i]
        );
        formData.append(
          `BankInfo[${i}].BankAccountData.CalculationTypeCode`,
          paycheckDistribution[i]?.toString()
        );
        if (paycheckDistribution[i].toString() === '1') {
          formData.append(
            `BankInfo[${i}].BankAccountData.CalculationValue`,
            amount[i]?.toString()
          );
        }
        if (paycheckDistribution[i].toString() === '2') {
          formData.append(
            `BankInfo[${i}].BankAccountData.CalculationValue`,
            percentage[i]?.toString()
          );
        }
        formData.append(
          `BankInfo[${i}].BankAccountData.PrimaryAccount`,
          primaryAccount[i]?.toString()
        );
        if (file[i]) {
          formData.append(
            `BankInfo[${i}].BankAccountData.Document.DisplayName`,
            fileName[i]
          );
          formData.append(
            `BankInfo[${i}].BankAccountData.Document.DocumentPurposeCode`,
            documentPurposeCodeFile?.toString()
          );
          formData.append(
            `BankInfo[${i}].BankAccountData.Document.IsNewDocument`,
            isNewDocument[i]?.toString()
          );
          formData.append(
            `BankInfo[${i}].BankAccountData.Document.ResourceTypeCode`,
            resourceTypeCodeFile?.toString()
          );
          formData.append(
            `BankInfo[${i}].BankAccountData.Document.DocumentInfo`,
            file[i]
          );
        }
      }
      if (bankAccountId[i] !== '') {
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.BankAccountId`,
          bankAccountId[i]
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.ResourceTypeCode`,
          resourceTypeCode?.toString()
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.ResourceValue`,
          resourceValue?.toString()
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.AccountName`,
          name[i]
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.BankAccountTypeCode`,
          accountType[i]?.toString()
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.BankName`,
          bankName[i]
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.RoutingNumber`,
          routingNumber[i]
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.AccountNumber`,
          accountNumber[i]
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.BranchName`,
          branchName[i]
        );
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.CalculationTypeCode`,
          paycheckDistribution[i]?.toString()
        );
        if (paycheckDistribution[i].toString() === '1') {
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.CalculationValue`,
            amount[i]?.toString()
          );
        }
        if (paycheckDistribution[i].toString() === '2') {
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.CalculationValue`,
            percentage[i]?.toString()
          );
        }
        formData.append(
          `BankInfo[${i}].UpdateBankAccountData.PrimaryAccount`,
          primaryAccount[i]?.toString()
        );
        if (file[i]) {
          if (docDeleteId[i] === '') {
            formData.append(
              `BankInfo[${i}].UpdateBankAccountData.DocumentsData.ReplacedDocuments[0].DocumentId`,
              fileId[i]
            );
          }
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.DocumentsData.ReplacedDocuments[0].DisplayName`,
            fileName[i]
          );
          // tslint:disable-next-line: max-line-length
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.DocumentsData.ReplacedDocuments[0].DocumentPurposeCode`,
            documentPurposeCodeFile?.toString()
          );
          // tslint:disable-next-line: max-line-length
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.DocumentsData.ReplacedDocuments[0].IsNewDocument`,
            isNewDocument[i]?.toString()
          );
          // tslint:disable-next-line: max-line-length
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.DocumentsData.ReplacedDocuments[0].ResourceTypeCode`,
            resourceTypeCodeFile?.toString()
          );
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.DocumentsData.ReplacedDocuments[0].DocumentInfo`,
            file[i]
          );
        }
        if (docDeleteId[i]) {
          formData.append(
            `BankInfo[${i}].UpdateBankAccountData.DocumentsData.DeletedDocuments[0]`,
            docDeleteId[i]
          );
        }
      }
    }
    return this.httpClient
      .post<BankAccountData>(`${url}`, formData)
      .pipe(retry(1), catchError(this.handleError));
  }

  getOfferLetterDocument(
    employeeOnboardingId?: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetOfferLetter`;

    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getCandidateSignatures(
    userId: string
    // tslint:disable-next-line: no-any
  ): Observable<CandidateSignatureListResponse[]> {
    const url = `${environment.apiBaseUrl}/user/signature/${userId}`;

    return this.httpClient
      .get<CandidateSignatureListResponse[]>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  generateAndSaveCandidateOfferLetter(
    employeeOnboardingId: string,
    document: File | string,
    saveSign: boolean = false,
    formType: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/GenerateAndSaveCandidateOfferLetter`;

    const genOfferLetter = new FormData();
    genOfferLetter.append('EmployeeOnboardingId', employeeOnboardingId);
    switch (formType) {
      case 'HR Sign':
        if (saveSign) {
          genOfferLetter.append('HRSign.SaveSign', String(saveSign));
          genOfferLetter.append(`HRSign.Document`, document);
        } else {
          genOfferLetter.append('HRSign.SaveSign', String(saveSign));
          genOfferLetter.append(`HRSign.SignatureDocumentId`, document);
        }
        break;
      case 'Candidate Sign':
        genOfferLetter.append('CandidateSign.SaveSign', String(saveSign));
        genOfferLetter.append(`CandidateSign.Document`, document);
        break;
    }

    return this.httpClient
      .post(`${url}`, genOfferLetter)
      .pipe(retry(1), catchError(this.handleError));
  }

  // CANDIDATE ONBOARDING WORKFLOW
  // Onboarding Info
  getCandidateOnboardingInfoByEmpOnboardingId(
    employeeOnboardingId?: string
  ): Observable<CandidateOnboardingInformationResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetCandidateOnboardingInfo`;

    return this.httpClient
      .get<CandidateOnboardingInformationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // delete social medial link id
  deleteSocialMediaLinkById(
    socialMediaLinkId: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set(
      'socialMediaLinkId',
      socialMediaLinkId
    );
    const url = `${this.baseUrl}/Person/DeleteSocialMediaLinkById`;

    return this.httpClient
      .delete(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }
  // SaveCandidatePersonalInfo
  saveCandidatePersonalInformation(
    personalInformationResult: CandidateOnboardingPersonalInformationResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/candidate/personalinfo/save`;

    return this.httpClient
      .post<string[]>(`${url}`, personalInformationResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  // SaveCandidateIdentityInfo
  saveCandidateIdentityInformation(
    candidateInfoResult: CandidateOnboardingIdentificationImmigrationInformationResult,
    ssnFile: File,
    addOrUpdatePassport: string,
    // tslint:disable-next-line: no-any
    uploadedPassportDocs: any,
    addOrUpdateDL: string,
    // tslint:disable-next-line: no-any
    uploadedDLDocs: any,
    totalImmigrations: number,
    updatedImmigrationInfo: EmployeeImmigrationAddEditRecord[],
    uploadedImmigrationDocs: UploadedEducationDocuments[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveCandidateIdentityInfo`;
    const candIdentityInfo = new FormData();
    let addOrUpdateImmigration = '';

    if (candidateInfoResult?.employeeOnboardingId) {
      candIdentityInfo.append(
        'EmployeeOnboardingId',
        candidateInfoResult?.employeeOnboardingId
      );
    }
    candIdentityInfo.append('CandidateId', candidateInfoResult?.candidateId);
    candIdentityInfo.append(
      'CandidateJobRequirementId',
      candidateInfoResult?.candidateJobRequirementId
    );
    // Passport
    if (candidateInfoResult?.updatePassportInfo?.passportInfoId !== undefined) {
      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportInfoId`,
        String(candidateInfoResult?.updatePassportInfo?.passportInfoId)
      );
      candIdentityInfo.append(
        `${addOrUpdatePassport}.personId`,
        candidateInfoResult?.updatePassportInfo?.personId
      );

      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportNumber`,
        candidateInfoResult?.updatePassportInfo?.passportNumber
      );
      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportIssueDate`,
        candidateInfoResult?.updatePassportInfo?.passportIssueDate
      );
      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportExpiryDate`,
        candidateInfoResult?.updatePassportInfo?.passportExpiryDate
      );
      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportIssueCountryCode`,
        String(
          candidateInfoResult?.updatePassportInfo?.passportIssueCountryCode
        )
      );
      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportIssuedCity`,
        candidateInfoResult?.updatePassportInfo?.passportIssuedCity
      );
      candIdentityInfo.append(
        `${addOrUpdatePassport}.passportIssueCountry`,
        candidateInfoResult?.updatePassportInfo?.passportIssueCountry
      );
      if (uploadedPassportDocs?.fileList?.length > 0) {
        for (let i = 0; i < uploadedPassportDocs?.fileList?.length; i++) {
          candIdentityInfo.append(
            `${addOrUpdatePassport}.DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
            String(candidateInfoResult?.updatePassportInfo?.resourceTypeCode)
          );
          candIdentityInfo.append(
            `${addOrUpdatePassport}.DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
            String(candidateInfoResult?.updatePassportInfo?.documentPurposeCode)
          );
          candIdentityInfo.append(
            `${addOrUpdatePassport}.DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
            String(candidateInfoResult?.updatePassportInfo?.isNewDocument)
          );
          candIdentityInfo.append(
            `${addOrUpdatePassport}.DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
            uploadedPassportDocs?.fileList[i]?.file
          );
          candIdentityInfo.append(
            `${addOrUpdatePassport}.DocumentsData.ReplacedDocuments[${i}].DisplayName`,
            uploadedPassportDocs?.fileList[i]?.displayName
          );
          candIdentityInfo.append(
            `${addOrUpdatePassport}.DocumentsData.ReplacedDocuments[${i}].FileDescription`,
            uploadedPassportDocs?.fileList[i]?.fileDescription
          );
        }
      }
    }
    // Driving Licence
    if (
      candidateInfoResult?.updateDrivingLicenseInfo?.drivingLicenseID !==
      undefined
    ) {
      candIdentityInfo.append(
        `${addOrUpdateDL}.DrivingLicenseID`,
        String(candidateInfoResult?.updateDrivingLicenseInfo?.drivingLicenseID)
      );

      candIdentityInfo.append(
        `${addOrUpdateDL}.PersonId`,
        candidateInfoResult?.updateDrivingLicenseInfo?.personId
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.DrivingLicenseNo`,
        candidateInfoResult?.updateDrivingLicenseInfo?.drivingLicenseNo
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.IssueDate`,
        candidateInfoResult?.updateDrivingLicenseInfo?.issueDate
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.ExpiryDate`,
        candidateInfoResult?.updateDrivingLicenseInfo?.expiryDate
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.Location.LocationTypeCode`,
        candidateInfoResult?.updateDrivingLicenseInfo?.location?.locationTypeCode.toString()
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.Location.ResourceTypeCode`,
        candidateInfoResult?.updateDrivingLicenseInfo?.location?.resourceTypeCode.toString()
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.Location.City`,
        candidateInfoResult?.updateDrivingLicenseInfo?.location?.city
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.Location.StateCode`,
        String(
          candidateInfoResult?.updateDrivingLicenseInfo?.location?.stateCode
        )
      );
      candIdentityInfo.append(
        `${addOrUpdateDL}.Location.zip`,
        candidateInfoResult?.updateDrivingLicenseInfo?.location?.zip
      );
      if (uploadedDLDocs?.fileList?.length > 0) {
        for (let i = 0; i < uploadedDLDocs?.fileList?.length; i++) {
          candIdentityInfo.append(
            `${addOrUpdateDL}.DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
            String(
              candidateInfoResult?.updateDrivingLicenseInfo?.resourceTypeCode
            )
          );
          candIdentityInfo.append(
            `${addOrUpdateDL}.DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
            String(
              candidateInfoResult?.updateDrivingLicenseInfo?.documentPurposeCode
            )
          );
          candIdentityInfo.append(
            `${addOrUpdateDL}.DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
            String(candidateInfoResult?.updateDrivingLicenseInfo?.isNewDocument)
          );
          candIdentityInfo.append(
            `${addOrUpdateDL}.DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
            uploadedDLDocs?.fileList[i]?.file
          );
          candIdentityInfo.append(
            `${addOrUpdateDL}.DocumentsData.ReplacedDocuments[${i}].DisplayName`,
            uploadedDLDocs?.fileList[i]?.displayName
          );
          candIdentityInfo.append(
            `${addOrUpdateDL}.DocumentsData.ReplacedDocuments[${i}].FileDescription`,
            uploadedDLDocs?.fileList[i]?.fileDescription
          );
        }
      }
    }
    // SSN
    if (candidateInfoResult?.updateSSNInfo?.personId !== undefined) {
      candIdentityInfo.append(
        'UpdateSSNInfo.PersonId',
        candidateInfoResult?.updateSSNInfo?.personId
      );
      candIdentityInfo.append(
        'UpdateSSNInfo.SocialSecurityNumber',
        candidateInfoResult?.updateSSNInfo?.socialSecurityNumber
      );
      if (ssnFile) {
        candIdentityInfo.append(
          `UpdateSSNInfo.DocumentsData.ReplacedDocuments[0].IsNewDocument`,
          'true'
        );
        candIdentityInfo.append(
          `UpdateSSNInfo.DocumentsData.ReplacedDocuments[0].ResourceTypeCode`,
          '4'
        );
        candIdentityInfo.append(
          `UpdateSSNInfo.DocumentsData.ReplacedDocuments[0].FileDescription`,
          'SSN Document'
        );
        candIdentityInfo.append(
          `UpdateSSNInfo.DocumentsData.ReplacedDocuments[0].DisplayName`,
          ssnFile.name
        );
        candIdentityInfo.append(
          `UpdateSSNInfo.DocumentsData.ReplacedDocuments[0].DocumentPurposeCode`,
          '12'
        );
        candIdentityInfo.append(
          `UpdateSSNInfo.DocumentsData.ReplacedDocuments[0].DocumentInfo`,
          ssnFile
        );
      }
    }

    // Immigration

    if (updatedImmigrationInfo) {
      for (let i = 0; i < totalImmigrations; i++) {
        if (
          updatedImmigrationInfo[i]?.immigrationInfoId ===
          GlobalVariables.DefaultGUID
        ) {
          addOrUpdateImmigration = 'ImmigrationInfo';
        } else {
          addOrUpdateImmigration = 'UpdateImmigrationInfo';
        }
        candIdentityInfo.append(
          `immigrationData[${i}].${addOrUpdateImmigration}.ImmigrationInfoId`,
          String(updatedImmigrationInfo[i]?.immigrationInfoId)
        );
        candIdentityInfo.append(
          `immigrationData[${i}].${addOrUpdateImmigration}.immigrationInfoTypeCode`,
          String(updatedImmigrationInfo[i]?.immigrationInfoTypeCode)
        );
        candIdentityInfo.append(
          `immigrationData[${i}].${addOrUpdateImmigration}.PersonId`,
          updatedImmigrationInfo[i]?.personId
        );
        candIdentityInfo.append(
          `immigrationData[${i}].${addOrUpdateImmigration}.WorkAuthorizationTypeCode`,
          String(updatedImmigrationInfo[i]?.workAuthorizationTypeCode)
        );
        if (
          String(updatedImmigrationInfo[i]?.workAuthorizationTypeCode) === '2'
        ) {
          candIdentityInfo.append(
            `immigrationData[${i}].${addOrUpdateImmigration}.eadCategoryCode`,
            String(updatedImmigrationInfo[i]?.eadCategoryCode)
          );
          candIdentityInfo.append(
            `immigrationData[${i}].${addOrUpdateImmigration}.eadCategory`,
            updatedImmigrationInfo[i]?.eadCategory
          );
        }
        candIdentityInfo.append(
          `immigrationData[${i}].${addOrUpdateImmigration}.WorkAuthorizationNumber`,
          updatedImmigrationInfo[i]?.workAuthorizationNumber
        );
        if (updatedImmigrationInfo[i]?.workAuthorizationStartDate !== 'null') {
          candIdentityInfo.append(
            `immigrationData[${i}].${addOrUpdateImmigration}.WorkAuthorizationStartDate`,
            updatedImmigrationInfo[i]?.workAuthorizationStartDate
          );
        }
        if (updatedImmigrationInfo[i]?.workAuthorizationExpiryDate !== 'null') {
          candIdentityInfo.append(
            `immigrationData[${i}].${addOrUpdateImmigration}.WorkAuthorizationExpiryDate`,
            updatedImmigrationInfo[i]?.workAuthorizationExpiryDate
          );
        }

        if (
          updatedImmigrationInfo[i]?.immigrationInfoId ===
          uploadedImmigrationDocs[i]?.id
        ) {
          for (
            let j = 0;
            j < uploadedImmigrationDocs[i]?.fileList?.length;
            j++
          ) {
            candIdentityInfo.append(
              `immigrationData[${i}].updateImmigrationInfo.DocumentsData.ReplacedDocuments[${j}].ResourceTypeCode`,
              String(updatedImmigrationInfo[i]?.resourceTypeCode)
            );

            candIdentityInfo.append(
              `immigrationData[${i}].updateImmigrationInfo.DocumentsData.ReplacedDocuments[${j}].DocumentPurposeCode`,
              String(updatedImmigrationInfo[i]?.documentPurposeCode)
            );
            candIdentityInfo.append(
              `immigrationData[${i}].updateImmigrationInfo.DocumentsData.ReplacedDocuments[${j}].IsNewDocument`,
              uploadedImmigrationDocs[i]?.fileList[j]?.id === ''
                ? 'true'
                : 'false'
            );

            candIdentityInfo.append(
              `immigrationData[${i}].updateImmigrationInfo.DocumentsData.ReplacedDocuments[${j}].DocumentInfo`,
              uploadedImmigrationDocs[i]?.fileList[j]?.file
            );
            candIdentityInfo.append(
              `immigrationData[${i}].updateImmigrationInfo.DocumentsData.ReplacedDocuments[${j}].DisplayName`,
              uploadedImmigrationDocs[i]?.fileList[j]?.displayName
            );
            candIdentityInfo.append(
              `immigrationData[${i}].updateImmigrationInfo.DocumentsData.ReplacedDocuments[${j}].FileDescription`,
              uploadedImmigrationDocs[i]?.fileList[j]?.fileDescription
            );
          }
        } else {
          for (
            let j = 0;
            j < uploadedImmigrationDocs[i]?.fileList?.length;
            j++
          ) {
            candIdentityInfo.append(
              `immigrationData[${i}].immigrationInfo.Documents[${j}].ResourceTypeCode`,
              String(updatedImmigrationInfo[i]?.resourceTypeCode)
            );

            candIdentityInfo.append(
              `immigrationData[${i}].immigrationInfo.Documents[${j}].DocumentPurposeCode`,
              String(updatedImmigrationInfo[i]?.documentPurposeCode)
            );
            candIdentityInfo.append(
              `immigrationData[${i}].immigrationInfo.Documents[${j}].IsNewDocument`,
              uploadedImmigrationDocs[i]?.fileList[j]?.id === ''
                ? 'true'
                : 'false'
            );

            candIdentityInfo.append(
              `immigrationData[${i}].immigrationInfo.Documents[${j}].DocumentInfo`,
              uploadedImmigrationDocs[i]?.fileList[j]?.file
            );
            candIdentityInfo.append(
              `immigrationData[${i}].immigrationInfo.Documents[${j}].DisplayName`,
              uploadedImmigrationDocs[i]?.fileList[j]?.displayName
            );
            candIdentityInfo.append(
              `immigrationData[${i}].immigrationInfo.Documents[${j}].FileDescription`,
              uploadedImmigrationDocs[i]?.fileList[j]?.fileDescription
            );
          }
        }
      }
    }

    return this.httpClient
      .post(`${url}`, candIdentityInfo)
      .pipe(retry(1), catchError(this.handleError));
  }

  // SaveCandidateEducationAndCertificationInformation
  saveCandidateEducationAndCertificationInformation(
    candidateInfoResult: CandidateOnboardingEducationInformationResult,
    totalEducations: number,
    totalCertifications: number,
    updatedEducationInfo: EducationResult[],
    updatedCertificationInfo: CertificationResult[],
    uploadedEducationDocs: UploadedEducationDocuments[],
    uploadedCertificationDocs: UploadedEducationDocuments[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveCandidateEducationInfo`;
    const candEducationInfo = new FormData();
    let addOrUpdateEducation = '';
    let addOrUpdateCertification = '';

    if (candidateInfoResult.employeeOnboardingId) {
      candEducationInfo.append(
        'EmployeeOnboardingId',
        candidateInfoResult?.employeeOnboardingId
      );
    }
    candEducationInfo.append('CandidateId', candidateInfoResult?.candidateId);
    candEducationInfo.append(
      'CandidateJobRequirementId',
      candidateInfoResult?.candidateJobRequirementId
    );

    // Education
    for (let i = 0; i < totalEducations; i++) {
      if (
        updatedEducationInfo[i]?.educationInfoId === GlobalVariables.DefaultGUID
      ) {
        addOrUpdateEducation = 'EducationData';
      } else {
        addOrUpdateEducation = 'UpdateEducationData';
      }
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.EducationInfoId`,
        String(updatedEducationInfo[i]?.educationInfoId)
      );
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.PersonId`,
        updatedEducationInfo[i]?.personId
      );
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.DegreeTypeCode`,
        String(updatedEducationInfo[i]?.degreeTypeCode)
      );
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.UniversityId`,
        updatedEducationInfo[i]?.universityId
      );
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.StartDate`,
        updatedEducationInfo[i]?.startDate
      );
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.EndDate`,
        updatedEducationInfo[i]?.endDate
      );
      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.HighestDegreeFlag`,
        String(updatedEducationInfo[i]?.highestDegreeFlag)
      );

      candEducationInfo.append(
        `EducationInfo[${i}].${addOrUpdateEducation}.MajorTypeCode`,
        String(updatedEducationInfo[i]?.majorTypeCode)
      );
      if (updatedEducationInfo[i]?.majorTypeCode1 !== null) {
        candEducationInfo.append(
          `EducationInfo[${i}].${addOrUpdateEducation}.MajorTypeCode1`,
          String(updatedEducationInfo[i]?.majorTypeCode1)
        );
      }

      if (
        updatedEducationInfo[i]?.educationInfoId ===
        uploadedEducationDocs[i]?.id
      ) {
        for (let j = 0; j < uploadedEducationDocs[i]?.fileList?.length; j++) {
          candEducationInfo.append(
            `EducationInfo[${i}].UpdateEducationData.DocumentsData.ReplacedDocuments[${j}].ResourceTypeCode`,
            String(updatedEducationInfo[i]?.resourceTypeCode)
          );

          candEducationInfo.append(
            `EducationInfo[${i}].UpdateEducationData.DocumentsData.ReplacedDocuments[${j}].DocumentPurposeCode`,
            String(updatedEducationInfo[i]?.documentPurposeCode)
          );
          candEducationInfo.append(
            `EducationInfo[${i}].UpdateEducationData.DocumentsData.ReplacedDocuments[${j}].IsNewDocument`,
            uploadedEducationDocs[i]?.fileList[j]?.id === '' ? 'true' : 'false'
          );

          candEducationInfo.append(
            `EducationInfo[${i}].UpdateEducationData.DocumentsData.ReplacedDocuments[${j}].DocumentInfo`,
            uploadedEducationDocs[i]?.fileList[j]?.file
          );
          candEducationInfo.append(
            `EducationInfo[${i}].UpdateEducationData.DocumentsData.ReplacedDocuments[${j}].DisplayName`,
            uploadedEducationDocs[i]?.fileList[j]?.displayName
          );
          candEducationInfo.append(
            `EducationInfo[${i}].UpdateEducationData.DocumentsData.ReplacedDocuments[${j}].FileDescription`,
            uploadedEducationDocs[i]?.fileList[j]?.fileDescription
          );
        }
      } else {
        for (let j = 0; j < uploadedEducationDocs[i]?.fileList?.length; j++) {
          candEducationInfo.append(
            `EducationInfo[${i}].EducationData.Documents[${j}].ResourceTypeCode`,
            String(updatedEducationInfo[i]?.resourceTypeCode)
          );

          candEducationInfo.append(
            `EducationInfo[${i}].EducationData.Documents[${j}].DocumentPurposeCode`,
            String(updatedEducationInfo[i]?.documentPurposeCode)
          );
          candEducationInfo.append(
            `EducationInfo[${i}].EducationData.Documents[${j}].IsNewDocument`,
            uploadedEducationDocs[i]?.fileList[j]?.id === '' ? 'true' : 'false'
          );

          candEducationInfo.append(
            `EducationInfo[${i}].EducationData.Documents[${j}].DocumentInfo`,
            uploadedEducationDocs[i]?.fileList[j]?.file
          );
          candEducationInfo.append(
            `EducationInfo[${i}].EducationData.Documents[${j}].DisplayName`,
            uploadedEducationDocs[i]?.fileList[j]?.displayName
          );
          candEducationInfo.append(
            `EducationInfo[${i}].EducationData.Documents[${j}].FileDescription`,
            uploadedEducationDocs[i]?.fileList[j]?.fileDescription
          );
        }
      }
    }

    if (updatedCertificationInfo.length > 0) {
      // Certification
      for (let i = 0; i < totalCertifications; i++) {
        if (
          updatedCertificationInfo[i]?.certificationId ===
          GlobalVariables.DefaultGUID
        ) {
          addOrUpdateCertification = 'CertificateData';
        } else {
          addOrUpdateCertification = 'UpdateCertificateData';
        }

        candEducationInfo.append(
          `CertificateInfo[${i}].${addOrUpdateCertification}.CertificationId`,
          String(updatedCertificationInfo[i]?.certificationId)
        );

        candEducationInfo.append(
          `CertificateInfo[${i}].${addOrUpdateCertification}.PersonId`,
          updatedCertificationInfo[i]?.personId
        );
        candEducationInfo.append(
          `CertificateInfo[${i}].${addOrUpdateCertification}.CertificateSerialNumber`,
          updatedCertificationInfo[i]?.certificateSerialNumber
        );
        candEducationInfo.append(
          `CertificateInfo[${i}].${addOrUpdateCertification}.CertificationName`,
          updatedCertificationInfo[i]?.certificationName
        );
        candEducationInfo.append(
          `CertificateInfo[${i}].${addOrUpdateCertification}.CertificationCode`,
          updatedCertificationInfo[i]?.certificationCode
        );
        if (updatedCertificationInfo[i]?.certifyingAgencyId !== undefined) {
          candEducationInfo.append(
            `CertificateInfo[${i}].${addOrUpdateCertification}.CertifyingAgencyId`,
            updatedCertificationInfo[i]?.certifyingAgencyId
          );
        }
        if (updatedCertificationInfo[i]?.certificationStatusCode) {
          candEducationInfo.append(
            `CertificateInfo[${i}].${addOrUpdateCertification}.CertificationStatusCode`,
            String(updatedCertificationInfo[i]?.certificationStatusCode)
          );
        }
        if (updatedCertificationInfo[i]?.issuedDate !== 'null') {
          candEducationInfo.append(
            `CertificateInfo[${i}].${addOrUpdateCertification}.IssuedDate`,
            String(updatedCertificationInfo[i]?.issuedDate)
          );
        }
        if (updatedCertificationInfo[i]?.expiryDate !== 'null') {
          candEducationInfo.append(
            `CertificateInfo[${i}].${addOrUpdateCertification}.ExpiryDate`,
            String(updatedCertificationInfo[i]?.expiryDate)
          );
        }

        if (
          updatedCertificationInfo[i]?.certificationId ===
          uploadedCertificationDocs[i]?.id
        ) {
          for (
            let j = 0;
            j < uploadedCertificationDocs[i]?.fileList?.length;
            j++
          ) {
            candEducationInfo.append(
              `CertificateInfo[${i}].UpdateCertificateData.DocumentsData.ReplacedDocuments[${j}].ResourceTypeCode`,
              String(updatedCertificationInfo[i]?.resourceTypeCode)
            );

            candEducationInfo.append(
              `CertificateInfo[${i}].UpdateCertificateData.DocumentsData.ReplacedDocuments[${j}].DocumentPurposeCode`,
              String(updatedCertificationInfo[i]?.documentPurposeCode)
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].UpdateCertificateData.DocumentsData.ReplacedDocuments[${j}].IsNewDocument`,
              uploadedCertificationDocs[i]?.fileList[j]?.id === ''
                ? 'true'
                : 'false'
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].UpdateCertificateData.DocumentsData.ReplacedDocuments[${j}].DocumentInfo`,
              uploadedCertificationDocs[i]?.fileList[j]?.file
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].UpdateCertificateData.DocumentsData.ReplacedDocuments[${j}].DisplayName`,
              uploadedCertificationDocs[i]?.fileList[j]?.displayName
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].UpdateCertificateData.DocumentsData.ReplacedDocuments[${j}].FileDescription`,
              uploadedCertificationDocs[i]?.fileList[j]?.fileDescription
            );
          }
        } else {
          for (
            let j = 0;
            j < uploadedCertificationDocs[i]?.fileList?.length;
            j++
          ) {
            candEducationInfo.append(
              `CertificateInfo[${i}].CertificateData.Documents[${j}].ResourceTypeCode`,
              String(updatedCertificationInfo[i]?.resourceTypeCode)
            );

            candEducationInfo.append(
              `CertificateInfo[${i}].CertificateData.Documents[${j}].DocumentPurposeCode`,
              String(updatedCertificationInfo[i]?.documentPurposeCode)
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].CertificateData.Documents[${j}].IsNewDocument`,
              uploadedCertificationDocs[i]?.fileList[j]?.id === ''
                ? 'true'
                : 'false'
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].CertificateData.Documents[${j}].DocumentInfo`,
              uploadedCertificationDocs[i]?.fileList[j]?.file
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].CertificateData.Documents[${j}].DisplayName`,
              uploadedCertificationDocs[i]?.fileList[j]?.displayName
            );
            candEducationInfo.append(
              `CertificateInfo[${i}].CertificateData.Documents[${j}].FileDescription`,
              uploadedCertificationDocs[i]?.fileList[j]?.fileDescription
            );
          }
        }
      }
    }
    return this.httpClient
      .post(`${url}`, candEducationInfo)
      .pipe(retry(1), catchError(this.handleError));
  }

  // deleteImmigrationDetailsById immigrationInfoId
  deleteImmigrationDetailsById(
    immigrationInfoId: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Immigration/delete/${immigrationInfoId}`;

    return this.httpClient
      .delete(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // deleteEducationDetailsBy EducationId
  deleteEducationDetailsById(
    educationInfoId: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set('educationInfoId', educationInfoId);
    const url = `${this.baseUrl}/Education/delete`;

    return this.httpClient
      .delete(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // deleteCertificationDetailsBy CertificationId
  deleteCertificationDetailsById(
    certificationId: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set('certificationId', certificationId);
    const url = `${this.baseUrl}/Certificate/delete`;

    return this.httpClient
      .delete(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // saveCandidateOnboardingEmergencyContacts
  saveCandidateOnboardingEmergencyContacts(
    emergencyContactResult: CandidateOnboardingEmergencyContactsResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveCandidateEmergencyContactInfo`;

    return this.httpClient
      .post<string[]>(`${url}`, emergencyContactResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Personal Info
  getCandidateOnboardingPersonalInfoByEmpOnboardingId(
    employeeOnboardingId?: string
  ): Observable<CandidateOnboardingPersonalInformationResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/candidate/personalinfo/get`;

    return this.httpClient
      .get<CandidateOnboardingPersonalInformationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Identification & Immigration Info
  getCandidateOnboardingIdentificationImmigrationInfoByEmpOnboardingId(
    employeeOnboardingId?: string
  ): Observable<CandidateOnboardingIdentificationImmigrationInformationResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetCandidateIdentityInfo`;

    return this.httpClient
      .get<CandidateOnboardingIdentificationImmigrationInformationResponse>(
        `${url}`,
        {
          params: httpParams,
        }
      )
      .pipe(retry(1), catchError(this.handleError));
  }

  // Education Info
  getCandidateOnboardingEducationInfoByEmpOnboardingId(
    employeeOnboardingId?: string
  ): Observable<CandidateOnboardingEducationInformationResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetCandidateEducationInfo`;

    return this.httpClient
      .get<CandidateOnboardingEducationInformationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // EMERGENCY CONTACTS
  getCandidateOnboardingEmergencyContacts(
    employeeOnboardingId?: string
  ): Observable<CandidateOnboardingEmergencyContactsResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetCandidateEmergencyContactInfo`;

    return this.httpClient
      .get<CandidateOnboardingEmergencyContactsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Employment Compensation Information
  getEmploymentCompensationInformation(
    employeeOnboardingId?: string
  ): Observable<EmploymentCompensationInfoResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/hr-verify/GetEmploymentCompensationInfo`;

    return this.httpClient
      .get<EmploymentCompensationInfoResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Comment
  getHRValidationCommentsByEmpOnboardingId(
    employeeOnboardingId?: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/hr-verify/GetValidationComments`;

    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .get<any>(`${url}`, {
          params: httpParams,
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  saveHRComment(
    // tslint:disable-next-line: no-any
    CommentList: any
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/hr-verify/SaveValidationComments`;
    const headers = { 'content-type': 'application/json' };
    return this.httpClient
      .post<string>(`${url}`, JSON.stringify(CommentList), { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  // GET - WORK ELIGIBILITY & I9 FORM
  getCandidateOnboardingWorkEligibilityAndI9Form(
    employeeOnboardingId?: string
  ): Observable<CandidateOnboardingWorkEligibilityAndI9FormResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetCandidateI9Info`;

    return this.httpClient
      .get<CandidateOnboardingWorkEligibilityAndI9FormResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }
  // SAVE - WORK ELIGIBILITY & I9 FORM
  saveCandidateOnboardingWorkEligibilityAndI9Form(
    workEligibilityAndI9FormResult: CandidateOnboardingWorkEligibilityAndI9FormResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveCandidateI9Info`;

    return this.httpClient
      .post<string[]>(`${url}`, workEligibilityAndI9FormResult)
      .pipe(retry(1), catchError(this.handleError));
  }

  // documents tab
  getCandidateOnboardingDocuments(
    employeeOnboardingId: string
  ): Observable<CandidateOnboardingDocumentsResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      employeeOnboardingId
    );
    const url = `${environment.apiBaseUrl}/Onboarding/GetCandidateSignatureDocuments`;

    return this.httpClient
      .get<CandidateOnboardingDocumentsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // GENERATE I9 FORM
  generateI9Form(
    webformTypeId: string,
    employeeOnboardingId: string,
    candSignFile: File,
    prepSignFile: File,
    employerSignFile?: File
  ): Observable<CandidateOnboardingI9FormPreviewResponse> {
    const url = `${environment.apiBaseUrl}/uscis/Generate/I9form`;
    const signFormData = new FormData();
    signFormData.append(`WebformTypeId`, webformTypeId);
    signFormData.append(`ResourceTypeCode`, '39');
    signFormData.append(`ResourceValue`, employeeOnboardingId);

    if (candSignFile && prepSignFile) {
      signFormData.append(`Signatures[${0}].SignatureName`, 'CSignDocFilePath');
      signFormData.append(`Signatures[${0}].Signature`, candSignFile);
      signFormData.append(`Signatures[${1}].SignatureName`, 'PSignDocFilePath');
      signFormData.append(`Signatures[${1}].Signature`, prepSignFile);
    } else if (candSignFile) {
      signFormData.append(`Signatures[${0}].SignatureName`, 'CSignDocFilePath');
      signFormData.append(`Signatures[${0}].Signature`, candSignFile);
    } else if (prepSignFile) {
      signFormData.append(`Signatures[${0}].SignatureName`, 'PSignDocFilePath');
      signFormData.append(`Signatures[${0}].Signature`, prepSignFile);
    } else if (employerSignFile) {
      signFormData.append(`Signatures[${0}].SignatureName`, 'ESignDocFilePath');
      signFormData.append(`Signatures[${0}].Signature`, employerSignFile);
    }

    return this.httpClient
      .post<CandidateOnboardingI9FormPreviewResponse>(`${url}`, signFormData)
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  saveSignature(userId: string, signFile: File): Observable<any> {
    const url = `${this.baseUrl}/user/signature/save`;
    const signInfo = new FormData();

    signInfo.append(`UserId`, userId);
    signInfo.append(`Document.DocumentInfo`, signFile);
    signInfo.append(`Document.ResourceTypeCode`, '1');
    signInfo.append(`Document.DisplayName`, signFile.name);
    signInfo.append(`Document.FileDescription`, 'New Signature');
    signInfo.append(`Document.DocumentPurposeCode`, '19');
    signInfo.append(`Document.IsNewDocument`, 'true');

    return this.httpClient
      .post(`${url}`, signInfo)
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  createUSCISCase(empOnboardingData: any): Observable<CreateUSCISCase> {
    const url = `${this.baseUrl}/USCIS/create-case`;
    const headers = { 'content-type': 'application/json' };
    return this.httpClient
      .post<CreateUSCISCase>(`${url}`, empOnboardingData, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  tncAction(empOnboardingData: any): Observable<TncAction> {
    const url = `${this.baseUrl}/USCIS/tnc-action`;
    const headers = { 'content-type': 'application/json' };
    return this.httpClient
      .post<TncAction>(`${url}`, empOnboardingData, { headers })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  getPhotoMatchData(photoMatchData: any): Observable<any> {
    const url = `${this.baseUrl}/USCIS/photo-match`;
    const headers = { 'content-type': 'application/json' };
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<any>(`${url}`, photoMatchData, { headers })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // Get Case Results Data
  getCaseResultsData(employeeOnboardingId?: string): Observable<GetCaseData> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${this.baseUrl}/USCIS/retrieve-case`;
    return this.httpClient
      .get<GetCaseData>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  saveUploadedPassportDocs(
    employeeOnboardingId: string,
    frontPhoto: File,
    backPhoto: File
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/uscis/scan-and-upload`;
    const formData = new FormData();
    formData.append(`EmployeeOnboardingId`, employeeOnboardingId);
    formData.append(`FrontPhoto`, frontPhoto);
    formData.append(`BackPhoto`, backPhoto);
    return this.httpClient
      .post(`${url}`, formData)
      .pipe(retry(1), catchError(this.handleError));
  }
  // generate signed document
  saveSignAndGenerateDocuments(
    saveSignAndGenerateDocumentsResult: SaveSignAndGenerateDocumentsResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/WebFormTemplate/Generate`;
    const docData = new FormData();

    docData.append(
      `ResourceTypeCode`,
      String(saveSignAndGenerateDocumentsResult.resourceTypeCode)
    );
    docData.append(
      `ResourceValue`,
      saveSignAndGenerateDocumentsResult.resourceValue
    );
    docData.append(
      `InputParams[0].Key`,
      saveSignAndGenerateDocumentsResult.inputParamsKey1
    );
    docData.append(
      `InputParams[0].Value`,
      saveSignAndGenerateDocumentsResult.inputParamsValue1
    );
    docData.append(
      `DocumentInfo.ResourceTypeCode`,
      String(saveSignAndGenerateDocumentsResult.docResourceTypeCode)
    );
    docData.append(
      `DocumentInfo.ResourceValue`,
      String(saveSignAndGenerateDocumentsResult.docResourceValue)
    );
    docData.append(
      `DocumentInfo.DisplayName`,
      saveSignAndGenerateDocumentsResult.docDisplayName
    );
    docData.append(
      `DocumentInfo.FileDescription`,
      saveSignAndGenerateDocumentsResult.docFileDescription
    );
    docData.append(
      `DocumentInfo.DocumentPurposeCode`,
      String(saveSignAndGenerateDocumentsResult.docPurposeCode)
    );
    if (
      saveSignAndGenerateDocumentsResult.inputParamsValue2 ===
      GlobalVariables.DefaultGUID
    ) {
      docData.append(
        `InputParams[1].Key`,
        saveSignAndGenerateDocumentsResult.inputParamsKey2
      );
      docData.append(
        `InputParams[1].Value`,
        saveSignAndGenerateDocumentsResult.inputParamsValue2
      );
      docData.append(
        `Signatures[${0}].SignatureName`,
        saveSignAndGenerateDocumentsResult.signatureName
      );
      docData.append(
        `Signatures[${0}].Signature`,
        // tslint:disable-next-line: no-non-null-assertion
        saveSignAndGenerateDocumentsResult.signature!
      );
    } else {
      docData.append(
        `InputParams[1].Key`,
        saveSignAndGenerateDocumentsResult.inputParamsKey2
      );
      docData.append(
        `InputParams[1].Value`,
        saveSignAndGenerateDocumentsResult.inputParamsValue2
      );
    }
    return this.httpClient
      .post<SaveSignAndGenerateDocumentsResponse>(`${url}`, docData)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Further Action Notice
  getFurtherActionNotice(
    employeeOnboardingId: string,
    tncLangDropdownValue: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('employeeOnboardingId', employeeOnboardingId)
      .set('language', tncLangDropdownValue.toLowerCase());
    const url = `${this.baseUrl}/uscis/get-fan`;

    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .get<any>(`${url}`, {
          params: httpParams,
          responseType: 'arraybuffer' as 'json',
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // Get Referral Date Confirmation
  getReferralDateConfirmation(
    employeeOnboardingId: string,
    tncLangDropdownValue: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('employeeOnboardingId', employeeOnboardingId)
      .set('language', tncLangDropdownValue.toLowerCase());
    const url = `${this.baseUrl}/uscis/get-rdc`;

    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .get<any>(`${url}`, {
          params: httpParams,
          responseType: 'arraybuffer' as 'json',
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // GET TAX INFORMATION
  getCandidateOnboardingTaxInformation(
    employeeOnboardingId: string
  ): Observable<CandidateOnboardingTaxInformationResponse> {
    const url = `${environment.apiBaseUrl}/TaxInformation/${employeeOnboardingId}`;

    return this.httpClient
      .get<CandidateOnboardingTaxInformationResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // SAVE TAX INFO INTO MULTIPLE STEPS
  // Step1
  saveCandidateOnboardingTaxFilingStatus(
    filingStatus: FilingStatus
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/TaxInformation/SaveFederalFilingStatus`;

    return this.httpClient
      .post<FilingStatus>(`${url}`, filingStatus)
      .pipe(retry(1), catchError(this.handleError));
  }
  // Step2
  saveCandidateOnboardingTaxMultipleJobs(
    multipleJobs: MultipleJobs
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/TaxInformation/SaveMultipleJobs`;

    return this.httpClient
      .post<MultipleJobs>(`${url}`, multipleJobs)
      .pipe(retry(1), catchError(this.handleError));
  }
  // Step3
  saveCandidateOnboardingTaxClaimDependents(
    claimDependents: ClaimDependents
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/TaxInformation/SaveClaimDependents`;

    return this.httpClient
      .post<ClaimDependents>(`${url}`, claimDependents)
      .pipe(retry(1), catchError(this.handleError));
  }
  // Step4
  saveCandidateOnboardingTaxOtherAdjustments(
    otherAdjustments: OtherAdjustments
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/TaxInformation/SaveOtherAdjustments`;

    return this.httpClient
      .post<OtherAdjustments>(`${url}`, otherAdjustments)
      .pipe(retry(1), catchError(this.handleError));
  }
  // Sign
  saveCandidateOnboardingTaxGenerateW4(
    generateW4: GenerateW4
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/TaxInformation/GenerateW4`;

    const taxData = new FormData();
    if (generateW4.taxInformationId) {
      taxData.append(`TaxInformationId`, String(generateW4.taxInformationId));
    }
    taxData.append(
      `EmployeeOnboardingId`,
      String(generateW4.employeeOnboardingId)
    );
    if (generateW4.candidateSignatureId) {
      taxData.append(
        `CandidateSignatureId`,
        String(generateW4.candidateSignatureId)
      );
    } else {
      taxData.append(
        `CandidateSignature`,
        generateW4.candidateSignature as File
      );
    }
    return this.httpClient
      .post<GenerateW4>(`${url}`, taxData)
      .pipe(retry(1), catchError(this.handleError));
  }
  // State Tax
  saveCandidateOnboardingStateTax(
    stateTax: StateTax
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/TaxInformation/SaveStateTax`;

    return this.httpClient
      .post<StateTax>(`${url}`, stateTax)
      .pipe(retry(1), catchError(this.handleError));
  }

  // saveProfilePhoto()
  saveProfilePhoto(
    docInfo: File,
    displayName: string,
    resourceValue: string,
    documentId: string = ''
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const profileDocData = new FormData();

    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].DocumentInfo`,
      docInfo
    );
    profileDocData.append(
      `DocumentRequest.ReplacedDocuments[0].ResourceTypeCode`,
      '4'
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
      '36'
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
  // tslint:disable-next-line: no-any
  saveFICATaxInfo(ficaTaxInfoData: SaveFICATaxInfo): Observable<any> {
    const url = `${this.baseUrl}/TaxInformation/SaveFICATaxInfo`;
    const headers = { 'content-type': 'application/json' };
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<any>(`${url}`, ficaTaxInfoData, { headers })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  getFedralTaxWithHolding(
    resourceValue: string
  ): Observable<GetFedralTaxWithHolding> {
    const url = `${this.baseUrl}/TaxInformation/GetW4/${resourceValue}`;
    return this.httpClient
      .get<GetFedralTaxWithHolding>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Case Closure Report
  getCaseClosureReport(
    employeeOnboardingId?: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${this.baseUrl}/USCIS/get-crd`;
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .get<any>(`${url}`, {
          params: httpParams,
          responseType: 'arraybuffer' as 'json',
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // Submit ADP Onboarding
  submitADPOnboarding(
    employeeOnboardingId: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${environment.apiBaseUrl}/ADP/onboarding/${employeeOnboardingId}`;

    return this.httpClient
      .post<string>(`${url}`, {})
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Rejection Email Content Data
  GetRejectionEmailContentData(
    employeeOnboardingId?: string
  ): Observable<GetRejectionEmailContentResponse> {
    const httpParams = new HttpParams().set(
      'employeeOnboardingId',
      String(employeeOnboardingId)
    );
    const url = `${this.baseUrl}/Onboarding/hr-verify/GetRejectionEmailContent`;
    return this.httpClient
      .get<GetRejectionEmailContentResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  sendRejectionEmailContent(
    rejectionEmailContentResult: GetRejectionEmailContentResult
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/hr-verify/SendRejectionEmail`;

    const sendEmail = new FormData();
    sendEmail.append(
      'EmployeeOnboardingId',
      rejectionEmailContentResult.employeeOnboardingId
    );
    for (let i = 0; i < rejectionEmailContentResult?.to?.length; i++) {
      sendEmail.append(`To[${i}]`, rejectionEmailContentResult?.to[i]);
    }
    sendEmail.append('Subject', rejectionEmailContentResult.subject);
    sendEmail.append('Body', rejectionEmailContentResult.body);

    return this.httpClient
      .post<GetRejectionEmailContentResult>(`${url}`, sendEmail)
      .pipe(retry(1), catchError(this.handleError));
  }

  // HR Verify Education Scction
  updateHRVerifyEducationStemFlag(
    stemFlagInfoList: OnBoardStatus[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Education/UpdateStem`;
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .put<any>(`${url}`, stemFlagInfoList)
        .pipe(retry(1), catchError(this.handleError))
    );
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
