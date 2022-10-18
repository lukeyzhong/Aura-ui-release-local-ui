import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { GlobalVariables } from '../../../shared/enums/global-variables.enum';
import { environment } from 'src/environments/environment';
import {
  CertificationResponse,
  CertificationResult,
} from '../interface/certification.interface';
import {
  DrivingLicenseResponse,
  DrivingLicenseResult,
} from '../interface/driving-license.interface';
import {
  EducationResponse,
  EducationResult,
} from '../interface/education.interface';
import {
  EmploymentAgreementResponse,
  EmploymentAgreementResult,
} from '../interface/employment-agreement-documents.interface';
import { NotesResponse, NotesResult } from '../interface/notes.interface';
import {
  PassportResponse,
  PassportResult,
} from '../interface/passport.interface';
import { SkillsResponse, SkillsResult } from '../interface/skills.interface';
import { SSNResponse } from '../interface/ssn.interface';
import { UserActivityResponse } from '../interface/user-activity.interface';

@Injectable({
  providedIn: 'root',
})
export class GenericProfileApiService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  // Get Education By PersonId
  getPassportByPersonId(personId: string): Observable<PassportResponse> {
    const httpParams = new HttpParams().set('personId', personId);

    const url = `${this.baseUrl}/Passport/GetPassport`;
    return this.httpClient
      .get<PassportResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Education By PersonId
  getEducationByPersonId(personId: string): Observable<EducationResponse> {
    const httpParams = new HttpParams().set('personId', personId);

    const url = `${this.baseUrl}/Education/GetEducation`;
    return this.httpClient
      .get<EducationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get SSN By PersonId
  getSSNByPersonId(personId: string): Observable<SSNResponse> {
    const url = `${this.baseUrl}/ssn/get/${personId}`;
    return this.httpClient
      .get<SSNResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get DrivingLicense By PersonId
  getDrivingLicenseByPersonId(
    personId: string
  ): Observable<DrivingLicenseResponse> {
    const url = `${this.baseUrl}/DrivingLicense/get/${personId}`;
    return this.httpClient
      .get<DrivingLicenseResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // ----------------- SAVE PASSPORT ----------------------
  savePassportDocuments(
    actionType: string,
    passportResult: PassportResult,
    newFileAddedCount: number,
    docAddFileDescription: string[],
    docAddDisplayName: string[],
    docAddFile: File[],
    docUpdateId: string[],
    docUpdateDisplayName: string[],
    docUpdateFileDescription: string[],
    docDeleteId: string[]
  ): Observable<PassportResult> {
    const passportDoc = new FormData();

    if (passportResult?.passportInfoId) {
      passportDoc.append(
        'PassportInfoId',
        passportResult?.passportInfoId as string
      );
    }

    passportDoc.append('PersonId', passportResult.personId);
    passportDoc.append('PassportNumber', passportResult.passportNumber);
    passportDoc.append('PassportIssueDate', passportResult.passportIssueDate);
    passportDoc.append('PassportExpiryDate', passportResult.passportExpiryDate);
    passportDoc.append(
      'PassportIssueCountryCode',
      passportResult.passportIssueCountryCode.toString()
    );
    passportDoc.append('PassportIssuedCity', passportResult.passportIssuedCity);
    passportDoc.append(
      'PassportIssueCountry',
      passportResult.passportIssueCountry
    );

    if (newFileAddedCount > 0) {
      switch (actionType) {
        case 'Add':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              passportDoc.append(
                `Documents[${i}].ResourceTypeCode`,
                passportResult.resourceTypeCode.toString()
              );
              passportDoc.append(
                `Documents[${i}].DocumentPurposeCode`,
                passportResult.documentPurposeCode.toString()
              );
              passportDoc.append(
                `Documents[${i}].IsNewDocument`,
                passportResult.isNewDocument ? 'true' : 'false'
              );
              passportDoc.append(`Documents[${i}].DocumentInfo`, docAddFile[i]);
              passportDoc.append(
                `Documents[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              passportDoc.append(
                `Documents[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;

        case 'Edit':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              passportDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
                passportResult.resourceTypeCode.toString()
              );
              passportDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
                passportResult.documentPurposeCode.toString()
              );
              passportDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
                passportResult.isNewDocument ? 'true' : 'false'
              );
              passportDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
                docAddFile[i]
              );
              passportDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              passportDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;
      }
    }

    if (docUpdateId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docUpdateId.length; i++) {
        passportDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].DocumentId`,
          docUpdateId[i]
        );
        passportDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewName`,
          docUpdateDisplayName[i]
        );
        passportDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewDescription`,
          docUpdateFileDescription[i]
        );
      }
    }

    if (docDeleteId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docDeleteId.length; i++) {
        passportDoc.append(
          `DocumentsData.DeletedDocuments[${i}]`,
          docDeleteId[i]
        );
      }
    }

    let url!: Observable<PassportResult>;
    switch (actionType) {
      case 'Add':
        url = this.httpClient
          .post<PassportResult>(`${this.baseUrl}/Passport/add`, passportDoc)
          .pipe(retry(1), catchError(this.handleError));
        break;
      case 'Edit':
        url = this.httpClient
          .put<PassportResult>(`${this.baseUrl}/Passport/update`, passportDoc)
          .pipe(retry(1), catchError(this.handleError));
        break;
    }

    return url;
  }

  // ----------------- SAVE DRIVING LICENSE ----------------------
  saveDrivingLicenseDocuments(
    actionType: string,
    dLResult: DrivingLicenseResult,
    newFileAddedCount: number,
    docAddFileDescription: string[],
    docAddDisplayName: string[],
    docAddFile: File[],
    docUpdateId: string[],
    docUpdateDisplayName: string[],
    docUpdateFileDescription: string[],
    docDeleteId: string[]
  ): Observable<DrivingLicenseResult> {
    const drivingLicenseDoc = new FormData();

    if (dLResult?.drivingLicenseID) {
      drivingLicenseDoc.append(
        'DrivingLicenseID',
        dLResult?.drivingLicenseID as string
      );
    }

    drivingLicenseDoc.append('PersonId', dLResult.personId);
    drivingLicenseDoc.append('DrivingLicenseNo', dLResult.drivingLicenseNo);
    drivingLicenseDoc.append('IssueDate', dLResult.issueDate);
    drivingLicenseDoc.append('ExpiryDate', dLResult.expiryDate);
    drivingLicenseDoc.append(
      'Location.LocationTypeCode',
      dLResult.location.locationTypeCode.toString()
    );
    drivingLicenseDoc.append(
      'Location.ResourceTypeCode',
      dLResult.location.resourceTypeCode.toString()
    );
    drivingLicenseDoc.append('Location.City', dLResult.location.city);
    drivingLicenseDoc.append(
      'Location.StateCode',
      dLResult.location.stateCode.toString()
    );
    drivingLicenseDoc.append('Location.zip', dLResult.location.zip);

    if (newFileAddedCount > 0) {
      switch (actionType) {
        case 'Add':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              drivingLicenseDoc.append(
                `Documents[${i}].ResourceTypeCode`,
                dLResult.resourceTypeCode.toString()
              );
              drivingLicenseDoc.append(
                `Documents[${i}].DocumentPurposeCode`,
                dLResult.documentPurposeCode.toString()
              );
              drivingLicenseDoc.append(
                `Documents[${i}].IsNewDocument`,
                dLResult.isNewDocument ? 'true' : 'false'
              );
              drivingLicenseDoc.append(
                `Documents[${i}].DocumentInfo`,
                docAddFile[i]
              );
              drivingLicenseDoc.append(
                `Documents[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              drivingLicenseDoc.append(
                `Documents[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;

        case 'Edit':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              drivingLicenseDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
                dLResult.resourceTypeCode.toString()
              );
              drivingLicenseDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
                dLResult.documentPurposeCode.toString()
              );
              drivingLicenseDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
                dLResult.isNewDocument ? 'true' : 'false'
              );
              drivingLicenseDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
                docAddFile[i]
              );
              drivingLicenseDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              drivingLicenseDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;
      }
    }

    if (docUpdateId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docUpdateId.length; i++) {
        drivingLicenseDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].DocumentId`,
          docUpdateId[i]
        );
        drivingLicenseDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewName`,
          docUpdateDisplayName[i]
        );
        drivingLicenseDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewDescription`,
          docUpdateFileDescription[i]
        );
      }
    }
    if (docDeleteId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docDeleteId.length; i++) {
        drivingLicenseDoc.append(
          `DocumentsData.DeletedDocuments[${i}]`,
          docDeleteId[i]
        );
      }
    }

    let url!: Observable<DrivingLicenseResult>;
    switch (actionType) {
      case 'Add':
        url = this.httpClient
          .post<DrivingLicenseResult>(
            `${this.baseUrl}/DrivingLicense/add`,
            drivingLicenseDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
      case 'Edit':
        url = this.httpClient
          .put<DrivingLicenseResult>(
            `${this.baseUrl}/DrivingLicense/update`,
            drivingLicenseDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
    }

    return url;
  }

  // ----------------- SAVE EDUCATION ----------------------
  saveEducationDocuments(
    actionType: string,
    educationResult: EducationResult,
    newFileAddedCount: number,
    docAddFileDescription: string[],
    docAddDisplayName: string[],
    docAddFile: File[],
    docUpdateId: string[],
    docUpdateDisplayName: string[],
    docUpdateFileDescription: string[],
    docDeleteId: string[]
  ): Observable<EducationResult> {
    const educationDoc = new FormData();

    if (educationResult?.educationInfoId) {
      educationDoc.append(
        'EducationInfoId',
        educationResult?.educationInfoId as string
      );
    }

    educationDoc.append('PersonId', educationResult.personId);
    educationDoc.append(
      'DegreeTypeCode',
      educationResult.degreeTypeCode.toString()
    );
    educationDoc.append('UniversityId', educationResult.universityId);
    educationDoc.append('StartDate', educationResult.startDate);
    educationDoc.append('EndDate', educationResult.endDate);
    educationDoc.append(
      'HighestDegreeFlag',
      String(educationResult.highestDegreeFlag)
    );
    educationDoc.append('StemFlag', String(educationResult.stemFlag));
    educationDoc.append(
      'MajorTypeCode',
      educationResult.majorTypeCode.toString()
    );
    educationDoc.append('MajorTypeCode1', educationResult.majorTypeCode1);

    if (newFileAddedCount > 0) {
      switch (actionType) {
        case 'Add':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              educationDoc.append(
                `Documents[${i}].ResourceTypeCode`,
                educationResult.resourceTypeCode.toString()
              );
              educationDoc.append(
                `Documents[${i}].DocumentPurposeCode`,
                educationResult.documentPurposeCode.toString()
              );
              educationDoc.append(
                `Documents[${i}].IsNewDocument`,
                educationResult.isNewDocument ? 'true' : 'false'
              );
              educationDoc.append(
                `Documents[${i}].DocumentInfo`,
                docAddFile[i]
              );
              educationDoc.append(
                `Documents[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              educationDoc.append(
                `Documents[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;

        case 'Edit':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              educationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
                educationResult.resourceTypeCode.toString()
              );
              educationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
                educationResult.documentPurposeCode.toString()
              );
              educationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
                educationResult.isNewDocument ? 'true' : 'false'
              );
              educationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
                docAddFile[i]
              );
              educationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              educationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;
      }
    }
    if (docUpdateId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docUpdateId.length; i++) {
        educationDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].DocumentId`,
          docUpdateId[i]
        );
        educationDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewName`,
          docUpdateDisplayName[i]
        );
        educationDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewDescription`,
          docUpdateFileDescription[i]
        );
      }
    }

    if (docDeleteId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docDeleteId.length; i++) {
        educationDoc.append(
          `DocumentsData.DeletedDocuments[${i}]`,
          docDeleteId[i]
        );
      }
    }

    let url!: Observable<EducationResult>;
    switch (actionType) {
      case 'Add':
        url = this.httpClient
          .post<EducationResult>(`${this.baseUrl}/Education/add`, educationDoc)
          .pipe(retry(1), catchError(this.handleError));
        break;
      case 'Edit':
        url = this.httpClient
          .put<EducationResult>(
            `${this.baseUrl}/Education/update`,
            educationDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
    }

    return url;
  }

  // Get DocumentsByEmployeeOrCandidateId
  getDocumentsByEmployeeOrCandidateId(
    resourceTypeCode: number,
    id: string,
    documentType: string
  ): Observable<EmploymentAgreementResponse> {
    if (documentType.charAt(0) === ',') {
      documentType = documentType.substr(1);
    }
    const httpParams = new HttpParams()
      .set('resourceTypeCode', resourceTypeCode.toString())
      .set('resourceId', id)
      .set('documentPurposeTypes', documentType);

    const url = `${this.baseUrl}/Document/DocumentsByPurposeIds`;
    return this.httpClient
      .get<EmploymentAgreementResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // ----------------- SAVE EMPLOYMENT AND AGREEMENT ----------------------
  saveEmployeeOrCandidateDocuments(
    actionType: string,
    id: string,
    docDeleteId: string[],
    documentTypeCode: number = 0,
    newFileAddedCount: number = 0,
    docAddFileDescription: string[] = [],
    docAddDisplayName: string[] = [],
    docAddFile: File[] = [],
    docUpdateId: string[] = [],
    docUpdateDisplayName: string[] = [],
    docUpdateFileDescription: string[] = [],
    resourceTypeCode: number
  ): Observable<EmploymentAgreementResult> {
    const employeeOrCandidateDoc = new FormData();

    if (newFileAddedCount > 0) {
      switch (actionType) {
        case 'Add':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              employeeOrCandidateDoc.append(
                `Documents[${i}].ResourceTypeCode`,
                resourceTypeCode.toString()
              );
              employeeOrCandidateDoc.append(
                `Documents[${i}].ResourceValue`,
                id
              );
              employeeOrCandidateDoc.append(
                `Documents[${i}].DocumentPurposeCode`,
                String(documentTypeCode)
              );
              employeeOrCandidateDoc.append(
                `Documents[${i}].IsNewDocument`,
                'true'
              );
              employeeOrCandidateDoc.append(
                `Documents[${i}].DocumentInfo`,
                docAddFile[i]
              );
              employeeOrCandidateDoc.append(
                `Documents[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              employeeOrCandidateDoc.append(
                `Documents[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;

        case 'Edit':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].ResourceTypeCode`,
                resourceTypeCode.toString()
              );
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].ResourceValue`,
                id
              );
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].DocumentPurposeCode`,
                String(documentTypeCode)
              );
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].IsNewDocument`,
                'true'
              );
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].DocumentInfo`,
                docAddFile[i]
              );
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              employeeOrCandidateDoc.append(
                `ReplacedDocuments[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;
      }
    }

    if (docUpdateId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docUpdateId.length; i++) {
        employeeOrCandidateDoc.append(
          `ReNamedDocuments[${i}].DocumentId`,
          docUpdateId[i]
        );
        employeeOrCandidateDoc.append(
          `ReNamedDocuments[${i}].NewName`,
          docUpdateDisplayName[i]
        );
        employeeOrCandidateDoc.append(
          `ReNamedDocuments[${i}].NewDescription`,
          docUpdateFileDescription[i]
        );
      }
    }

    if (docDeleteId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docDeleteId.length; i++) {
        employeeOrCandidateDoc.append(`DeletedDocuments[${i}]`, docDeleteId[i]);
      }
    }

    let url!: Observable<EmploymentAgreementResult>;
    switch (actionType) {
      case 'Add':
        url = this.httpClient
          .post<EmploymentAgreementResult>(
            `${this.baseUrl}/Document/add`,
            employeeOrCandidateDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
      case 'Edit':
        url = this.httpClient
          .put<EmploymentAgreementResult>(
            `${this.baseUrl}/Document/update`,
            employeeOrCandidateDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
    }

    return url;
  }

  // DELETE Documents/Sign by document id
  deleteDocumentsOrSignaturesByDocumentId(
    docDeleteId: string[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Document/delete`;

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: docDeleteId,
    };

    return this.httpClient
      .delete(`${url}`, options)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Skills By PersonId
  getSkillsByPersonId(personId: string): Observable<SkillsResponse> {
    const httpParams = new HttpParams().set('personId', personId);

    const url = `${this.baseUrl}/Skills/getbyperson`;
    return this.httpClient
      .get<SkillsResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // SAVE SKILLS
  // tslint:disable-next-line: no-any
  saveSkills(skill: SkillsResult): Observable<any> {
    const url = `${this.baseUrl}/Skills/save`;

    return this.httpClient
      .post<SkillsResult>(`${url}`, skill)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Certifications By PersonId
  getCertificationsByPersonId(
    personId: string
  ): Observable<CertificationResponse> {
    const httpParams = new HttpParams().set('personId', personId);

    const url = `${this.baseUrl}/Certificate/getbyperson`;
    return this.httpClient
      .get<CertificationResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // ----------------- SAVE CERTIFICATIONS ----------------------
  saveCertificationDocuments(
    actionType: string,
    certificationResult: CertificationResult,
    newFileAddedCount: number,
    docAddFileDescription: string[],
    docAddDisplayName: string[],
    docAddFile: File[],
    docUpdateId: string[],
    docUpdateDisplayName: string[],
    docUpdateFileDescription: string[],
    docDeleteId: string[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const certificationDoc = new FormData();

    if (certificationResult?.certificationId) {
      certificationDoc.append(
        'CertificationId',
        certificationResult?.certificationId as string
      );
    }

    certificationDoc.append('PersonId', certificationResult.personId);

    certificationDoc.append(
      'CertificateSerialNumber',
      certificationResult.certificateSerialNumber
    );

    certificationDoc.append(
      'CertificationName',
      certificationResult.certificationName
    );

    certificationDoc.append(
      'CertificationCode',
      certificationResult.certificationCode
    );

    certificationDoc.append(
      'CertifyingAgencyId',
      certificationResult.certifyingAgencyId
    );
    if (
      certificationResult.certifyingAgencyId === GlobalVariables.DefaultGUID
    ) {
      certificationDoc.append(
        'CertifyingAgency',
        String(certificationResult.certifyingAgency)
      );
      certificationDoc.append(
        'CertifyingAgencyDomain',
        String(certificationResult.certifyingAgencyDomain)
      );
    }
    certificationDoc.append(
      'CertificationStatusCode',
      certificationResult.certificationStatusCode.toString()
    );
    certificationDoc.append(
      'CertificationStatus',
      String(certificationResult.certificationStatus)
    );
    certificationDoc.append('IssuedDate', certificationResult.issuedDate);
    certificationDoc.append('ExpiryDate', certificationResult.expiryDate);

    if (newFileAddedCount > 0) {
      switch (actionType) {
        case 'Add':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              certificationDoc.append(
                `Documents[${i}].ResourceTypeCode`,
                certificationResult.resourceTypeCode.toString()
              );
              certificationDoc.append(
                `Documents[${i}].DocumentPurposeCode`,
                certificationResult.documentPurposeCode.toString()
              );
              certificationDoc.append(
                `Documents[${i}].IsNewDocument`,
                certificationResult.isNewDocument ? 'true' : 'false'
              );
              certificationDoc.append(
                `Documents[${i}].DocumentInfo`,
                docAddFile[i]
              );
              certificationDoc.append(
                `Documents[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              certificationDoc.append(
                `Documents[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;

        case 'Edit':
          {
            for (let i = 0; i < newFileAddedCount; i++) {
              certificationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].ResourceTypeCode`,
                certificationResult.resourceTypeCode.toString()
              );
              certificationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentPurposeCode`,
                certificationResult.documentPurposeCode.toString()
              );
              certificationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].IsNewDocument`,
                certificationResult.isNewDocument ? 'true' : 'false'
              );
              certificationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DocumentInfo`,
                docAddFile[i]
              );
              certificationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].DisplayName`,
                docAddDisplayName[i]
              );
              certificationDoc.append(
                `DocumentsData.ReplacedDocuments[${i}].FileDescription`,
                docAddFileDescription[i]
              );
            }
          }
          break;
      }
    }
    if (docUpdateId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docUpdateId.length; i++) {
        certificationDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].DocumentId`,
          docUpdateId[i]
        );
        certificationDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewName`,
          docUpdateDisplayName[i]
        );
        certificationDoc.append(
          `DocumentsData.ReNamedDocuments[${i}].NewDescription`,
          docUpdateFileDescription[i]
        );
      }
    }

    if (docDeleteId.length > 0 && actionType === 'Edit') {
      for (let i = 0; i < docDeleteId.length; i++) {
        certificationDoc.append(
          `DocumentsData.DeletedDocuments[${i}]`,
          docDeleteId[i]
        );
      }
    }

    let url!: Observable<CertificationResult>;
    switch (actionType) {
      case 'Add':
        url = this.httpClient
          .post<CertificationResult>(
            `${this.baseUrl}/Certificate/add`,
            certificationDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
      case 'Edit':
        url = this.httpClient
          .put<CertificationResult>(
            `${this.baseUrl}/Certificate/update`,
            certificationDoc
          )
          .pipe(retry(1), catchError(this.handleError));
        break;
    }

    return url;
  }

  // Get notes by id
  getNotesById(
    resourceType: number,
    resourceValue: string,
    commentType: number
  ): Observable<NotesResponse> {
    const httpParams = new HttpParams()
      .set('resourceType', resourceType.toString())
      .set('resourceValue', resourceValue)
      .set('commentType', commentType.toString());

    const url = `${this.baseUrl}/Comment/GetNotes`;
    return this.httpClient
      .get<NotesResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // SAVE NOTES
  saveNotes(notes: NotesResult): Observable<NotesResult> {
    const url = `${this.baseUrl}/Comment/SaveComment`;

    return this.httpClient
      .post<NotesResult>(`${url}`, notes)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get User Activity By Id filter by category list
  getUserActivityById(
    resourceTypeCode: number,
    id: string,
    filter: string[] = []
  ): Observable<UserActivityResponse> {
    let url = `${this.baseUrl}/UserActivity/GetUserActivity?resourceTypeCode=${resourceTypeCode}&resourceValue=${id}`;
    if (filter.length > 0) {
      for (let i = 0; i < filter.length; i++) {
        url += `&filter[${i}]=${filter[i]}`;
      }
    }

    return this.httpClient
      .get<UserActivityResponse>(`${url}`)
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
