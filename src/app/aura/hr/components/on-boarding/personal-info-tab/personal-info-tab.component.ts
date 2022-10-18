import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  GoogleAddress,
  OnboardingDetailsResult,
  PersonalInformationResult,
} from '../../../interface/dashboard/candidate-onboarding.interface';
import {
  Addresses,
  AddressType,
  ContactAddresses,
  ContactAddressType,
} from '../../../../search/interface/person.interface';
import { CandidateOnboardingService } from '../../../service/dashboard/candidate-onboarding.service';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { GoogleMapService } from '../../../../../shared/service/google-map/google-map.service';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { GlobalVariables } from '../../../../../shared/enums/global-variables.enum';
import { AgeValidator } from '../../../../../shared/custom-validators/custom-validator-age';
import { DatePipe, DOCUMENT } from '@angular/common';
import { AtsAuraOnboardDialogComponent } from '../../../../../shared/components/ats-aura-onboard-dialog/ats-aura-onboard-dialog.component';
import { GlobalSearchApiService } from '../../../../../shared/service/search/global-search-api.service';
import { GoogleMapKeyResult } from '../../../../../shared/interface/google-map.interface';
import { AddressComponent } from 'ngx-google-places-autocomplete/objects/addressComponent';

@Component({
  selector: 'app-personal-info-tab',
  templateUrl: './personal-info-tab.component.html',
  styleUrls: ['./personal-info-tab.component.scss'],
})
export class PersonalInfoTabComponent implements OnInit {
  personalInfoForm!: FormGroup;
  personalInformationResult!: PersonalInformationResult;

  onboardingDetailsResult!: OnboardingDetailsResult;
  @Output() candidateNameChanged = new EventEmitter();
  @Input() stepper!: MatStepper;
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';

  piEditStatus = false;
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

  contactAddress!: ContactAddresses[] | null;
  livingAddress!: Addresses | null;
  livingAddrStateName = '';
  livingAddrCountryName = '';
  addressId = '';
  googleAddressLine1 = '';

  showContinue = true;

  mapCountry = new Map<number, string>();
  mapState = new Map<number, string>();
  mapGender = new Map<number, string>();
  mapWorkAuth = new Map<number, string>();
  mapEmpType = new Map<number, string>();
  mapEmploymentType = new Map<string, string>();
  mapEmpCategory = new Map<number, string>();
  mapMarital = new Map<number, string>();

