import { Component, ElementRef, Inject, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { DatePipe, DOCUMENT } from '@angular/common';
import { MatStepper } from '@angular/material/stepper';
import {
  Addresses,
  AddressType,
  ContactAddressType,
  SocialMediaLinks,
} from '../../../../../../aura/search/interface/person.interface';
import {
  CandidateOnboardingEducationInformationResult,
  CandidateOnboardingIdentificationImmigrationInformationResult,
  CandidateOnboardingInformationResult,
  CandidateOnboardingPersonalInformationResult,
  CertificateInfo,
  EducationInfo,
  ImmigrationData,
  UploadedEducationDocuments,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { AgeValidator } from '../../../../../../shared/custom-validators/custom-validator-age';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { SSNResult } from '../../../../../../aura/search/interface/ssn.interface';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
import { PassportResult } from '../../../../../../aura/search/interface/passport.interface';
import {
  DrivingLicenseResult,
  LocationResult,
} from '../../../../../../aura/search/interface/driving-license.interface';
import {
  EmployeeImmigrationAddEditRecord,
  EmployeeImmigrationResult,
} from '../../../../../../aura/search/interface/employee-profile/employee-profile-immigration.interface';
import { EducationResult } from '../../../../../../aura/search/interface/education.interface';
import { UploadDocumentsComponent } from '../../../../../../shared/components/upload-documents/upload-documents.component';
import { GenericProfileApiService } from '../../../../../../aura/search/service/generic-profile-api.service';
import { WorkAuthorizationDocumentMapResultResponse } from '../../../../../../shared/interface/lookup.interface';
import { CertificationResult } from '../../../../../../aura/search/interface/certification.interface';
import { FoundInList } from '../../../../../../shared/custom-validators/custom-validator-foundinlist';
import { Router } from '@angular/router';
import { PersonInfoShare } from '../../../../../interface/dashboard/candidate-dashboard.interface';
import { PreviewEadComponent } from '../../../../../../shared/components/preview-ead/preview-ead.component';
import { MatSelectChange } from '@angular/material/select';
import { DateValidator } from '../../../../../../shared/custom-validators/custom-validator-date';
import { GlobalVariables } from '../../../../../../shared/enums/global-variables.enum';
import { GoogleAddress } from '../../../../../../aura/hr/interface/dashboard/candidate-onboarding.interface';
import { AddressComponent } from 'ngx-google-places-autocomplete/objects/addressComponent';
import { GoogleMapKeyResult } from '../../../../../../shared/interface/google-map.interface';
import { GoogleMapService } from '../../../../../../shared/service/google-map/google-map.service';
import { of } from 'rxjs';
import { E } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-candidate-personal-information-tab',
  templateUrl: './candidate-personal-information-tab.component.html',
  styleUrls: ['./candidate-personal-information-tab.component.scss'],
})
export class CandidatePersonalInformationTabComponent implements OnInit {
  onboardingStep!: number;
  @Input() stepper!: MatStepper;

  // PERSONAL INFORMATION
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;

  @Input() employeeOnboardingId = '';
  candidateOnboardingInformationResult!: CandidateOnboardingInformationResult;
  candidateOnboardingPersonalInformationResult!: CandidateOnboardingPersonalInformationResult;
  candidateOnboardingIdentificationImmigrationInformationResult!: CandidateOnboardingIdentificationImmigrationInformationResult;
  candidateOnboardingEducationInformationResult!: CandidateOnboardingEducationInformationResult;

  personalInfoForm!: FormGroup;
  mapCountry = new Map<number, string>();
  mapState = new Map<number, string>();
  mapGender = new Map<number, string>();
  mapMarital = new Map<number, string>();
  mapSocialMediaType = new Map<number, string>();
  mapEthnicityType = new Map<number, string>();
  mapRaceType = new Map<number, string>();

  totalSocialMediaLinks = 0;
  currentProfile!: string;

  personId = '';
  email = '';
  emailContactAddressId = '';

  cellPhone = '';
  cellPhoneNumber = '';
  cellCountry = '';
  cellContactAddressId = '';

  homePhone = '';
  homePhoneNumber = '';
  homeCountry = '';
  homeContactAddressId = '';

  officePhone = '';
  officePhoneNumber = '';
  officeCountry = '';
  officeContactAddressId = '';
  officeExtension = '';

  livingAddress!: Addresses | null;
  livingAddrStateName = '';
  livingAddrCountryName = '';
  addressId = '';
  googleAddressLine1 = '';
  googleAddress!: GoogleAddress;
  // tslint:disable-next-line: no-any
  options: any = {
    componentRestrictions: { country: 'USA' },
  };
  isApiLoaded = false;
  isLoadingGoogle = false;
  googleMapKeyResult!: GoogleMapKeyResult;

  identificationInfoForm!: FormGroup;
  totalSSNDocs = 0;
  totalPassportDocs = 0;
  totalDLDocs = 0;
  totalImmigrations = 0;
  totalImmigrationDocs = 0;

  isLoadingPersonalInfo = false;

  // IDENTIFICATION & IMMIGRATION
  // GET SSN
  ssnResult!: SSNResult;
  ssnDocumentInfo!: DocumentInformation[];
  updateSSNInfo!: SSNResult;
  ssnFiles: File[] = [];
  ssnFileName = '';

  // GET PASSPORT
  addOrUpdatePassport!: string;
  passportResult!: PassportResult;
  passportDocumentInfo!: DocumentInformation[] | undefined;
  // tslint:disable-next-line: no-any
  uploadedPassportDocs: any;
  updatePassportInfo!: PassportResult;

  // GET DRIVING LICENSE
  addOrUpdateDL!: string;
  drivingLicenseResult!: DrivingLicenseResult;
  dlDocumentInfo!: DocumentInformation[] | undefined;
  // tslint:disable-next-line: no-any
  uploadedDLDocs: any;
  updateDLInfo!: DrivingLicenseResult;
  location!: LocationResult;

  // GET IMMIGRATION
  addOrUpdateImmigration!: string;
  immigrationResult!: EmployeeImmigrationAddEditRecord[];
  immigrationDocumentInfo!: DocumentInformation[];
  // tslint:disable-next-line: no-any
  uploadedImmigrationDocs: UploadedEducationDocuments[] = [];
  updateImmigrationInfo!: EmployeeImmigrationAddEditRecord[];
  WorkAuthDocumentMapData!: WorkAuthorizationDocumentMapResultResponse;
  immigrationData!: ImmigrationData[];
  isUSCitizen = false;

  mapWorkAuth = new Map<number, string>();
  mapWorkAuthType = new Map<string, number>();
  mapWorkAuthCodes = new Map<string, number>();
  mapEADCategory = new Map<number, string>();
  mapEADCategoryCodes = new Map<number, string>();
  showPrevilingWage = false;
  fileExt = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'];
  fileExtO = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  workAuthType!: number;
  documentPurposeCode = '';
  isLoadingIdentificationInfo = false;
  employeeImmigrationResult!: EmployeeImmigrationResult[];
  empImmigration!: EmployeeImmigrationResult | undefined;
  hideExpiryDate: boolean[] = [true];
  expiryDateValue!: string;
  immIndex!: number;
  duplicateImmigration = false;
  immDocsCount: number[] = [];
  mapUploadImmiDocs = new Map<number, number>();
  // EDUCATION INFORMATION
  uploadedEducationDocs: UploadedEducationDocuments[] = [];
  educationForm!: FormGroup;
  educationInfo!: EducationInfo[];
  updatedEducationInfo!: EducationResult[];

  mapDegree = new Map<number, string>();

  mapMajorType = new Map<number, string>();
  mapMajor = new Map<string, string>();

  mapMajorType1 = new Map<number, string>();
  mapMajor1 = new Map<string, string>();

  mapUniversityName = new Map<string, string>();
  mapUniversity = new Map<string, string>();

  totalEducations!: number;
  eduIndex!: number;
  showEADFields: boolean[] = [];

  // CERTIFICATIONS
  uploadedCertificationDocs: UploadedEducationDocuments[] = [];
  certificationForm!: FormGroup;
  certificateInfo!: CertificateInfo[];

  totalCertifications!: number;
  updatedCertificationInfo!: CertificationResult[];

  mapCertificationAgencyName = new Map<string, string>();
  mapCertificationAgency = new Map<string, string>();

  mapCertificationStatus = new Map<number, string>();
  issueMaxDate = '';
  issueMinDate = '';
  expiryMinDate = '';
  expiryMaxDate = '';
  endMinDate = '';
  endMaxDate = '';
  minDate = '';

  certIndex!: number;
  isLoadingEducationInfo = false;
  isLoading = false;

  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();

  countKeysPersonalInfo!: number;
  countKeysIdentificationInfo!: number;
  countKeysEducationInfo!: number;

  keysSectionWise: string[] = [];
  commentValue!: string;
  commentKey = '';
  eadCategory!: string;
  tempExpiryDate = '';
  tempEadCategoryCode = '';
  tempEadCategory = '';
  showNext = false;

  constructor(
    private router: Router,
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    private genericProfileApiService: GenericProfileApiService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private googleMapService: GoogleMapService
  ) {}

  ngOnInit(): void {
    // PERSONAL INFO
    this.personalInfoForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      aliasName: ['', [Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')]],
      dateOfBirth: ['', [Validators.required, AgeValidator.isAgeInvalid()]],
      cellCountryCode: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
      ],
      cellPhoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      officeCountryCode: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      officePhoneNumber: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      officeExt: ['', Validators.pattern('^[0-9]{1,4}')],
      homeCountryCode: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
      ],
      homePhoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      emailId: ['', [Validators.required, Validators.email]],
      maritalStatus: ['', Validators.required],
      gender: ['', Validators.required],
      ethnicity: ['', Validators.required],
      race: ['', Validators.required],
      mailingAddressLine1: [
        '',
        [Validators.required, Validators.maxLength(1000)],
      ],
      mailingAddressLine2: ['', [Validators.maxLength(200)]],
      mailingCountry: ['', Validators.required],
      mailingState: ['', Validators.required],
      mailingCity: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      mailingPostalCode: [
        '',
        [Validators.required, Validators.pattern('[0-9]{5}')],
      ],
      additionalSocialMediaLinks: this.fb.array([
        this.additionalSocialMediaLinksFormGroup(),
      ]),
    });
    this.setOnboardingInformation();
    this.setPersonalInfo();
    this.personalInfoForm.controls.firstName.disable();
    this.personalInfoForm.controls.lastName.disable();
    this.getAllDropDownData();
    this.loadScript().then(() => {
      this.isApiLoaded = true;
    });

    // IDENTIFICATION INFO
    this.setWorkAuthorizationTypeCode();
    this.updatePassportInfo = {
      personId: '',
      passportNumber: '',
      passportIssueDate: '',
      passportExpiryDate: '',
      passportIssueCountryCode: 0,
      passportIssuedCity: '',
      passportIssueCountry: '',
      isNewDocument: true,
      resourceTypeCode: 24,
      documentPurposeCode: 2,
    };
    this.location = Object.assign({}, this.location);
    this.updateDLInfo = {
      personId: '',
      drivingLicenseNo: '',
      issueDate: '',
      expiryDate: '',
      location: this.location,
      isNewDocument: true,
      resourceTypeCode: 4,
      documentPurposeCode: 14,
    };
    this.updateSSNInfo = {
      personId: '',
      socialSecurityNumber: '',
      isNewDocument: true,
      resourceTypeCode: 4,
      documentPurposeCode: 12,
    };

    this.lookupService.getWorkAuthorizationDocumentMap().subscribe(
      (data) => {
        this.WorkAuthDocumentMapData = data;
      },
      (error) => {
        console.warn(error);
      }
    );

    this.lookupService.getEADCategoryType().subscribe(
      (data) => {
        for (const ead of data?.result) {
          this.mapEADCategory.set(ead?.lookupCode, ead?.abbr);
          this.mapEADCategoryCodes.set(ead?.lookupCode, ead?.name);
        }
      },
      (error) => {
        console.warn(error);
      }
    );

    this.identificationInfoForm = this.fb.group(
      {
        // SSN
        socialSecurityNumber: [
          '',
          [Validators.required, Validators.pattern('[0-9]{9}')],
        ],
        ssnDocumentInfo: [''],

        // Passport
        passportNumber: ['', [Validators.pattern('^[a-zA-Z]*[0-9]{4,12}$')]],
        passportIssueDate: [''],
        passportExpiryDate: [''],
        passportIssuedCity: ['', [Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')]],
        passportIssueCountryCode: [''],
        passportDocumentInfo: [''],

        // Driving License
        drivingLicenseNo: ['', [Validators.pattern('^[a-zA-Z]*[0-9]{4,20}$')]],
        city: ['', [Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')]],
        stateCode: [''],
        zip: ['', [Validators.pattern('[1-9][0-9]{4}')]],
        dlIssueDate: [''],
        dlExpiryDate: [''],
        dlDocumentInfo: [''],

        // Immigration
        immigrationDetails: this.fb.array([this.immigrationDetailsFormGroup()]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'passportIssueDate',
            'passportExpiryDate',
            'passportDatesNotValid'
          ),
          DateValidator.fromToDate(
            'dlIssueDate',
            'dlExpiryDate',
            'dlDatesNotValid'
          ),
        ],
      }
    );

    this.mapWorkAuthType.set('Business Visa', 8);
    this.mapWorkAuthType.set('EAD', 4);
    this.mapWorkAuthType.set('F2', 9);
    this.mapWorkAuthType.set('Green Card', 5);
    this.mapWorkAuthType.set('H1-B', 3);
    this.mapWorkAuthType.set('L1', 6);
    this.mapWorkAuthType.set('TN-Permit', 11);
    this.mapWorkAuthType.set('US-Citizen', 7);

    this.setIdentificationImmigrationInfo();
    // this.uploadedImmigrationDocs = Object.assign(
    //   [{}],
    //   this.uploadedImmigrationDocs
    // );
    // EDUCATION INFO
    this.setUniversityAndOrgName();

    this.educationForm = this.fb.group({
      educationDetails: this.fb.array([this.educationDetailsFormGroup()]),
      certificationDetails: this.fb.array([
        this.certificationDetailsFormGroup(),
      ]),
    });

    this.lookupService.getDegreeCode().subscribe((data) => {
      for (const degree of data?.result) {
        this.mapDegree.set(degree?.lookupCode, degree?.description);
      }
    });
    this.lookupService.getMajorCode().subscribe((data) => {
      for (const major of data?.result) {
        this.mapMajorType.set(major?.lookupCode, major?.description);
        this.mapMajorType1.set(major?.lookupCode, major?.description);
      }
    });

    this.lookupService.getCertificationStatus().subscribe((data) => {
      for (const certStatus of data?.result) {
        this.mapCertificationStatus.set(
          certStatus?.lookupCode,
          certStatus?.description
        );
      }
    });

    this.updatedEducationInfo = Object.assign([], this.updatedEducationInfo);
    this.updatedCertificationInfo = Object.assign(
      [],
      this.updatedCertificationInfo
    );

    this.setMinAndMaxIssueAndExpiryDate();
  }
  // tslint:disable-next-line: no-any
  loadScript(): any {
    return new Promise((resolve, reject) => {
      this.googleMapService.getGoogleMapKey().subscribe(
        (data) => {
          if (data?.result) {
            this.googleMapKeyResult = data?.result;
            const element = this.document.createElement('script');
            element.type = 'text/javascript';
            element.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapKeyResult?.fieldValue}&libraries=places&language=en`;
            element.onload = resolve;
            element.onerror = reject;
            this.elementRef.nativeElement.appendChild(element);
          }
        },
        (err) => {
          console.warn(err);
        }
      );
    });
  }

  // tslint:disable-next-line: no-any
  handleAddressChange(address: any): void {
    this.googleAddress = this.getLocationFromPlace(
      address.address_components
    ) as GoogleAddress;

    if (this.googleAddress?.route) {
      this.googleAddressLine1 = this.googleAddress.route;

      this.personalInfoForm?.controls?.mailingAddressLine1?.setValue(
        this.googleAddressLine1
      );

      this.personalInfoForm?.controls?.addressLine2?.setValue(
        this.googleAddress?.sublocality
      );

      const cityDistrict = this.googleAddress?.cityName;

      this.personalInfoForm?.controls?.mailingCity?.setValue(cityDistrict);

      for (const [k, v] of this.mapState) {
        if (v === this.googleAddress?.stateName) {
          this.personalInfoForm?.controls?.mailingState?.patchValue(k);
          break;
        }
      }

      for (const [k, v] of this.mapCountry) {
        if (v === this.googleAddress?.countryName) {
          this.personalInfoForm?.controls?.mailingCountry?.patchValue(k);
          break;
        }
      }

      this.personalInfoForm?.controls?.mailingPostalCode?.setValue(
        this.googleAddress?.postalCode
      );
    }
  }

  getLocationFromPlace(place: AddressComponent[]): GoogleAddress | null {
    const components = place;
    if (components === undefined) {
      return null;
    }

    // addressLine 1
    const subpremise = this.getLong(components, 'subpremise');
    const streetNumber = this.getLong(components, 'street_number');
    const route = this.getLong(components, 'route');
    const addressLine1 = subpremise
      ? subpremise + ', ' + streetNumber
      : streetNumber
      ? streetNumber + ',' + route
      : route;

    // addressLine 2
    const sublocality = this.getLong(components, 'sublocality_level_2');

    // city
    const areaLevel3 = this.getLong(components, 'administrative_area_level_3');
    const locality = this.getLong(components, 'locality');
    const cityName = locality || areaLevel3;

    const stateName = this.getLong(components, 'administrative_area_level_1');
    const districtName = this.getLong(
      components,
      'administrative_area_level_2'
    );
    const countryName = this.getLong(components, 'country');
    const postalCode = this.getLong(components, 'postal_code');

    return {
      route: addressLine1,
      sublocality,
      cityName,
      districtName,
      stateName,
      countryName,
      postalCode,
    };
  }

  getComponent(components: AddressComponent[], name: string): AddressComponent {
    return components.filter(
      (component: AddressComponent) => component.types[0] === name
    )[0];
  }

  getLong(components: AddressComponent[], name: string): string {
    const component = this.getComponent(components, name);
    return component && component.long_name;
  }

  getShort(components: AddressComponent[], name: string): string {
    const component = this.getComponent(components, name);
    return component && component.short_name;
  }

  get immigrationDetails(): FormArray {
    return this.identificationInfoForm?.get('immigrationDetails') as FormArray;
  }
  immigrationDetailsFormGroup(): FormGroup {
    return this.fb.group(
      {
        immigrationInfoId: [''],
        workAuthorizationType: ['', Validators.required],
        eadCategoryCode: ['', Validators.required],
        // eadCategoryCode: [''],
        eadCategory: [{ value: '', disabled: true }],
        workAuthorizationNumber: [
          '',
          [Validators.required, Validators.pattern('[A-Za-z0-9]{7,13}')],
        ],
        workAuthorizationStartDate: ['', Validators.required],
        workAuthorizationExpiryDate: ['', Validators.required],
        immigrationDocuments: this.fb.array([]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'workAuthorizationStartDate',
            'workAuthorizationExpiryDate',
            'immigrationDatesNotValid'
          ),
        ],
      }
    );
  }
  addImmigrationDetails(): FormGroup {
    return this.fb.group(
      {
        immigrationInfoId: [''],
        workAuthorizationType: ['', Validators.required],
        eadCategoryCode: ['', Validators.required],
        eadCategory: [{ value: '', disabled: true }],
        workAuthorizationNumber: [
          '',
          [Validators.required, Validators.pattern('[A-Za-z0-9]{7,13}')],
        ],
        workAuthorizationStartDate: ['', Validators.required],
        workAuthorizationExpiryDate: ['', Validators.required],
        immigrationDocuments: this.fb.array([]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'workAuthorizationStartDate',
            'workAuthorizationExpiryDate',
            'immigrationDatesNotValid'
          ),
        ],
      }
    );
  }
  setUniversityAndOrgName(): void {
    this.isLoading = true;
    this.lookupService
      .getUniversityTypesAndCertifyingAgencyNames()
      .subscribe((responseList) => {
        this.mapUniversity = responseList[0]?.result;
        this.mapCertificationAgency = responseList[1]?.result;
        this.isLoading = false;

        if (this.mapUniversity && this.mapCertificationAgency) {
          this.setEducationAndCertificationInfo();
        }
      });
  }

  setCertificationAgency(agencyName: string = ''): void {
    this.lookupService.getCertificationAgencyByOrgName(agencyName).subscribe(
      (data) => {
        this.mapCertificationAgencyName = data?.result;
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  setUniversityName(university: string = ''): void {
    this.lookupService.getUniversityByName(university).subscribe(
      (data) => {
        this.mapUniversityName = data?.result;
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  searchUniversity(university: string): void {
    if (university?.length >= 2) {
      this.setUniversityName(university);
    }
  }
  searchCertifyingOrgnization(orgName: string): void {
    if (orgName?.length >= 2) {
      this.setCertificationAgency(orgName);
    }
  }
  certificationDetailsFormGroup(): FormGroup {
    return this.fb.group(
      {
        certificationId: [''],
        certificationName: ['', Validators.pattern('^[a-zA-Z-. ]+$')],
        certificationCode: ['', Validators.pattern('^[a-zA-Z0-9- ]+$')],
        certificateSerialNumber: ['', Validators.pattern('[a-zA-Z0-9]{0,15}')],
        certificationStatus: [''],
        certifyingAgencyId: [''],
        certifyingAgency: [
          '',
          [
            Validators.pattern(
              /^[\.a-zA-Z,.!@#$%^&*()_*\-=\[\]{};':"\\|,.<>\/? ]*$/
            ),
          ],
        ],
        issuedDate: [''],
        expiryDate: [''],
        certificationDocuments: this.fb.array([]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'issuedDate',
            'expiryDate',
            'certificationDatesNotValid'
          ),
        ],
      }
    );
  }

  setCertification(): void {
    if (this.certificateInfo) {
      this.educationForm.setControl(
        'certificationDetails',
        this.setCertificationDetails(this.certificateInfo)
      );
    }

    if (this.certificateInfo?.length === 0) {
      this.certificateInfo.length = this.certificateInfo?.length + 1;
      this.certificationDetails.push(this.addCertification());
    }
  }
  setCertificationDetails(certificationInfo: CertificateInfo[]): FormArray {
    const formArray = new FormArray([]);
    certificationInfo?.forEach((certification) => {
      formArray.push(
        this.fb.group(
          {
            certificationId: [certification?.certificateData?.certificationId],
            certificationName: [
              certification?.certificateData?.certificationName,
              Validators.pattern('^[a-zA-Z-. ]+$'),
            ],
            certificationCode: [
              certification?.certificateData?.certificationCode,
              Validators.pattern('^[a-zA-Z0-9- ]+$'),
            ],
            certificateSerialNumber: [
              certification?.certificateData?.certificateSerialNumber,
              Validators.pattern('[a-zA-Z0-9]{0,15}'),
            ],
            certifyingAgencyId: [
              certification?.certificateData?.certifyingAgencyId,
            ],
            certifyingAgency: [
              certification?.certificateData?.certifyingAgency,
              [
                Validators.pattern(
                  /^[\.a-zA-Z,.!@#$%^&*()_*\-=\[\]{};':"\\|,.<>\/? ]*$/
                ),
              ],
            ],
            certificationStatus: [
              certification?.certificateData?.certificationStatusCode,
            ],
            issuedDate: [certification?.certificateData?.issuedDate],
            expiryDate: [certification?.certificateData?.expiryDate],

            certificationDocuments: this.fb.array([]),
          },
          {
            validator: [
              DateValidator.fromToDate(
                'issuedDate',
                'expiryDate',
                'certificationDatesNotValid'
              ),
            ],
          }
        )
      );
    });
    return formArray;
  }
  addCertification(): FormGroup {
    return this.fb.group(
      {
        certificationId: [''],
        certificationName: ['', Validators.pattern('^[a-zA-Z-. ]+$')],
        certificationCode: ['', Validators.pattern('^[a-zA-Z0-9- ]+$')],
        certificateSerialNumber: ['', Validators.pattern('[a-zA-Z0-9]{0,15}')],
        certificationStatus: [''],
        certifyingAgencyId: [''],
        certifyingAgency: [
          '',
          [
            Validators.pattern(
              /^[\.a-zA-Z,.!@#$%^&*()_*\-=\[\]{};':"\\|,.<>\/? ]*$/
            ),
          ],
        ],
        issuedDate: [''],
        expiryDate: [''],
        certificationDocuments: this.fb.array([]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'issuedDate',
            'expiryDate',
            'certificationDatesNotValid'
          ),
        ],
      }
    );
  }
  removeCertificationDetails(
    index: number,
    certification: AbstractControl
  ): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you want to delete this current certification details?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (certification?.get('certificationId')?.value !== '') {
          this.deleteCertification(
            certification?.get('certificationId')?.value
          );
          this.fetchCertificationDetails();
          this.totalCertifications = this.certificationDetails?.length - 1;
        } else {
          this.totalCertifications = this.certificationDetails?.length - 1;
          this.certificationDetails?.removeAt(index);
          this.educationForm.markAsDirty();
          this.educationForm.controls.certificationDetails.markAsDirty();
        }
      }
    });
  }
  deleteCertification(certificationId: string): void {
    this.candidateOnboardingWorkflowService
      .deleteCertificationDetailsById(certificationId)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Current certification details deleted successfully'
          );
        },
        (err) => {
          this.matNotificationService.warn(
            ':: Unable to delete certification details successfully'
          );
          console.warn(err);
        }
      );
  }

  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object?.keys(object)?.find((key) => object[key] === value);
  }

  getDocumentsByCertificateId(
    certificationId: AbstractControl
  ): DocumentInformation[] {
    let docs: DocumentInformation[] = [];
    this.certificateInfo?.map((certification) => {
      if (
        certification?.certificateData?.certificationId ===
        certificationId?.value
      ) {
        // tslint:disable-next-line: no-non-null-assertion
        docs = certification?.certificateData.documents!;
      }
    });
    return docs;
  }

  getDocumentsByEducationInfoId(
    educationInfoId: AbstractControl
  ): DocumentInformation[] {
    let docs: DocumentInformation[] = [];
    this.educationInfo?.map((education) => {
      if (
        education?.educationData?.educationInfoId === educationInfoId?.value
      ) {
        // tslint:disable-next-line: no-non-null-assertion
        if (education?.educationData?.documents?.length! > 0) {
          // tslint:disable-next-line: no-non-null-assertion
          docs = education?.educationData?.documents!;
        }
      }
    });
    return docs;
  }

  getDocumentsByImmigrationInfoId(
    immigrationInfoId: AbstractControl
  ): DocumentInformation[] {
    let docs: DocumentInformation[] = [];
    this.immigrationData?.map((immigration) => {
      if (
        immigration?.immigrationInfo?.immigrationInfoId ===
        immigrationInfoId?.value
      ) {
        // tslint:disable-next-line: no-non-null-assertion
        if (immigration?.immigrationInfo?.documents?.length! > 0) {
          // tslint:disable-next-line: no-non-null-assertion
          docs = immigration?.immigrationInfo?.documents!;
        }
      }
    });
    return docs;
  }

  onRestoreEducationAndCertificationInfo(
    e: Event,
    educationForm: FormGroup
  ): void {
    if (
      (educationForm.dirty && educationForm.valid) ||
      this.uploadedEducationDocs[this.eduIndex]?.status ||
      this.uploadedCertificationDocs[this.certIndex]?.status
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setEducationAndCertificationInfo();
          educationForm.markAsPristine();
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.uploadedEducationDocs?.length; i++) {
            if (this.uploadedEducationDocs[i]?.fileList?.length > 0) {
              this.uploadedEducationDocs[i].fileList = [];
            }
          }
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.uploadedCertificationDocs?.length; i++) {
            if (this.uploadedCertificationDocs[i]?.fileList?.length > 0) {
              this.uploadedCertificationDocs[i].fileList = [];
            }
          }
          this.eduIndex = -1;
          this.certIndex = -1;
        }
      });
      e.preventDefault();
    } else {
      this.setEducationAndCertificationInfo();
      educationForm.markAsPristine();
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.uploadedEducationDocs?.length; i++) {
        if (this.uploadedEducationDocs[i]?.fileList?.length > 0) {
          this.uploadedEducationDocs[i].fileList = [];
        }
      }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.uploadedCertificationDocs?.length; i++) {
        if (this.uploadedCertificationDocs[i]?.fileList?.length > 0) {
          this.uploadedCertificationDocs[i].fileList = [];
        }
      }
      this.eduIndex = -1;
      this.certIndex = -1;
    }
  }

  saveEducationCertificationInfoAndContinue(educationForm: FormGroup): void {
    if (
      (educationForm.dirty && educationForm.valid) ||
      this.uploadedEducationDocs[this.eduIndex]?.status ||
      this.uploadedCertificationDocs[this.certIndex]?.status
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onSaveEducationCertificationInfo();
          educationForm.markAsPristine();
          this.passportInfoDetails();
          this.stepper.next();
        }
      });
    } else if (educationForm.valid) {
      educationForm.markAsPristine();
      this.matNotificationService.success(':: No changes made.');
      this.passportInfoDetails();
      this.stepper.next();
    }
  }

  passportInfoDetails(): void {
    const passportInfo = {
      passportNumber:
        this.identificationInfoForm?.controls?.passportNumber?.value,
      country: this.mapCountry.get(
        this.identificationInfoForm?.controls?.passportIssueCountryCode?.value
      ),
    };

    this.candidateOnboardingWorkflowService.sendPassportInfoDetails(
      passportInfo
    );
  }
  onSaveEducationCertificationInfo(): void {
    this.totalEducations = this.educationDetails?.controls?.length;
    this.totalCertifications = this.certificationDetails?.controls?.length;
    this.updatedEducationInfo = [];

    let educationData: EducationResult;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.educationDetails?.controls?.length; i++) {
      educationData = {
        educationInfoId:
          this.educationDetails?.controls[i]?.get('educationInfoId')?.value ===
          ''
            ? GlobalVariables.DefaultGUID
            : this.educationDetails?.controls[i]?.get('educationInfoId')?.value,
        personId: this.personId,
        degreeTypeCode:
          this.educationDetails?.controls[i]?.get('degreeName')?.value,
        universityId: this.getKeyByValue(
          this.mapUniversity,
          this.educationDetails?.controls[i]?.get('universityName')?.value
        ),
        startDate: String(
          this.datepipe.transform(
            this.educationDetails?.controls[i]?.get('startDate')?.value,
            'yyyy-MM-dd'
          )
        ),
        endDate: String(
          this.datepipe.transform(
            this.educationDetails?.controls[i]?.get('endDate')?.value,
            'yyyy-MM-dd'
          )
        ),
        highestDegreeFlag: false,

        majorTypeCode:
          this.educationDetails?.controls[i]?.get('majorType')?.value,
        majorTypeCode1:
          this.educationDetails?.controls[i]?.get('majorType1')?.value,

        isNewDocument:
          this.educationDetails?.controls[i]?.get('educationInfoId')?.value ===
          ''
            ? true
            : false,
        resourceTypeCode: 35,
        documentPurposeCode: 45,
      };

      this.updatedEducationInfo.push(educationData);
    }

    let certificateData: CertificationResult;
    this.updatedCertificationInfo = [];
    for (let i = 0; i < this.certificationDetails.controls.length; i++) {
      certificateData = {
        certificationId:
          this.certificationDetails?.controls[i]?.get('certificationId')
            ?.value === ''
            ? GlobalVariables.DefaultGUID
            : this.certificationDetails?.controls[i]?.get('certificationId')
                ?.value,
        personId: this.personId,
        certificationStatusCode: this.certificationDetails?.controls[i]?.get(
          'certificationStatus'
        )?.value,
        certificationName: this.certificationDetails?.controls[i]
          ?.get('certificationName')
          ?.value.trim(),
        certificationCode:
          this.certificationDetails?.controls[i]?.get('certificationCode')
            ?.value,
        certifyingAgencyId: this.getKeyByValue(
          this.mapCertificationAgency,
          this.certificationDetails?.controls[i]?.get('certifyingAgency')?.value
        ),
        certificateSerialNumber: this.certificationDetails?.controls[i]?.get(
          'certificateSerialNumber'
        )?.value,
        issuedDate: String(
          this.datepipe.transform(
            this.certificationDetails?.controls[i]?.get('issuedDate')?.value,
            'yyyy-MM-dd'
          )
        ),
        expiryDate: String(
          this.datepipe.transform(
            this.certificationDetails?.controls[i]?.get('expiryDate')?.value,
            'yyyy-MM-dd'
          )
        ),
        isNewDocument:
          this.certificationDetails?.controls[i]?.get('certificationId')
            ?.value === ''
            ? true
            : false,
        resourceTypeCode: 38,
        documentPurposeCode: 54,
      };
      if (
        this.certificationDetails?.controls[i]?.get('certificationName')
          ?.value !== ''
      ) {
        this.updatedCertificationInfo.push(certificateData);
      }
    }

    this.candidateOnboardingWorkflowService
      .saveCandidateEducationAndCertificationInformation(
        this.candidateOnboardingEducationInformationResult,
        this.totalEducations,
        this.totalCertifications,
        this.updatedEducationInfo,
        this.updatedCertificationInfo,
        this.uploadedEducationDocs,
        this.uploadedCertificationDocs
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Education & Certification Information details updated successfully'
          );
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.uploadedEducationDocs?.length; i++) {
            if (this.uploadedEducationDocs[i]?.fileList?.length > 0) {
              this.uploadedEducationDocs[i].fileList = [];
            }
          }
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.uploadedCertificationDocs?.length; i++) {
            if (this.uploadedCertificationDocs[i]?.fileList?.length > 0) {
              this.uploadedCertificationDocs[i].fileList = [];
            }
          }
          this.eduIndex = -1;
          this.certIndex = -1;
          this.educationForm.markAsPristine();
          this.setEducationAndCertificationInfo();
        },
        (error) => {
          this.matNotificationService.warn(':: Unable to update successfully');
          console.warn(error);
        }
      );
  }
  fetchImmigrationDetails(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingIdentificationImmigrationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingIdentificationImmigrationInformationResult =
            data?.result;

          this.setImmigration();
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  fetchEducatonDetails(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEducationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingEducationInformationResult = data?.result;

          this.educationInfo =
            this.candidateOnboardingEducationInformationResult?.educationInfo;

          this.setEducation();
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.educationInfo?.length; i++) {
            this.educationForm
              ?.get('universityName')
              ?.setValue(this.educationInfo[i]?.educationData?.universityName);
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  fetchCertificationDetails(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEducationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingEducationInformationResult = data?.result;

          this.certificateInfo =
            this.candidateOnboardingEducationInformationResult?.certificateInfo;

          this.setCertification();
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.certificateInfo?.length; i++) {
            this.educationForm
              ?.get('certifyinAgency')
              ?.setValue(
                this.certificateInfo[i]?.certificateData?.certifyingAgency
              );
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setEducationAndCertificationInfo(): void {
    this.isLoadingEducationInfo = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEducationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingEducationInformationResult = data?.result;
          if (
            this.candidateOnboardingEducationInformationResult?.educationInfo
          ) {
            this.educationInfo =
              this.candidateOnboardingEducationInformationResult?.educationInfo;
            this.setEducation();

            this.totalEducations = this.educationInfo?.length;

            this.showNext = this.educationInfo?.length > 0 ? true : false;

            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.educationInfo?.length; i++) {
              this.educationForm
                ?.get('universityName')
                ?.setValue(
                  this.educationInfo[i]?.educationData?.universityName
                );
            }
          } else {
            this.educationInfo = Object.assign([], this.educationInfo);
          }

          if (
            this.candidateOnboardingEducationInformationResult?.certificateInfo
          ) {
            this.certificateInfo =
              this.candidateOnboardingEducationInformationResult?.certificateInfo;
            this.setCertification();

            this.totalCertifications = this.certificateInfo?.length;

            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.certificateInfo?.length; i++) {
              this.educationForm
                ?.get('certifyinAgency')
                ?.setValue(
                  this.certificateInfo[i]?.certificateData?.certifyingAgency
                );
            }
          } else {
            this.certificateInfo = Object.assign([], this.certificateInfo);
          }
          this.getComments();
          this.isLoadingEducationInfo = false;
        },
        (err) => {
          console.warn(err);
          this.isLoadingEducationInfo = false;
        }
      );
  }

  get educationDetails(): FormArray {
    return this.educationForm?.get('educationDetails') as FormArray;
  }
  get certificationDetails(): FormArray {
    return this.educationForm?.get('certificationDetails') as FormArray;
  }

  educationDetailsFormGroup(): FormGroup {
    return this.fb.group(
      {
        educationInfoId: [''],
        degreeName: ['', [Validators.required]],
        universityId: [''],
        universityName: [
          '',
          [Validators.required, FoundInList?.isFoundInList(this.mapUniversity)],
        ],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        majorType: ['', [Validators.required]],
        majorType1: [''],

        educationDocuments: this.fb.array([]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'startDate',
            'endDate',
            'educationDatesNotValid'
          ),
        ],
      }
    );
  }

  setEducation(): void {
    if (this.educationInfo) {
      this.educationForm.setControl(
        'educationDetails',
        this.setEducationDetails(this.educationInfo)
      );
    }

    if (this.educationInfo?.length === 0) {
      this.educationInfo.length = this.educationInfo?.length + 1;
      this.educationDetails.push(this.addEducation());
    }
  }

  setEducationDetails(educationInfo: EducationInfo[]): FormArray {
    const formArray = new FormArray([]);
    educationInfo?.forEach((education) => {
      formArray.push(
        this.fb.group(
          {
            educationInfoId: [education?.educationData?.educationInfoId],
            degreeName: [
              education?.educationData?.degreeTypeCode,
              [Validators.required],
            ],
            universityId: [education?.educationData?.universityId],
            universityName: [
              education?.educationData?.universityName,
              [
                Validators.required,
                FoundInList?.isFoundInList(this.mapUniversity),
              ],
            ],
            startDate: [
              education?.educationData?.startDate,
              [Validators.required],
            ],
            endDate: [education?.educationData?.endDate, [Validators.required]],
            majorType: [
              education?.educationData?.majorTypeCode,
              [Validators.required],
            ],
            majorType1: [education?.educationData?.majorTypeCode1],

            educationDocuments: this.fb.array([]),
          },
          {
            validator: [
              DateValidator.fromToDate(
                'startDate',
                'endDate',
                'educationDatesNotValid'
              ),
            ],
          }
        )
      );
    });
    return formArray;
  }
  addEducation(): FormGroup {
    return this.fb.group(
      {
        educationInfoId: [''],
        degreeName: ['', [Validators.required]],
        universityId: [''],
        universityName: [
          '',
          [Validators.required, FoundInList?.isFoundInList(this.mapUniversity)],
        ],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        majorType: ['', [Validators.required]],
        majorType1: [''],

        educationDocuments: this.fb.array([]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'startDate',
            'endDate',
            'educationDatesNotValid'
          ),
        ],
      }
    );
  }

  removeImmigrationDetails(index: number, immigration: AbstractControl): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you want to delete this current immigration details?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (immigration?.get('immigrationInfoId')?.value !== '') {
          this.deleteImmigration(immigration?.get('immigrationInfoId')?.value);

          this.setIdentificationImmigrationInfo();
          this.totalImmigrations = this.immigrationDetails?.length - 1;
        } else {
          this.totalImmigrations = this.immigrationDetails?.length - 1;
          this.immigrationDetails?.removeAt(index);
          this.identificationInfoForm?.markAsDirty();
          this.identificationInfoForm?.controls?.immigrationDetails?.markAsDirty();
        }
      }
    });
  }
  // DELETING IMMIGRATION
  deleteImmigration(immigrationInfoId: string): void {
    this.candidateOnboardingWorkflowService
      .deleteImmigrationDetailsById(immigrationInfoId)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Current immigration details deleted successfully'
          );
        },
        (err) => {
          this.matNotificationService.warn(
            ':: Unable to delete immigration details successfully'
          );
          console.warn(err);
        }
      );
  }
  removeEducationDetails(index: number, education: AbstractControl): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you want to delete this current education details?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (education?.get('educationInfoId')?.value !== '') {
          this.deleteEducation(education?.get('educationInfoId')?.value);
          this.fetchEducatonDetails();
          this.totalEducations = this.educationDetails?.length - 1;
        } else {
          this.totalEducations = this.educationDetails?.length - 1;
          this.educationDetails?.removeAt(index);
          this.educationForm?.markAsDirty();
          this.educationForm?.controls?.educationDetails?.markAsDirty();
        }
      }
    });
  }

  deleteEducation(educationInfoId: string): void {
    this.candidateOnboardingWorkflowService
      .deleteEducationDetailsById(educationInfoId)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Current education details deleted successfully'
          );
        },
        (err) => {
          this.matNotificationService.warn(
            ':: Unable to delete education details successfully'
          );
          console.warn(err);
        }
      );
  }
  addImmigration(): void {
    if (this.totalImmigrations > 4) {
      this.matNotificationService.warn(
        ':: You cannot save more than 4 Immigrations'
      );
    } else {
      this.immigrationDetails.push(this.addImmigrationDetails());
      this.totalImmigrations = this.immigrationDetails?.controls?.length;
      if (this.immigrationDetails?.controls?.length > 4) {
        this.matNotificationService.warn(
          ':: You cannot save more than 4 Immigrations'
        );
      }
    }
  }
  addEducationDetails(): void {
    if (this.totalEducations > 7) {
      this.matNotificationService.warn(
        ':: You cannot save more than 7 Educations'
      );
    } else {
      this.educationDetails.push(this.addEducation());
      this.totalEducations = this.educationDetails?.controls?.length;
      if (this.educationDetails?.controls?.length > 6) {
        this.matNotificationService.warn(
          ':: You cannot save more than 7 Educations'
        );
      }
    }
  }
  addCertificationDetails(): void {
    if (this.totalCertifications > 7) {
      this.matNotificationService.warn(
        ':: You cannot save more than 7 Certifications'
      );
    } else {
      this.certificationDetails.push(this.addCertification());
      this.totalCertifications = this.certificationDetails?.controls?.length;
      if (this.certificationDetails?.controls?.length > 6) {
        this.matNotificationService.warn(
          ':: You cannot save more than 7 Certifications'
        );
      }
    }
  }
  additionalSocialMediaLinksFormGroup(): FormGroup {
    return this.fb.group({
      socialMediaLinkId: [''],
      socialMediaType: [''],
      socialMediaURL: [
        '',
        Validators.pattern(
          '((http|https)://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
        ),
      ],
    });
  }

  addAdditionalSocialMediaLinks(): void {
    if (this.totalSocialMediaLinks > 3) {
      this.matNotificationService.warn(
        ':: You cannot save more than 4 Social Profiles'
      );
    } else {
      this.additionalSocialMediaLinks.push(this.addSocialMedia());
      this.totalSocialMediaLinks =
        this.additionalSocialMediaLinks?.controls?.length;
      if (this.additionalSocialMediaLinks?.controls?.length > 4) {
        this.matNotificationService.warn(
          ':: You cannot save more than 4 Social Profiles'
        );
      }
    }
  }

  addSocialMedia(): FormGroup {
    return this.fb.group({
      socialMediaLinkId: [''],
      socialMediaType: [''],
      socialMediaURL: [
        '',
        Validators.pattern(
          '((http|https)://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
        ),
      ],
    });
  }

  removeSocialMediaLinks(index: number, socialMedia: AbstractControl): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you want to delete this current media link?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.totalSocialMediaLinks =
          this.additionalSocialMediaLinks?.length - 1;
        this.additionalSocialMediaLinks?.removeAt(index);
        this.personalInfoForm.markAsDirty();
        this.personalInfoForm.controls.additionalSocialMediaLinks.markAsDirty();

        this.candidateOnboardingWorkflowService
          .deleteSocialMediaLinkById(
            socialMedia?.get('socialMediaLinkId')?.value
          )
          .subscribe(
            (data) => {
              this.hrCommentsMap?.delete(this.commentKey);
              this.matNotificationService.success(
                ':: Current Social Profie details deleted successfully'
              );
              this.personalInfoForm.markAsPristine();
            },
            (error) => {
              this.matNotificationService.warn(
                ':: Unable to delete Social Profie successfully'
              );
              console.warn(error);
            }
          );
      }
    });
  }

  setAdditionalSocialMediaLinks(
    socialMediaLinks: SocialMediaLinks[]
  ): FormArray {
    const formArray = new FormArray([]);
    socialMediaLinks?.forEach((ae) => {
      formArray.push(
        this.fb.group({
          socialMediaLinkId: ae?.socialMediaLinkId,
          socialMediaType: ae?.socialMediaLinkCode,
          socialMediaURL: [
            ae?.url,
            Validators.pattern(
              '((http|https)://)([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
            ),
          ],
        })
      );
    });
    return formArray;
  }
  get additionalSocialMediaLinks(): FormArray {
    return this.personalInfoForm?.get(
      'additionalSocialMediaLinks'
    ) as FormArray;
  }

  getAllDropDownData(): void {
    this.lookupService
      .getAllDropDownDataForCandidate()
      .subscribe((responseList) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[0]?.result?.length; i++) {
          this.mapMarital.set(
            responseList[0]?.result[i]?.lookupCode,
            responseList[0]?.result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[1]?.result?.length; i++) {
          this.mapGender.set(
            responseList[1]?.result[i]?.lookupCode,
            responseList[1]?.result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[2]?.result?.length; i++) {
          this.mapCountry.set(
            responseList[2]?.result[i]?.lookupCode,
            responseList[2]?.result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[3]?.result?.length; i++) {
          this.mapState.set(
            responseList[3]?.result[i]?.lookupCode,
            responseList[3]?.result[i]?.description
          );
        }
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[8]?.result?.length; i++) {
          this.mapSocialMediaType.set(
            responseList[8]?.result[i]?.lookupCode,
            responseList[8]?.result[i]?.description
          );
        }
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[9]?.result?.length; i++) {
          this.mapEthnicityType.set(
            responseList[9]?.result[i]?.lookupCode,
            responseList[9]?.result[i]?.description
          );
        }
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[10]?.result?.length; i++) {
          this.mapRaceType.set(
            responseList[10]?.result[i]?.lookupCode,
            responseList[10]?.result[i]?.name
          );
        }
      });
  }

  disableRace(ethnicityCode: number): void {
    if (ethnicityCode === 2) {
      this.personalInfoForm.controls.race.disable();
    } else {
      this.personalInfoForm.controls.race.enable();
    }
  }

  setOnboardingInformation(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingInfoByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.candidateOnboardingInformationResult = data?.result;
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setPersonalInfo(): void {
    this.isLoadingPersonalInfo = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingPersonalInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingPersonalInformationResult = data?.result;

          this.personId = data?.result?.personId;
          if (data?.result?.contactAddresses) {
            for (const contact of data?.result?.contactAddresses) {
              switch (contact?.contactAddressTypeCode) {
                case ContactAddressType.Email:
                  {
                    this.email = contact?.contactAddress;
                    this.emailContactAddressId = contact?.contactAddressId;
                  }
                  break;

                case ContactAddressType.Mobile:
                  {
                    this.cellPhoneNumber = contact?.contactAddress;
                    this.cellPhone = this.parsePhoneNumber(
                      contact?.countryCode,
                      contact?.contactAddress
                    );
                    // tslint:disable-next-line: no-non-null-assertion
                    this.cellCountry = contact?.countryCode!;
                    this.cellContactAddressId = contact?.contactAddressId;
                  }
                  break;

                case ContactAddressType.HomePhone:
                  {
                    this.homePhoneNumber = contact?.contactAddress;
                    this.homePhone = this.parsePhoneNumber(
                      contact?.countryCode,
                      contact?.contactAddress
                    );
                    // tslint:disable-next-line: no-non-null-assertion
                    this.homeCountry = contact?.countryCode!;
                    this.homeContactAddressId = contact?.contactAddressId;
                  }
                  break;

                case ContactAddressType.WorkPhone:
                  {
                    this.officePhoneNumber =
                      contact?.contactAddress?.split('|')[0];
                    this.officeExtension =
                      contact?.contactAddress?.split('|')[1];
                    this.officePhone = this.parsePhoneNumber(
                      contact?.countryCode,
                      contact?.contactAddress
                    );
                    // tslint:disable-next-line: no-non-null-assertion
                    this.officeCountry = contact?.countryCode!;

                    this.officeContactAddressId = contact?.contactAddressId;
                  }
                  break;
              }
            }
          } else {
            this.resetContactAddress();
          }

          if (data?.result?.address?.addressTypeCode === AddressType.Mailing) {
            this.livingAddress = data?.result?.address;
            this.addressId = data?.result?.address?.addressId;
            this.findLivingAddressStateName(this.livingAddress?.stateCode);
            this.findLivingAddressCountryName(this.livingAddress?.countryCode);
          } else {
            this.livingAddress = null;
          }

          this.personalInfoForm.patchValue({
            firstName:
              this.candidateOnboardingPersonalInformationResult?.firstName,
            lastName:
              this.candidateOnboardingPersonalInformationResult?.lastName,
            aliasName:
              this.candidateOnboardingPersonalInformationResult?.aliasName,
            dateOfBirth:
              this.candidateOnboardingPersonalInformationResult?.dateOfBirth?.split(
                'T'
              )[0],
            cellCountryCode: this.cellCountry,
            cellPhoneNumber: this.parsePhoneNumberToShow(this.cellPhoneNumber),
            officeCountryCode: this.officeCountry,
            officePhoneNumber: this.parsePhoneNumberToShow(
              this.officePhoneNumber
            ),
            officeExt: this.officeExtension,
            homeCountryCode: this.homeCountry,
            homePhoneNumber: this.parsePhoneNumberToShow(this.homePhoneNumber),
            emailId: this.email,
            maritalStatus:
              this.candidateOnboardingPersonalInformationResult
                ?.maritalStatusCode,
            gender:
              this.candidateOnboardingPersonalInformationResult?.genderCode,
            ethnicity:
              this.candidateOnboardingPersonalInformationResult?.ethnicityCode,
            race: this.candidateOnboardingPersonalInformationResult?.raceCode,
            mailingAddressLine1:
              this.candidateOnboardingPersonalInformationResult?.address
                ?.addressLine1,
            mailingAddressLine2:
              this.candidateOnboardingPersonalInformationResult?.address
                ?.addressLine2,
            mailingCountry: this.candidateOnboardingPersonalInformationResult
              ?.address?.countryCode
              ? Number(
                  this.candidateOnboardingPersonalInformationResult?.address
                    ?.countryCode
                )
              : this.candidateOnboardingPersonalInformationResult?.address
                  ?.countryCode,
            mailingState: this.candidateOnboardingPersonalInformationResult
              ?.address?.stateCode
              ? Number(
                  this.candidateOnboardingPersonalInformationResult?.address
                    ?.stateCode
                )
              : this.candidateOnboardingPersonalInformationResult?.address
                  ?.stateCode,
            mailingCity:
              this.candidateOnboardingPersonalInformationResult?.address?.city,
            mailingPostalCode:
              this.candidateOnboardingPersonalInformationResult?.address
                ?.postalCode,
          });

          this.personalInfoForm.setControl(
            'additionalSocialMediaLinks',
            this.setAdditionalSocialMediaLinks(
              this.candidateOnboardingPersonalInformationResult
                ?.socialMediaLinks
            )
          );

          this.disableRace(
            this.candidateOnboardingPersonalInformationResult?.ethnicityCode
          );

          this.totalSocialMediaLinks =
            this.addAdditionalSocialMediaLinks?.length;
          this.getComments();
          this.isLoadingPersonalInfo = false;
        },
        (err) => {
          console.warn(err);
          this.isLoadingPersonalInfo = false;
        }
      );
  }
  resetContactAddress(): void {
    this.email = '';
    this.cellPhone = '';
    this.homePhone = '';
    this.officePhone = '';
    this.homeContactAddressId = '';
    this.officeContactAddressId = '';
    this.cellContactAddressId = '';
    this.emailContactAddressId = '';
    this.officeExtension = '';
    this.officePhoneNumber = '';
  }
  findLivingAddressCountryName(countryCode: string): void {
    this.lookupService.getCountryCode().subscribe(
      (data) => {
        for (const country of data?.result) {
          if (country?.lookupCode === Number(countryCode)) {
            this.livingAddrCountryName = country?.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  findLivingAddressStateName(stateCode: string): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          if (state?.lookupCode === Number(stateCode)) {
            this.livingAddrStateName = state?.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  parsePhoneNumber(
    countryCode: string | undefined,
    phoneNumber: string
  ): string {
    let parsedPhoneNumber = '';
    if (phoneNumber) {
      if (phoneNumber === null) {
        parsedPhoneNumber = '-';
      } else {
        if (countryCode === null) {
          parsedPhoneNumber =
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        } else {
          parsedPhoneNumber =
            '+' +
            countryCode +
            ' (' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        }
      }
    }
    return parsedPhoneNumber;
  }
  parsePhoneNumberToShow(phoneNumber: string): string {
    if (phoneNumber) {
      phoneNumber =
        '(' +
        phoneNumber.substr(0, 3) +
        ')' +
        ' ' +
        phoneNumber.substr(3, 3) +
        '-' +
        phoneNumber.substr(6, 4);
    }
    return phoneNumber;
  }
  parsePhoneNumberToSave(phoneNumber: string): string {
    if (phoneNumber) {
      phoneNumber =
        phoneNumber.substr(1, 3) +
        phoneNumber.substr(6, 3) +
        phoneNumber.substr(10, 4);
    }
    return phoneNumber;
  }

  // tslint:disable-next-line: no-any
  uploadSSNDoc(event: any): void {
    this.ssnFiles = event?.target?.files;

    if (
      this.fileExt?.includes(this.ssnFiles[0]?.name?.split('.')[1]) ||
      this.ssnFiles[0]?.name?.split('.')[1] === 'pdf'
    ) {
      this.ssnFileName = this.ssnFiles[0]?.name;
      this.totalSSNDocs = 1;
    }
  }

  getDocumentPurposeCode(): void {
    for (const rec of this.WorkAuthDocumentMapData?.result) {
      if (rec?.workAuthorizationTypeCode === this.workAuthType) {
        this.documentPurposeCode = rec?.documentPurposeCode.toString();
        break;
      }
    }
  }
  setIdentificationImmigrationInfo(): void {
    this.isLoadingIdentificationInfo = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingIdentificationImmigrationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingIdentificationImmigrationInformationResult =
            data?.result;
          if (
            this.candidateOnboardingIdentificationImmigrationInformationResult
              ?.ssnInfo
          ) {
            this.ssnResult =
              this.candidateOnboardingIdentificationImmigrationInformationResult?.ssnInfo;

            if (this.ssnFiles?.length > 0) {
              this.totalSSNDocs = this.ssnFiles?.length;
            } else {
              if (
                this.ssnResult?.documents &&
                this.ssnResult?.documents?.length > 0
              ) {
                // tslint:disable-next-line: no-non-null-assertion
                this.ssnDocumentInfo = this.ssnResult?.documents!;
                this.ssnFileName = this.ssnDocumentInfo[0]?.displayName;
                this.totalSSNDocs = this.ssnResult?.documents?.length as number;
              } else {
                this.ssnFileName = '';
              }
            }
          }
          if (
            this.candidateOnboardingIdentificationImmigrationInformationResult
              ?.passportInfo
          ) {
            this.passportResult =
              this.candidateOnboardingIdentificationImmigrationInformationResult?.passportInfo;
            this.passportDocumentInfo = this.passportResult?.documents;
            this.totalPassportDocs = this.passportResult?.documents
              ?.length as number;
          }
          if (
            this.candidateOnboardingIdentificationImmigrationInformationResult
              ?.drivingLicenseInfo
          ) {
            this.drivingLicenseResult =
              this.candidateOnboardingIdentificationImmigrationInformationResult?.drivingLicenseInfo;
            this.dlDocumentInfo = this.drivingLicenseResult?.documents;
            this.totalDLDocs = this.drivingLicenseResult?.documents
              ?.length as number;
          }
          if (
            this.candidateOnboardingIdentificationImmigrationInformationResult
              ?.immigrationData
          ) {
            this.immigrationData =
              this.candidateOnboardingIdentificationImmigrationInformationResult?.immigrationData;

            for (let i = 0; i < this.immigrationData?.length; i++) {
              if (
                // tslint:disable-next-line: no-non-null-assertion
                this.immigrationData[i].immigrationInfo.documents?.length! > 0
              ) {
                this.immDocsCount[i] = Number(
                  this.immigrationData[i].immigrationInfo.documents?.length
                );
              }
            }
            this.immigrationData.map((immigration) => {
              this.totalImmigrationDocs = Number(
                immigration.immigrationInfo.documents?.length
              );
            });
            this.setImmigration();
            this.totalImmigrations = this.immigrationData?.length;
          } else {
            this.immigrationData = Object.assign([], this.immigrationData);
          }

          for (let i = 0; i < this.immigrationDetails?.controls?.length; i++) {
            if (
              this.immigrationDetails?.controls[i]?.get('workAuthorizationType')
                ?.value === 'EAD'
            ) {
              this.showEADFields[i] = true;
              this.immigrationDetails?.controls[i]
                ?.get('eadCategory')
                ?.disable();
            } else {
              this.showEADFields[i] = false;
              this.immigrationDetails?.controls[i]
                ?.get('eadCategoryCode')
                ?.disable();
            }
            if (
              this.immigrationDetails?.controls[i]?.get('workAuthorizationType')
                ?.value === 'US-Citizen'
            ) {
              this.isUSCitizen = true;
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationNumber')
                ?.disable();
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationStartDate')
                ?.disable();
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationExpiryDate')
                ?.disable();

              if (this.uploadedImmigrationDocs[i]?.fileList) {
                this.uploadedImmigrationDocs = Object.assign(
                  [],
                  this.uploadedImmigrationDocs
                );
                this.uploadedImmigrationDocs[i].fileList = [];
              }
            } else {
              this.isUSCitizen = false;
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationNumber')
                ?.enable();
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationStartDate')
                ?.enable();
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationExpiryDate')
                ?.enable();
            }
            if (
              this.immigrationDetails?.controls[i]?.get('immigrationInfoId')
                ?.value
            ) {
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationType')
                ?.disable();
            }
          }

          // PATCH VALUES
          this.identificationInfoForm.patchValue({
            socialSecurityNumber: this.ssnResult?.socialSecurityNumber,

            passportNumber: this.passportResult?.passportNumber,
            passportIssueDate:
              this.passportResult?.passportIssueDate?.split('T')[0],
            passportExpiryDate:
              this.passportResult?.passportExpiryDate?.split('T')[0],
            passportIssuedCity: this.passportResult?.passportIssuedCity,
            passportIssueCountryCode:
              this.passportResult?.passportIssueCountryCode,

            drivingLicenseNo: this.drivingLicenseResult?.drivingLicenseNo,
            city: this.drivingLicenseResult?.location?.city,
            stateCode: this.drivingLicenseResult?.location?.stateCode,
            zip: this.drivingLicenseResult?.location?.zip,
            dlIssueDate: this.drivingLicenseResult?.issueDate?.split('T')[0],
            dlExpiryDate: this.drivingLicenseResult?.expiryDate?.split('T')[0],
          });

          this.isLoadingIdentificationInfo = false;
          this.getComments();
        },

        (err) => {
          console.warn(err);
          this.isLoadingIdentificationInfo = false;
        }
      );
  }
  setImmigration(): void {
    if (this.immigrationData) {
      this.identificationInfoForm.setControl(
        'immigrationDetails',
        this.setImmigrationDetails(this.immigrationData)
      );
    }

    if (this.immigrationData?.length === 0) {
      this.immigrationData.length = this.immigrationData?.length + 1;
      this.immigrationDetails.push(this.addImmigrationDetails());
    }
  }
  setImmigrationDetails(immigrationData: ImmigrationData[]): FormArray {
    const formArray = new FormArray([]);
    immigrationData?.forEach((immigration) => {
      formArray.push(
        this.fb.group(
          {
            immigrationInfoId: [
              immigration?.immigrationInfo?.immigrationInfoId,
            ],
            workAuthorizationType: [
              immigration?.immigrationInfo?.workAuthorizationType,
              Validators.required,
            ],
            eadCategoryCode: [
              immigration?.immigrationInfo?.eadCategoryCode,
              Validators.required,
            ],
            eadCategory: [
              {
                value: immigration?.immigrationInfo?.eadCategory,
                disabled: true,
              },
            ],
            workAuthorizationNumber: [
              immigration?.immigrationInfo?.workAuthorizationNumber,
              [Validators.required, Validators.pattern('[A-Za-z0-9]{7,13}')],
            ],
            workAuthorizationStartDate: [
              immigration?.immigrationInfo?.workAuthorizationStartDate?.split(
                'T'
              )[0],
              Validators.required,
            ],
            workAuthorizationExpiryDate: [
              immigration?.immigrationInfo?.workAuthorizationExpiryDate?.split(
                'T'
              )[0],
              Validators.required,
            ],

            immigrationDocuments: this.fb.array([]),
          },
          {
            validator: [
              DateValidator.fromToDate(
                'workAuthorizationStartDate',
                'workAuthorizationExpiryDate',
                'immigrationDatesNotValid'
              ),
            ],
          }
        )
      );
    });
    return formArray;
  }
  setWorkAuthorizationTypeCode(): void {
    this.lookupService.getWorkAuthorizationTypeCode().subscribe(
      (data) => {
        for (const workAuth of data?.result) {
          this.mapWorkAuth.set(workAuth?.lookupCode, workAuth?.description);
          this.mapWorkAuthCodes.set(
            workAuth?.description,
            workAuth?.lookupCode
          );
        }
      },
      (error) => {
        console.warn(error);
      }
    );
  }

  onRestorePersonalInfo(e: Event, personalInfoForm: FormGroup): void {
    if (
      ((personalInfoForm.dirty ||
        personalInfoForm?.controls?.additionalSocialMediaLinks?.dirty) &&
        (personalInfoForm.valid ||
          personalInfoForm?.controls?.additionalSocialMediaLinks?.valid)) ||
      personalInfoForm?.controls?.mailingAddressLine1.touched
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setPersonalInfo();
          personalInfoForm.markAsPristine();
        }
      });
      e.preventDefault();
    } else {
      this.setPersonalInfo();
    }
  }

  onRestoreIdentificationInfo(
    e: Event,
    identificationInfoForm: FormGroup
  ): void {
    if (
      (identificationInfoForm.dirty && identificationInfoForm.valid) ||
      this.uploadedPassportDocs?.status ||
      this.uploadedDLDocs?.status ||
      this.uploadedImmigrationDocs[this.immIndex]?.status
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setIdentificationImmigrationInfo();
          identificationInfoForm.markAsPristine();
          if (this.uploadedPassportDocs?.fileList?.length > 0) {
            this.uploadedPassportDocs.fileList = [];
          }
          if (this.uploadedDLDocs?.fileList?.length > 0) {
            this.uploadedDLDocs.fileList = [];
          }

          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.uploadedImmigrationDocs?.length; i++) {
            if (this.uploadedImmigrationDocs[i]?.fileList?.length > 0) {
              this.uploadedImmigrationDocs[i].fileList = [];
            }
          }
          this.immIndex = -1;
        }
      });
      e.preventDefault();
    } else {
      this.setIdentificationImmigrationInfo();
      identificationInfoForm.markAsPristine();
      if (this.uploadedPassportDocs?.fileList?.length > 0) {
        this.uploadedPassportDocs.fileList = [];
      }
      if (this.uploadedDLDocs?.fileList?.length > 0) {
        this.uploadedDLDocs.fileList = [];
      }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.uploadedImmigrationDocs?.length; i++) {
        if (this.uploadedImmigrationDocs[i]?.fileList?.length > 0) {
          this.uploadedImmigrationDocs[i].fileList = [];
        }
      }
      this.immIndex = -1;
    }
  }

  saveIdentificationInfoAndContinue(identificationInfoForm: FormGroup): void {
    if (
      (identificationInfoForm.dirty && identificationInfoForm.valid) ||
      this.ssnFiles?.length > 0 ||
      this.uploadedPassportDocs?.status ||
      this.uploadedDLDocs?.status ||
      this.uploadedImmigrationDocs[this.immIndex]?.status
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onSaveIdentificationInfo();
          identificationInfoForm.markAsPristine();
          this.passportInfoDetails();
          this.nextOnboardingStep();
        }
      });
    } else if (identificationInfoForm.valid) {
      identificationInfoForm.markAsPristine();
      this.passportInfoDetails();
      this.nextOnboardingStep();
      this.matNotificationService.success(':: No changes made.');
    }
  }

  onSaveIdentificationInfo(): void {
    if (this.passportResult?.passportInfoId === undefined) {
      this.updatePassportInfo.passportInfoId = GlobalVariables.DefaultGUID;
      this.addOrUpdatePassport = 'PassportInfo';
    } else {
      this.updatePassportInfo.passportInfoId =
        this.passportResult?.passportInfoId;
      this.addOrUpdatePassport = 'UpdatePassportInfo';
    }

    this.updatePassportInfo.personId = this.personId;
    if (
      this.identificationInfoForm?.controls?.passportNumber?.value !== undefined
    ) {
      this.updatePassportInfo.passportNumber =
        this.identificationInfoForm?.controls?.passportNumber?.value;
      this.updatePassportInfo.passportIssueDate = String(
        this.datepipe.transform(
          this.identificationInfoForm?.controls?.passportIssueDate?.value,
          'yyyy-MM-dd'
        )
      );
      this.updatePassportInfo.passportExpiryDate = String(
        this.datepipe.transform(
          this.identificationInfoForm?.controls?.passportExpiryDate?.value,
          'yyyy-MM-dd'
        )
      );
      this.updatePassportInfo.passportIssuedCity =
        this.identificationInfoForm?.controls?.passportIssuedCity?.value;
      this.updatePassportInfo.passportIssueCountryCode = this
        .identificationInfoForm?.controls?.passportIssueCountryCode?.value
        ? Number(
            this.identificationInfoForm?.controls?.passportIssueCountryCode
              ?.value
          )
        : this.identificationInfoForm?.controls?.passportIssueCountryCode
            ?.value;

      this.updatePassportInfo.isNewDocument = true;

      this.candidateOnboardingIdentificationImmigrationInformationResult.updatePassportInfo =
        this.updatePassportInfo;
    }

    if (this.drivingLicenseResult?.drivingLicenseID === undefined) {
      this.updateDLInfo.drivingLicenseID = GlobalVariables.DefaultGUID;
      this.addOrUpdateDL = 'DrivingLicenseInfo';
    } else {
      this.updateDLInfo.drivingLicenseID =
        this.drivingLicenseResult?.drivingLicenseID;
      this.addOrUpdateDL = 'UpdateDrivingLicenseInfo';
    }

    this.updateDLInfo.personId = this.personId;
    if (
      this.identificationInfoForm?.controls?.drivingLicenseNo?.value !==
      undefined
    ) {
      this.updateDLInfo.drivingLicenseNo =
        this.identificationInfoForm?.controls?.drivingLicenseNo?.value;
      this.updateDLInfo.issueDate = String(
        this.datepipe.transform(
          this.identificationInfoForm?.controls?.dlIssueDate?.value,
          'yyyy-MM-dd'
        )
      );
      this.updateDLInfo.expiryDate = String(
        this.datepipe.transform(
          this.identificationInfoForm?.controls?.dlExpiryDate?.value,
          'yyyy-MM-dd'
        )
      );

      this.updateDLInfo.location.locationTypeCode = 1;
      this.updateDLInfo.location.resourceTypeCode = 18;
      this.updateDLInfo.location.city =
        this.identificationInfoForm?.controls?.city?.value;
      this.updateDLInfo.location.stateCode = this.identificationInfoForm
        ?.controls?.stateCode?.value
        ? Number(this.identificationInfoForm?.controls?.stateCode?.value)
        : this.identificationInfoForm?.controls?.stateCode?.value;
      this.updateDLInfo.location.zip =
        this.identificationInfoForm?.controls?.zip?.value;

      this.updateDLInfo.isNewDocument = true;

      this.candidateOnboardingIdentificationImmigrationInformationResult.updateDrivingLicenseInfo =
        this.updateDLInfo;
    }
    this.updateSSNInfo.personId = this.personId;

    if (
      this.identificationInfoForm?.controls?.socialSecurityNumber?.value !==
      undefined
    ) {
      this.updateSSNInfo.socialSecurityNumber =
        this.identificationInfoForm?.controls?.socialSecurityNumber?.value;

      this.candidateOnboardingIdentificationImmigrationInformationResult.updateSSNInfo =
        this.updateSSNInfo;
    }

    this.totalImmigrations = this.immigrationDetails?.controls?.length;
    this.updateImmigrationInfo = [];

    let immigrationData: EmployeeImmigrationAddEditRecord;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.immigrationDetails?.controls?.length; i++) {
      immigrationData = {
        immigrationInfoId:
          this.immigrationDetails?.controls[i]?.get('immigrationInfoId')
            ?.value === ''
            ? GlobalVariables.DefaultGUID
            : this.immigrationDetails?.controls[i]?.get('immigrationInfoId')
                ?.value,
        personId: this.personId,
        immigrationInfoTypeCode: 2,
        workAuthorizationTypeCode: Number(
          this.mapWorkAuthCodes.get(
            this.immigrationDetails?.controls[i]?.get('workAuthorizationType')
              ?.value
          )
        ),
        workAuthorizationNumber: this.immigrationDetails?.controls[i]?.get(
          'workAuthorizationNumber'
        )?.value,

        eadCategoryCode:
          this.immigrationDetails?.controls[i]?.get('eadCategoryCode')?.value,
        eadCategory:
          this.immigrationDetails?.controls[i]?.get('eadCategory')?.value,
        workAuthorizationStartDate: String(
          this.datepipe.transform(
            this.immigrationDetails?.controls[i]?.get(
              'workAuthorizationStartDate'
            )?.value,
            'yyyy-MM-dd'
          )
        ),
        workAuthorizationExpiryDate: String(
          this.datepipe.transform(
            this.immigrationDetails?.controls[i]?.get(
              'workAuthorizationExpiryDate'
            )?.value,
            'yyyy-MM-dd'
          )
        ),
        resourceTypeCode: 25,
        documentPurposeCode: Number(
          this.mapWorkAuthType.get(
            this.immigrationDetails?.controls[i]?.get('workAuthorizationType')
              ?.value
          )
        ),
      };

      this.updateImmigrationInfo.push(immigrationData);
    }

    this.candidateOnboardingWorkflowService
      .saveCandidateIdentityInformation(
        this.candidateOnboardingIdentificationImmigrationInformationResult,
        this.ssnFiles[0],
        this.addOrUpdatePassport,
        this.uploadedPassportDocs,
        this.addOrUpdateDL,
        this.uploadedDLDocs,
        this.totalImmigrations,
        this.updateImmigrationInfo,
        this.uploadedImmigrationDocs
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Identification Information details updated successfully'
          );
          this.ssnFiles = [];
          if (this.uploadedPassportDocs?.fileList?.length > 0) {
            this.uploadedPassportDocs.fileList = [];
          }
          if (this.uploadedDLDocs?.fileList?.length > 0) {
            this.uploadedDLDocs.fileList = [];
          }

          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.uploadedImmigrationDocs?.length; i++) {
            if (this.uploadedImmigrationDocs[i]?.fileList?.length > 0) {
              this.uploadedImmigrationDocs[i].fileList = [];
            }
          }
          this.identificationInfoForm.markAsPristine();
          this.setIdentificationImmigrationInfo();
          this.immIndex = -1;
          this.candidateOnboardingWorkflowService.sendSSN(
            this.identificationInfoForm?.controls?.socialSecurityNumber?.value
          );

          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.immigrationDetails?.controls?.length; i++) {
            if (
              this.immigrationDetails?.controls[i]?.get('immigrationInfoId')
                ?.value
            ) {
              this.immigrationDetails?.controls[i]
                ?.get('workAuthorizationType')
                ?.disable();
            }
          }
        },
        (error) => {
          this.matNotificationService.warn(':: Unable to update successfully');
          console.warn(error);
        }
      );
  }

  savePersonalInfoAndContinue(personalInfoForm: FormGroup): void {
    if (
      ((personalInfoForm.dirty ||
        personalInfoForm?.controls?.additionalSocialMediaLinks?.dirty) &&
        (personalInfoForm.valid ||
          personalInfoForm?.controls?.additionalSocialMediaLinks?.valid)) ||
      personalInfoForm?.controls?.mailingAddressLine1.touched
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onSavePersonalInfo();
          personalInfoForm.markAsPristine();
          this.nextOnboardingStep();
        }
      });
    } else if (
      personalInfoForm.valid &&
      personalInfoForm.controls.additionalSocialMediaLinks.status === 'VALID'
    ) {
      personalInfoForm.markAsPristine();
      this.nextOnboardingStep();
      this.matNotificationService.success(':: No changes made.');
    }
  }
  onSavePersonalInfo(): void {
    this.candidateOnboardingPersonalInformationResult.socialMediaLinks = [];
    this.candidateOnboardingPersonalInformationResult.contactAddresses = [];

    this.candidateOnboardingPersonalInformationResult.firstName =
      this.personalInfoForm?.controls?.firstName?.value;
    this.candidateOnboardingPersonalInformationResult.lastName =
      this.personalInfoForm?.controls?.lastName?.value;
    this.candidateOnboardingPersonalInformationResult.aliasName =
      this.personalInfoForm?.controls?.aliasName?.value;

    this.cellContactAddressId =
      this.cellContactAddressId !== ''
        ? this.cellContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.cellPhoneNumber?.value !== '') {
      this.candidateOnboardingPersonalInformationResult?.contactAddresses?.push(
        {
          countryCode: this.personalInfoForm?.controls?.cellCountryCode?.value,
          contactAddress: this.parsePhoneNumberToSave(
            this.personalInfoForm?.controls?.cellPhoneNumber?.value
          ),
          contactAddressId: this.cellContactAddressId,
          contactAddressTypeCode: 2,
          entityTypeCode: 1,
          contactAddressPurposeCode: 1,
          entityId: this.personId,
        }
      );
    }

    this.homeContactAddressId =
      this.homeContactAddressId !== ''
        ? this.homeContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.homePhoneNumber?.value !== '') {
      this.candidateOnboardingPersonalInformationResult?.contactAddresses?.push(
        {
          countryCode: this.personalInfoForm?.controls?.homeCountryCode?.value,
          contactAddress: this.parsePhoneNumberToSave(
            this.personalInfoForm?.controls?.homePhoneNumber?.value
          ),
          contactAddressId: this.homeContactAddressId,
          contactAddressTypeCode: 3,
          entityTypeCode: 1,
          contactAddressPurposeCode: 1,
          entityId: this.personId,
        }
      );
    }

    this.officeContactAddressId =
      this.officeContactAddressId !== ''
        ? this.officeContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.officePhoneNumber?.value !== '') {
      const contactAddressWithExt =
        this.parsePhoneNumberToSave(
          this.personalInfoForm?.controls?.officePhoneNumber?.value
        ) +
        '|' +
        this.personalInfoForm?.controls?.officeExt?.value;
      this.candidateOnboardingPersonalInformationResult?.contactAddresses?.push(
        {
          countryCode:
            this.personalInfoForm?.controls?.officeCountryCode?.value,
          contactAddress: contactAddressWithExt,
          contactAddressId: this.officeContactAddressId,
          contactAddressTypeCode: 9,
          entityTypeCode: 1,
          contactAddressPurposeCode: 1,
          entityId: this.personId,
        }
      );
    }

    this.emailContactAddressId =
      this.emailContactAddressId !== ''
        ? this.emailContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.emailId?.value !== '') {
      this.candidateOnboardingPersonalInformationResult?.contactAddresses?.push(
        {
          contactAddress: this.personalInfoForm?.controls?.emailId?.value,
          contactAddressId: this.emailContactAddressId,
          contactAddressTypeCode: 1,
          entityTypeCode: 1,
          contactAddressPurposeCode: 1,
          entityId: this.personId,
        }
      );
    }

    this.candidateOnboardingPersonalInformationResult.dateOfBirth = String(
      this.datepipe.transform(
        this.personalInfoForm?.controls?.dateOfBirth?.value,
        'yyyy-MM-dd'
      )
    );
    this.candidateOnboardingPersonalInformationResult.maritalStatusCode =
      this.personalInfoForm?.controls?.maritalStatus?.value;
    this.candidateOnboardingPersonalInformationResult.genderCode =
      this.personalInfoForm?.controls?.gender?.value;
    this.candidateOnboardingPersonalInformationResult.ethnicityCode =
      this.personalInfoForm?.controls?.ethnicity?.value;
    this.candidateOnboardingPersonalInformationResult.raceCode =
      this.personalInfoForm?.controls?.race?.value;

    this.candidateOnboardingPersonalInformationResult.address = {
      addressLine1:
        this.googleAddressLine1 && this.googleAddressLine1 !== ''
          ? this.googleAddressLine1
          : this.personalInfoForm?.controls?.mailingAddressLine1?.value,
      addressLine2: this.personalInfoForm?.controls?.mailingAddressLine2?.value,
      countryCode:
        this.personalInfoForm?.controls?.mailingCountry?.value.toString(),
      city: this.personalInfoForm?.controls?.mailingCity?.value,
      stateCode:
        this.personalInfoForm?.controls?.mailingState?.value.toString(),
      postalCode: this.personalInfoForm?.controls?.mailingPostalCode?.value,
      addressId:
        this.addressId === '' ? GlobalVariables.DefaultGUID : this.addressId,
      addressTypeCode: 3,
      addressPurposeCode: 1,
      entityTypeCode: 1,
      entityId: this.personId,
    };

    let socialMediaLink: SocialMediaLinks;

    if (this.totalSocialMediaLinks > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (
        let i = 0;
        i < this.additionalSocialMediaLinks.controls.length;
        i++
      ) {
        {
          socialMediaLink = {
            socialMediaLinkId:
              this.additionalSocialMediaLinks?.controls[i]?.get(
                'socialMediaLinkId'
              )?.value === ''
                ? GlobalVariables.DefaultGUID
                : this.additionalSocialMediaLinks?.controls[i]?.get(
                    'socialMediaLinkId'
                  )?.value,
            personId: this.personId,
            socialMediaLinkCode:
              this.additionalSocialMediaLinks?.controls[i]?.get(
                'socialMediaType'
              )?.value,

            url: this.additionalSocialMediaLinks?.controls[i]?.get(
              'socialMediaURL'
            )?.value,
          };
          this.candidateOnboardingPersonalInformationResult?.socialMediaLinks?.push(
            socialMediaLink
          );
        }
      }
    }

    this.candidateOnboardingWorkflowService
      .saveCandidatePersonalInformation(
        this.candidateOnboardingPersonalInformationResult
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Personal Information details updated successfully'
          );
          this.googleAddressLine1 = '';
          this.personalInfoForm.markAsPristine();
          this.isLoadingPersonalInfo = false;
          this.setPersonalInfo();

          const piObj: PersonInfoShare = {
            firstName: this.personalInfoForm?.controls?.firstName?.value,
            lastName: this.personalInfoForm?.controls?.lastName?.value,
            aliasName: this.personalInfoForm?.controls?.aliasName?.value,
            addressLine1:
              this.personalInfoForm?.controls?.mailingAddressLine1?.value,
            addressLine2:
              this.personalInfoForm?.controls?.mailingAddressLine2?.value,
            city: this.personalInfoForm?.controls?.mailingCity?.value,
            state: String(
              this.mapState.get(
                Number(this.personalInfoForm?.controls?.mailingState?.value)
              )
            ),
            country: String(
              this.mapCountry.get(
                Number(this.personalInfoForm?.controls?.mailingCountry?.value)
              )
            ),
            postalCode:
              this.personalInfoForm?.controls?.mailingPostalCode?.value,
            dateOfBirth: this.personalInfoForm?.controls?.dateOfBirth?.value,
            ssn: this.identificationInfoForm?.controls?.socialSecurityNumber
              ?.value,
            email: this.personalInfoForm?.controls?.emailId?.value,
            cellPhoneNumber:
              this.personalInfoForm?.controls?.cellCountryCode?.value +
              '-' +
              this.personalInfoForm?.controls?.cellPhoneNumber?.value,
            maritalStatus: String(
              this.mapMarital.get(
                Number(this.personalInfoForm?.controls?.maritalStatus?.value)
              )
            ),
          };

          this.candidateOnboardingWorkflowService.sendPersInfo(piObj);
        },
        (error) => {
          this.isLoadingPersonalInfo = false;
          this.matNotificationService.warn(':: Unable to update successfully');
          console.warn(error);
        }
      );
  }

  uploadEducationDocs(
    entityType: string,
    index: number,
    id: AbstractControl
  ): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      id: id.value,
      entityType,
      personId: this.personId,
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialogConfirm.open(
      UploadDocumentsComponent,
      dialogConfig
    );
    // tslint:disable-next-line: no-any
    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.status === 'success') {
        switch (entityType) {
          case 'Education':
            this.uploadedEducationDocs[index] = {
              id: result?.id,
              fileList: result?.uploadFileList,
              status: result?.status,
              entityType: result?.entityType,
            };
            this.eduIndex = index;
            break;

          case 'Certification':
            this.uploadedCertificationDocs[index] = {
              id: result?.id,
              fileList: result?.uploadFileList,
              status: result?.status,
              entityType: result?.entityType,
            };
            this.certIndex = index;
            break;

          case 'Immigration':
            this.uploadedImmigrationDocs[index] = {
              id: result?.id,
              fileList: result?.uploadFileList,
              status: result?.status,
              entityType: result?.entityType,
            };
            this.immIndex = index;
            break;
        }
      }
    });
  }

  uploadDocuments(entityType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      entityType,
      personId: this.personId,
    };

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialogConfirm.open(
      UploadDocumentsComponent,
      dialogConfig
    );
    // tslint:disable-next-line: no-any
    this.dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.status === 'success') {
        switch (entityType) {
          case 'Passport':
            this.uploadedPassportDocs = {
              fileList: result?.uploadFileList,
              status: result?.status,
            };
            break;
          case 'Driving Licence':
            this.uploadedDLDocs = {
              fileList: result?.uploadFileList,
              status: result?.status,
            };
            break;
        }
      }
    });
  }

  // tslint:disable-next-line: no-any
  deleteFile(doc: any, entityType: string, index: number): void {
    if (doc instanceof File && entityType === 'SSN') {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );
      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to delete this attached file?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          const fileListArr = Array.from(this.ssnFiles);
          fileListArr?.splice(index, 1);
          this.ssnFiles = fileListArr;

          this.matNotificationService.success(
            ':: Document deleted successfully'
          );
          this.ssnFileName = '';
        }
      });
    } else if (doc?.id === '') {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );
      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to delete this attached file?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          switch (entityType) {
            case 'Passport':
              {
                const pIndex =
                  this.uploadedPassportDocs?.fileList?.indexOf(doc);

                if (pIndex >= 0) {
                  this.uploadedPassportDocs?.fileList?.splice(pIndex, 1);
                }
                this.refreshDocuments(doc, entityType, index);
              }
              break;
            case 'Driving Licence':
              {
                const dlIndex = this.uploadedDLDocs?.fileList?.indexOf(doc);

                if (dlIndex >= 0) {
                  this.uploadedDLDocs?.fileList?.splice(dlIndex, 1);
                }
                this.refreshDocuments(doc, entityType, index);
              }
              break;
            case 'Immigration':
              {
                const iIndex =
                  this.uploadedImmigrationDocs[index]?.fileList?.indexOf(doc);

                if (iIndex >= 0) {
                  this.uploadedImmigrationDocs[index]?.fileList?.splice(
                    iIndex,
                    1
                  );
                }
                // this.refreshDocuments(doc, entityType, index);
              }
              break;
            case 'Education':
              {
                const iIndex =
                  this.uploadedEducationDocs[index]?.fileList?.indexOf(doc);

                if (iIndex >= 0) {
                  this.uploadedEducationDocs[index]?.fileList?.splice(
                    iIndex,
                    1
                  );
                }
                this.refreshDocuments(doc, entityType, index);
              }
              break;
            case 'Certification':
              {
                const iIndex =
                  this.uploadedCertificationDocs[index]?.fileList?.indexOf(doc);

                if (iIndex >= 0) {
                  this.uploadedCertificationDocs[index]?.fileList?.splice(
                    iIndex,
                    1
                  );
                }
                this.refreshDocuments(doc, entityType, index);
              }
              break;
          }
          this.matNotificationService.success(
            ':: Document deleted successfully'
          );
        }
      });
    } else {
      const docId = [String(doc.documentId)];
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );
      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to delete this attached file?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.genericProfileApiService
            .deleteDocumentsOrSignaturesByDocumentId(docId)
            .subscribe(
              (data) => {
                this.matNotificationService.success(
                  ':: Document deleted successfully'
                );
                this.refreshDocuments(doc, entityType, index);
              },
              (error) => {
                this.matNotificationService.warn(
                  ':: Unable to delete successfully'
                );
                console.warn(error);
              }
            );
        }
      });
    }
  }

  // tslint:disable-next-line: no-any
  refreshDocuments(doc: any, entityType: string, index: number): void {
    switch (entityType) {
      case 'SSN':
        {
          this.ssnDocumentInfo = this.ssnDocumentInfo?.filter(
            (ssnDoc) => ssnDoc !== doc
          );
          this.ssnFileName = '';
        }
        break;
      case 'Passport':
        {
          this.passportDocumentInfo = this.passportDocumentInfo?.filter(
            (passDoc) => passDoc !== doc
          );
        }
        break;
      case 'Driving Licence':
        {
          this.dlDocumentInfo = this.dlDocumentInfo?.filter(
            (dlDoc) => dlDoc !== doc
          );
        }
        break;
      case 'Immigration':
        {
          this.immigrationData[index].immigrationInfo.documents =
            this.immigrationData[index]?.immigrationInfo?.documents?.filter(
              (immDoc) => immDoc !== doc
            );
        }
        break;
      case 'Education':
        {
          this.educationInfo[index].educationData.documents =
            this.educationInfo[index].educationData?.documents?.filter(
              (eduDoc) => eduDoc !== doc
            );
        }
        break;
      case 'Certification':
        {
          this.certificateInfo[index].certificateData.documents =
            this.certificateInfo[index].certificateData?.documents?.filter(
              (certDoc) => certDoc !== doc
            );
        }
        break;
    }
  }
  // MAT ACCORDION STEPS
  setOnboardingStep(index: number): void {
    this.onboardingStep = index;
  }

  nextOnboardingStep(): void {
    this.onboardingStep++;
  }

  prevOnboardingStep(): void {
    this.onboardingStep--;
  }

  getSocialProfilePic(code: number): string {
    const profile = String(this.mapSocialMediaType?.get(code));
    return profile;
  }

  nextTab(): void {
    this.passportInfoDetails();
    this.stepper.next();
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.hrComments = JSON.parse(data?.result);
            this.hrCommentsMap = new Map(Object?.entries(this.hrComments));

            // get the comment for specific section : start
            this.keysSectionWise = [];
            if (this.hrComments) {
              for (const key of Object.keys(this.hrComments)) {
                if (key.toString().includes('personalInformation')) {
                  this.keysSectionWise.push(key);
                }
              }
            }
            this.countKeysPersonalInfo = this.keysSectionWise.length;
            // get the comment for specific section : end

            // get the comment for specific section : start
            this.keysSectionWise = [];
            if (this.hrComments) {
              for (const key of Object.keys(this.hrComments)) {
                if (key.toString().includes('identificationInformation')) {
                  this.keysSectionWise.push(key);
                }
              }
            }
            this.countKeysIdentificationInfo = this.keysSectionWise.length;
            // get the comment for specific section : end

            // get the comment for specific section : start
            this.keysSectionWise = [];
            if (this.hrComments) {
              for (const key of Object.keys(this.hrComments)) {
                if (key.toString().includes('educationInformation')) {
                  this.keysSectionWise.push(key);
                }
              }
            }
            this.countKeysEducationInfo = this.keysSectionWise.length;
            // get the comment for specific section : end
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  showHRComment(key: string): void {
    this.commentKey = key;
    Object?.entries(this.hrComments)?.forEach((comments) => {
      if (comments[0] === key) {
        this.commentValue = comments[1];
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }

  setMinAndMaxIssueAndExpiryDate(): void {
    const issueCurrentDate = new Date();
    this.issueMaxDate = new Date().toISOString().slice(0, 10);
    const past10Years = issueCurrentDate.getFullYear() - 11;
    issueCurrentDate.setFullYear(past10Years);
    this.issueMinDate = issueCurrentDate.toISOString().slice(0, 10);

    const minCurrentDate = new Date();
    const past40Years = minCurrentDate.getFullYear() - 40;
    minCurrentDate.setFullYear(past40Years);
    this.minDate = minCurrentDate.toISOString().slice(0, 10);

    this.endMinDate = this.issueMinDate;
    this.endMaxDate = this.issueMaxDate;

    const expiryCurrentMaxDate = new Date();
    const next15Years = expiryCurrentMaxDate.getFullYear() + 15;
    expiryCurrentMaxDate.setFullYear(next15Years);
    this.expiryMaxDate = expiryCurrentMaxDate.toISOString().slice(0, 10);

    const expiryCurrentMinDate = new Date();
    const next10Years = issueCurrentDate.getFullYear() + 10;
    expiryCurrentMinDate.setFullYear(next10Years);
    this.expiryMinDate = expiryCurrentMinDate.toISOString().slice(0, 10);
  }

  openEADDialog(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;

    this.dialogRef = this.dialogConfirm.open(PreviewEadComponent, dialogConfig);
  }

  chooseWorkAuthorization(immIndex: number, event: MatSelectChange): void {
    for (const immData of this.immigrationData) {
      if (immData?.immigrationInfo?.workAuthorizationType === event?.value) {
        this.matNotificationService.warn(
          ':: You cannot add duplicate immigration details.'
        );
        this.duplicateImmigration = true;

        break;
      } else {
        this.duplicateImmigration = false;
      }
    }

    // US-Citizen
    if (event?.value === 'US-Citizen') {
      this.showEADFields[immIndex] = false;

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategoryCode')
        ?.disable();

      this.tempExpiryDate = this.immigrationDetails?.controls[immIndex]?.get(
        'workAuthorizationExpiryDate'
      )?.value;
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationExpiryDate')
        ?.setValue('');
      this.isUSCitizen = true;
      if (this.uploadedImmigrationDocs[immIndex]?.fileList?.length > 0) {
        this.uploadedImmigrationDocs[immIndex].fileList = [];
      }
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationNumber')
        ?.setValue('');
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationStartDate')
        ?.setValue('');
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationNumber')
        ?.disable();
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationStartDate')
        ?.disable();
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationExpiryDate')
        ?.disable();
    }
    // EAD
    else if (event?.value === 'EAD') {
      this.showEADFields[immIndex] = true;
      this.tempExpiryDate = this.immigrationDetails?.controls[immIndex]?.get(
        'workAuthorizationExpiryDate'
      )?.value;
      this.isUSCitizen = false;
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationNumber')
        ?.enable();
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationStartDate')
        ?.enable();

      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationExpiryDate')
        ?.enable();

      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationExpiryDate')
        ?.setValue(this.tempExpiryDate);

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategoryCode')
        ?.enable();

      this.tempEadCategoryCode =
        this.immigrationDetails?.controls[immIndex]?.get(
          'eadCategoryCode'
        )?.value;

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategoryCode')
        ?.setValue(this.tempEadCategoryCode);

      this.tempEadCategory =
        this.immigrationDetails?.controls[immIndex]?.get('eadCategory')?.value;

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategory')
        ?.setValue(this.tempEadCategory);

      if (
        this.immigrationDetails?.controls[immIndex]?.get('eadCategoryCode')
          ?.value
      ) {
        this.immigrationDetails?.controls[immIndex]
          ?.get('eadCategoryCode')
          ?.setValue(
            this.mapEADCategoryCodes.get(
              this.immigrationDetails?.controls[immIndex]?.get(
                'eadCategoryCode'
              )?.value
            )
          );
      }
    } else {
      this.showEADFields[immIndex] = false;

      this.tempExpiryDate = this.immigrationDetails?.controls[immIndex]?.get(
        'workAuthorizationExpiryDate'
      )?.value;
      this.isUSCitizen = false;
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationNumber')
        ?.enable();
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationStartDate')
        ?.enable();
      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationExpiryDate')
        ?.enable();

      this.immigrationDetails?.controls[immIndex]
        ?.get('workAuthorizationExpiryDate')
        ?.setValue(this.tempExpiryDate);

      this.tempEadCategoryCode =
        this.immigrationDetails?.controls[immIndex]?.get(
          'eadCategoryCode'
        )?.value;

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategoryCode')
        ?.disable();

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategoryCode')
        ?.setValue(this.tempEadCategoryCode);

      this.tempEadCategory =
        this.immigrationDetails?.controls[immIndex]?.get('eadCategory')?.value;

      this.immigrationDetails?.controls[immIndex]
        ?.get('eadCategory')
        ?.setValue(this.tempEadCategory);
    }
  }

  chooseEAD(event: MatSelectChange): void {
    this.eadCategory = String(this.mapEADCategoryCodes.get(event?.value));

    this.identificationInfoForm?.controls?.eadCategory?.setValue(
      this.mapEADCategoryCodes.get(event?.value)
    );
    this.identificationInfoForm?.controls?.eadCategory?.disable();
  }
}