  googleAddress!: GoogleAddress;
  // tslint:disable-next-line: no-any
  options: any = {
    componentRestrictions: { country: 'USA' },
  };
  isApiLoaded = false;
  isLoadingGoogle = false;
  googleMapKeyResult!: GoogleMapKeyResult;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private datepipe: DatePipe,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingService: CandidateOnboardingService,
    private globalSearchApiService: GlobalSearchApiService,
    private dialogConfirm: MatDialog,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef,
    private googleMapService: GoogleMapService
  ) {}

  ngOnInit(): void {
    this.candidateOnboardingService.getPIStatus().subscribe((status) => {
      this.piEditStatus = status;
    });
    this.setPersonalInformation();
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
      officeExt: ['', [Validators.pattern('^[0-9]{1,4}')]],
      homeCountryCode: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      homePhoneNumber: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      emailId: ['', [Validators.required, Validators.email]],
      socialSecurityNumber: [
        '',
        [Validators.required, Validators.pattern('[0-9]{9}')],
      ],
      ssn: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      gender: ['', Validators.required],
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
      workAuthorizationStatus: ['', Validators.required],
    });

    this.personalInfoForm?.controls?.firstName?.disable();
    this.personalInfoForm?.controls?.lastName?.disable();
    this.getAllDropDownData();

    this.loadScript().then(() => {
      this.isApiLoaded = true;
    });
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
          console.log(err);
        }
      );
    });
  }
  showGoogleSpinner(addressLine1: string): void {
    if (addressLine1.length > 0) {
      this.isLoadingGoogle = true;
      // this.disableMailingAddress();
    } else {
      this.isLoadingGoogle = false;
      // this.enableMailingAddress();
    }
  }
  disableMailingAddress(): void {
    this.personalInfoForm?.controls?.mailingCity?.disable();
    this.personalInfoForm?.controls?.mailingState?.disable();
    this.personalInfoForm?.controls?.mailingCountry?.disable();
    this.personalInfoForm?.controls?.mailingPostalCode?.disable();
  }
  enableMailingAddress(): void {
    this.personalInfoForm?.controls?.mailingCity?.enable();
    this.personalInfoForm?.controls?.mailingState?.enable();
    this.personalInfoForm?.controls?.mailingCountry?.enable();
    this.personalInfoForm?.controls?.mailingPostalCode?.enable();
  }

  // tslint:disable-next-line: no-any
  handleAddressChange(address: any): void {
    this.googleAddress = this.getLocationFromPlace(
      address.address_components
    ) as GoogleAddress;

    if (this.googleAddress?.route) {
      this.googleAddressLine1 = this.googleAddress?.route;

      this.personalInfoForm?.controls?.mailingAddressLine1?.setValue(
        this.googleAddressLine1
      );

      this.personalInfoForm?.controls?.mailingAddressLine2?.setValue(
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

  appliedForSSN(isChecked: boolean): void {
    if (isChecked) {
      this.personalInfoForm?.controls?.socialSecurityNumber?.setValue('');
      this.personalInfoForm?.controls?.socialSecurityNumber?.disable();
    } else {
      this.personalInfoForm?.controls?.socialSecurityNumber?.enable();
    }
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
        for (let i = 0; i < responseList[5].result?.length; i++) {
          this.mapWorkAuth.set(
            responseList[5]?.result[i]?.lookupCode,
            responseList[5]?.result[i]?.description
          );
        }
      });
  }

  setATSToAuraTimer(timeLeft: number): void {
    const dialogConfig = new MatDialogConfig();
    // tslint:disable-next-line: no-any
    const obj: any = {
      timeLeft,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '40%';
    dialogConfig.panelClass = 'ats-aura-timer';
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialogConfirm.open(
      AtsAuraOnboardDialogComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'cancel') {
        const searchURLPart = `HR/Dashboard`;
        localStorage.setItem('path', searchURLPart);
        this.globalSearchApiService?.sendPath(searchURLPart);
        this.router.navigate(['/aura/hr']);
      }
    });
  }

  setPersonalInformation(): void {
    this.candidateOnboardingService
      .getPersonalInformation(this.candidateId, this.candidateJobRequirementId)
      .subscribe(
        (data) => {
          if (data?.errorCode === 112) {
            this.setATSToAuraTimer(Number(data?.result));
          } else {
            this.personalInformationResult = data?.result;

            this.personId = data?.result?.personId;
            if (
              data?.result?.contactAddresses !== null &&
              data?.result?.contactAddresses !== undefined &&
              data?.result?.contactAddresses?.length > 0
            ) {
              this.contactAddress = data?.result?.contactAddresses;
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
              this.contactAddress = null;
              this.resetContactAddress();
            }

            if (
              data?.result?.address?.addressTypeCode === AddressType.Mailing
            ) {
              this.livingAddress = data?.result?.address;
              this.addressId = data?.result?.address?.addressId;
              this.findLivingAddressStateName(this.livingAddress?.stateCode);
              this.findLivingAddressCountryName(
                this.livingAddress?.countryCode
              );
            } else {
              this.livingAddress = null;
            }

            if (this.personalInformationResult?.socialSecurityNumber) {
              this.personalInfoForm.controls.socialSecurityNumber.disable();
            } else {
              this.personalInfoForm.controls.socialSecurityNumber.enable();
            }
            this.personalInfoForm.patchValue({
              firstName: this.personalInformationResult?.firstName,
              lastName: this.personalInformationResult?.lastName,
              aliasName: this.personalInformationResult?.aliasName,
              dateOfBirth:
                this.personalInformationResult?.dateOfBirth?.split('T')[0],
              cellCountryCode: this.cellCountry,
              cellPhoneNumber: this.parsePhoneNumberToShow(
                this.cellPhoneNumber
              ),
              officeCountryCode: this.officeCountry,
              officePhoneNumber: this.parsePhoneNumberToShow(
                this.officePhoneNumber
              ),
              officeExt: this.officeExtension,
              homeCountryCode: this.homeCountry,
              homePhoneNumber: this.parsePhoneNumberToShow(
                this.homePhoneNumber
              ),
              emailId: this.email,
              socialSecurityNumber:
                this.personalInformationResult?.socialSecurityNumber,
              maritalStatus: this.personalInformationResult?.maritalStatusCode,
              gender: this.personalInformationResult?.genderCode,
              mailingAddressLine1:
                this.personalInformationResult?.address?.addressLine1,
              mailingAddressLine2:
                this.personalInformationResult?.address?.addressLine2,
              mailingCountry: this.personalInformationResult?.address
                ?.countryCode
                ? Number(this.personalInformationResult?.address?.countryCode)
                : this.personalInformationResult?.address?.countryCode,
              mailingState: this.personalInformationResult?.address?.stateCode
                ? Number(this.personalInformationResult?.address?.stateCode)
                : this.personalInformationResult?.address?.stateCode,
              mailingCity: this.personalInformationResult?.address?.city,
              mailingPostalCode:
                this.personalInformationResult?.address?.postalCode,
              workAuthorizationStatus:
                this.personalInformationResult?.workAuthorizationStatusCode,
              ssn: this.personalInformationResult?.ssnApplied,
            });

            if (
              this.personalInformationResult?.ssnApplied ||
              this.personalInformationResult?.socialSecurityNumber
            ) {
              this.personalInfoForm?.controls?.socialSecurityNumber?.disable();
            } else {
              this.personalInfoForm?.controls?.socialSecurityNumber?.enable();
            }
          }
        },
        (err) => {
          console.warn(err);
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

  editPersonalInfo(): void {
    this.piEditStatus = !this.piEditStatus;
    this.showContinue = !this.showContinue;
    this.isLoadingGoogle = false;
    this.enableMailingAddress();
  }

  onSavePrimaryInfo(): void {
    this.personalInformationResult.contactAddresses = [];
    this.personalInformationResult.firstName =
      this.personalInfoForm?.controls?.firstName?.value;
    this.personalInformationResult.lastName =
      this.personalInfoForm?.controls?.lastName?.value;
    this.personalInformationResult.aliasName =
      this.personalInfoForm?.controls?.aliasName?.value;
    this.personalInformationResult.dateOfBirth = String(
      this.datepipe.transform(
        this.personalInfoForm?.controls?.dateOfBirth?.value,
        'yyyy-MM-dd'
      )
    );
    this.personalInformationResult.socialSecurityNumber =
      this.personalInfoForm?.controls?.socialSecurityNumber?.value;

    this.cellContactAddressId =
      this.cellContactAddressId !== ''
        ? this.cellContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.cellPhoneNumber?.value !== '') {
      this.personalInformationResult?.contactAddresses?.push({
        countryCode: this.personalInfoForm?.controls?.cellCountryCode?.value,
        contactAddress: this.parsePhoneNumberToSave(
          this.personalInfoForm?.controls?.cellPhoneNumber?.value
        ),
        contactAddressId: this.cellContactAddressId,
        contactAddressTypeCode: 2,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    this.homeContactAddressId =
      this.homeContactAddressId !== ''
        ? this.homeContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.homePhoneNumber?.value !== '') {
      this.personalInformationResult?.contactAddresses?.push({
        countryCode: this.personalInfoForm?.controls?.homeCountryCode?.value,
        contactAddress: this.parsePhoneNumberToSave(
          this.personalInfoForm?.controls?.homePhoneNumber?.value
        ),
        contactAddressId: this.homeContactAddressId,
        contactAddressTypeCode: 3,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
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
      this.personalInformationResult?.contactAddresses.push({
        countryCode: this.personalInfoForm?.controls?.officeCountryCode?.value,
        contactAddress: contactAddressWithExt,
        contactAddressId: this.officeContactAddressId,
        contactAddressTypeCode: 9,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    this.emailContactAddressId =
      this.emailContactAddressId !== ''
        ? this.emailContactAddressId
        : GlobalVariables.DefaultGUID;

    if (this.personalInfoForm?.controls?.emailId?.value !== '') {
      this.personalInformationResult?.contactAddresses.push({
        contactAddress: this.personalInfoForm?.controls?.emailId?.value,
        contactAddressId: this.emailContactAddressId,
        contactAddressTypeCode: 1,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    this.personalInformationResult.maritalStatusCode =
      this.personalInfoForm?.controls?.maritalStatus?.value;
    this.personalInformationResult.genderCode =
      this.personalInfoForm?.controls?.gender?.value;

    this.personalInformationResult.address = {
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

    this.personalInformationResult.ssnApplied =
      this.personalInfoForm?.controls?.ssn?.value;
    this.personalInformationResult.workAuthorizationStatusCode =
      this.personalInfoForm?.controls?.workAuthorizationStatus?.value;

    this.candidateOnboardingService
      .savePersonalInformation(this.personalInformationResult)
      .subscribe(
        (data) => {
          this.personalInfoForm.markAsPristine();
          this.matNotificationService.success(
            ':: Personal Information updated successfully'
          );
          this.googleAddressLine1 = '';
          this.piEditStatus = false;
          this.showContinue = true;
          this.candidateOnboardingService.sendUpdatedEmail(
            this.personalInfoForm?.controls?.emailId?.value
          );
          this.candidateOnboardingService.sendUpdatedState(true);
          const candidateName = {
            firstName: this.personalInformationResult?.firstName,
            lastName: this.personalInformationResult?.lastName,
          };
          this.candidateNameChanged.emit(candidateName);

          this.setPersonalInformation();
        },
        (error) => {
          this.matNotificationService.warn(
            ':: Unable to update successfully ' + error
          );
          console.warn(error);
        }
      );
  }

  setOnboardingDetails(): void {
    this.candidateOnboardingService
      .getOnboardingDetails(this.candidateJobRequirementId)
      .subscribe(
        (data) => {
          this.onboardingDetailsResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onRestore(e: Event, personalInfoForm: FormGroup): void {
    if (personalInfoForm.dirty && personalInfoForm.valid) {
      this.dialogRef = this.dialogConfirm.open(ConfirmationDialogComponent, {
        disableClose: false,
      });

      this.dialogRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setPersonalInformation();
          this.piEditStatus = false;
          this.showContinue = true;
          personalInfoForm.markAsPristine();
        }
      });
      e.preventDefault();
    } else {
      this.setPersonalInformation();
    }
  }

  closePInfo(personalInfo: FormGroup): void {
    this.dialogRef = this.dialogConfirm.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you want to close?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        personalInfo.markAsPristine();
      }
      this.router.navigate(['/aura/hr/dashboard']);
    });
  }

  goToHrDashboard(personalInfo: FormGroup): void {
    this.dialogRef = this.dialogConfirm.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you want to save & close?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (
          (personalInfo.dirty && personalInfo.valid) ||
          personalInfo.controls.mailingAddressLine1.touched
        ) {
          this.onSavePrimaryInfo();
          personalInfo.markAsPristine();
        }
        this.router.navigate(['/aura/hr/dashboard']);
      }
    });
  }

  saveContinue(personalInfo: FormGroup): void {
    if (
      (personalInfo.dirty && personalInfo.valid) ||
      personalInfo.controls.mailingAddressLine1.touched
    ) {
      this.dialogRef = this.dialogConfirm.open(ConfirmationDialogComponent, {
        disableClose: false,
      });

      this.dialogRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.piEditStatus = false;
          this.showContinue = false;
          this.onSavePrimaryInfo();
          personalInfo.markAsPristine();
          this.stepper.next();
        }
      });
    } else {
      this.piEditStatus = false;
      this.showContinue = true;
      this.stepper.next();
      this.matNotificationService.success(':: No changes made.');
    }
  }
}
