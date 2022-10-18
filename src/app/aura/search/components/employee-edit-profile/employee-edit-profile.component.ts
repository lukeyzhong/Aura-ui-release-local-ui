import { Component, Inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FoundInList } from '../../../../shared/custom-validators/custom-validator-foundinlist';
import { SearchSupervisorService } from '../../../../shared/service/search-supervisor/search-supervisor.service';
import { LookupService } from '../../../../shared/service/lookup/lookup.service';
import { AgeValidator } from '../../../../shared/custom-validators/custom-validator-age';
import { debounceTime } from 'rxjs/operators';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatNotificationService } from '../../../../shared/service/mat-notification.service';
import { FileHandle } from '../../../../shared/interface/file-handle';
import { EmployeeProfileApiService } from '../../service/employee/employee-profile-api.service';
import { EmployeeProfileResult } from '../../interface/employee-profile/employee-profile-api.interface';
import {
  AddressType,
  ContactAddressType,
} from '../../interface/person.interface';
@Component({
  selector: 'app-employee-edit-profile',
  templateUrl: './employee-edit-profile.component.html',
  styleUrls: ['./employee-edit-profile.component.scss'],
})
export class EmployeeEditProfileComponent implements OnInit {
  @Input() accept = 'image/*';
  uploadedFiles!: FileHandle[];
  fileUploaded = false;
  isLoading = false;
  errorMsg!: string;
  personId = '';
  documentId: '';
  displayName = 'ProfilePhoto';
  documentPurposeCode = '36';
  resourceTypeCode = '4';
  isOverwrite = 'true';
  message = '';
  mapWorkAuth = new Map<number, string>();
  mapEmpType = new Map<number, string>();
  mapWageType = new Map<number, string>();
  mapCountry = new Map<number, string>();
  mapState = new Map<number, string>();
  mapGender = new Map<number, string>();
  mapSupervisor = new Map<string, string>();
  mapSuper = new Map<string, string>();
  empProfileResult!: EmployeeProfileResult;
  editProfileForm!: FormGroup;
  // tslint:disable-next-line: no-any
  imgURL: any;
  profileImgSrc!: string;
  isNewDocument = '';
  supervisor!: FormControl;
  supervisorKey = '';
  isSupervisorValid = true;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  email = '';
  cellCountry = '';
  cellPhone = '';
  officeCountry = '';
  officePhone = '';
  officeExtension = '';
  homeCountry = '';
  homePhone = '';
  entityTypeCodeValue = 1;
  contactAddPurposeCode = 1;
  emailContactAddId = '';
  emailContactAddTypeCode = 1;
  cellContactAddId = '';
  cellContactAddTypeCode = 2;
  homeContactAddId = '';
  homeContactAddTypeCode = 3;
  officeContactAddId = '';
  officeContactAddTypeCode = 9;
  mailingAddressId = '';
  mailingAddressTypeCode = 3;
  mailingAddressPurposeCode = 1;
  mailingAddress1 = '';
  mailingAddress2 = '';
  mailingCountryCodeValue = '';
  mailingCityName = '';
  mailingStateCodeValue = '';
  mailingPostalCodeValue!: number;
  isUpdateMailing = false;
  isUpdateEmail = false;
  isUpdateCellPhone = false;
  isUpdateOfficePhone = false;
  isUpdateHomePhone = false;
  contactAddressValue = '';

  constructor(
    private dialogRef: MatDialogRef<EmployeeEditProfileComponent>,
    private fb: FormBuilder,
    private dialogConfirm: MatDialog,
    private lookupService: LookupService,
    private employeeProfileApiService: EmployeeProfileApiService,
    private searchSupervisorService: SearchSupervisorService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.empProfileResult = data?.obj?.profileData;
    this.personId = data?.obj?.profileData?.personData?.personId;
    this.documentId = data?.obj?.profileData?.employeeProfilePhotoId;
    this.profileImgSrc = data?.obj?.profileSrc;
    this.mapSuper = data?.obj?.mapSuper;
  }

  ngOnInit(): void {
    if (this.empProfileResult?.personData?.contactAddresses !== null) {
      for (const contact of this.empProfileResult?.personData
        ?.contactAddresses) {
        if (contact?.contactAddressTypeCode === ContactAddressType.Email) {
          this.isUpdateEmail = true;
          this.email = contact.contactAddress;
          this.emailContactAddId = contact.contactAddressId;
        }
        if (contact?.contactAddressTypeCode === ContactAddressType.Mobile) {
          this.isUpdateCellPhone = true;
          // tslint:disable-next-line: no-non-null-assertion
          this.cellCountry = contact.countryCode!;
          this.cellPhone = contact.contactAddress;
          this.cellContactAddId = contact.contactAddressId;
        }
        if (contact?.contactAddressTypeCode === ContactAddressType.WorkPhone) {
          this.isUpdateOfficePhone = true;
          // tslint:disable-next-line: no-non-null-assertion
          this.officeCountry = contact.countryCode!;
          this.officePhone = contact.contactAddress?.split('|')[0];
          this.officeExtension = contact.contactAddress?.split('|')[1];
          this.officeContactAddId = contact.contactAddressId;
        }
        if (contact?.contactAddressTypeCode === ContactAddressType.HomePhone) {
          this.isUpdateHomePhone = true;
          // tslint:disable-next-line: no-non-null-assertion
          this.homeCountry = contact.countryCode!;
          this.homePhone = contact.contactAddress;
          this.homeContactAddId = contact.contactAddressId;
        }
      }
    }

    if (this.empProfileResult?.personData?.addresses !== null) {
      for (const address of this.empProfileResult?.personData?.addresses) {
        if (address?.addressTypeCode === AddressType.Mailing) {
          this.isUpdateMailing = true;
          this.mailingAddress1 = address.addressLine1;
          this.mailingAddress2 = address.addressLine2;
          this.mailingCountryCodeValue = address.countryCode;
          this.mailingCityName = address.city;
          this.mailingStateCodeValue = address.stateCode;
          this.mailingPostalCodeValue = address.postalCode;
          this.mailingAddressId = address.addressId;
        }
      }
    }

    this.editProfileForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      alias: ['', [Validators.minLength(1), Validators.maxLength(50)]],
      gender: [''],
      cellCountryCode: [
        '',
        [Validators.maxLength(4), Validators.pattern(/^\+\-?([1-9]\d*)?$/)],
      ],
      cellPhoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      officeCountryCode: [
        '',
        [Validators.maxLength(4), Validators.pattern(/^\+\-?([1-9]\d*)?$/)],
      ],
      officePhoneNumber: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      officeExt: ['', [Validators.pattern('^[0-9]{4}')]],
      homeCountryCode: [
        '',
        [Validators.maxLength(4), Validators.pattern(/^\+\-?([1-9]\d*)?$/)],
      ],
      homePhoneNumber: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      emailId: ['', Validators.required],
      employeeCode: [''],
      dateOfBirth: ['', [Validators.required, AgeValidator.isAgeInvalid()]],
      mailingAddressLine1: [
        '',
        [Validators.required, Validators.maxLength(50)],
      ],
      mailingAddressLine2: ['', Validators.maxLength(50)],
      mailingCountry: [''],
      mailingCity: ['', [Validators.required, Validators.maxLength(20)]],
      mailingStateCode: [''],
      mailingPostalCode: ['', Validators.pattern('^[0-9]{5}')],
      socialSecurityNumber: [''],
      employmentType: [''],
      startDate: [''],
      terminationDate: [''],
      wageType: [''],
      workAuthorizationStatus: [''],
      totalHoursWorked: [''],
      withBenefits: [''],
    });

    this.supervisor = new FormControl('', [
      Validators.required,
      FoundInList.isFoundInList(this.mapSuper),
    ]);

    this.editProfileForm.patchValue({
      firstName: this.empProfileResult?.personData?.firstName,
      lastName: this.empProfileResult?.personData?.lastName,
      alias: this.empProfileResult?.personData?.alias,
      gender: this.empProfileResult?.personData?.genderCode,
      cellCountryCode: this.cellCountry,
      cellPhoneNumber: this.parsePhoneNumberToShow(this.cellPhone),
      officeCountryCode: this.officeCountry,
      officePhoneNumber: this.parsePhoneNumberToShow(this.officePhone),
      officeExt: this.officeExtension,
      homeCountryCode: this.homeCountry,
      homePhoneNumber: this.parsePhoneNumberToShow(this.homePhone),
      emailId: this.email,
      employeeCode: this.empProfileResult?.employeeCode,
      dateOfBirth:
        this.empProfileResult?.personData?.dateOfBirth?.split('T')[0],
      mailingAddressLine1: this.mailingAddress1,
      mailingAddressLine2: this.mailingAddress2,
      // tslint:disable-next-line: radix
      mailingCountry: parseInt(this.mailingCountryCodeValue),
      mailingCity: this.mailingCityName,
      // tslint:disable-next-line: radix
      mailingStateCode: parseInt(this.mailingStateCodeValue),
      mailingPostalCode: this.mailingPostalCodeValue,
      socialSecurityNumber:
        this.empProfileResult?.personData?.socialSecurityNumber,
      employmentType: this.empProfileResult?.employmentTypeCode,
      startDate: this.empProfileResult?.startDate?.split('T')[0],
      terminationDate: this.empProfileResult?.terminationDate?.split('T')[0],
      wageType: this.empProfileResult?.wageTypeCode,
      workAuthorizationStatus:
        this.empProfileResult?.workAuthorizationStatusCode,
      totalHoursWorked: this.empProfileResult?.totalHoursWorked,
      withBenefits: this.empProfileResult?.withBenefits,
    });

    this.supervisor.setValue(this.empProfileResult?.supervisor);

    if (this.empProfileResult?.withBenefits === true) {
      this.editProfileForm.controls.withBenefits.disable();
    }
    this.editProfileForm.controls.employeeCode.disable();
    this.editProfileForm.controls.socialSecurityNumber.disable();
    this.editProfileForm.controls.totalHoursWorked.disable();

    this.editProfileForm.controls.employmentType.disable();
    this.editProfileForm.controls.startDate.disable();
    this.editProfileForm.controls.terminationDate.disable();
    this.editProfileForm.controls.wageType.disable();
    this.editProfileForm.controls.workAuthorizationStatus.disable();
    this.supervisor.disable();

    this.getAllDropDownData();

    this.supervisor.valueChanges
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if (searchString !== '') {
          this.searchSupervisorService.search(searchString).subscribe(
            (data) => {
              this.mapSupervisor = data?.result;
            },
            (err) => {
              console.log(err);
            }
          );
        }
      });
  }

  getAllDropDownData(): void {
    this.isLoading = true;
    this.lookupService.getMultipleDropDownData().subscribe((responseList) => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responseList[0].result?.length; i++) {
        this.mapWorkAuth.set(
          responseList[0].result[i]?.lookupCode,
          responseList[0].result[i]?.description
        );
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responseList[1].result?.length; i++) {
        this.mapEmpType.set(
          responseList[1].result[i]?.lookupCode,
          responseList[1].result[i]?.description
        );
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responseList[2].result?.length; i++) {
        this.mapWageType.set(
          responseList[2].result[i]?.lookupCode,
          responseList[2].result[i]?.description
        );
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responseList[3].result?.length; i++) {
        this.mapCountry.set(
          responseList[3].result[i]?.lookupCode,
          responseList[3].result[i]?.description
        );
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responseList[4].result?.length; i++) {
        this.mapState.set(
          responseList[4].result[i]?.lookupCode,
          responseList[4].result[i]?.description
        );
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < responseList[5].result?.length; i++) {
        this.mapGender.set(
          responseList[5].result[i]?.lookupCode,
          responseList[5].result[i]?.description
        );
      }
      this.isLoading = false;
    });
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

  filesDropped(files: FileHandle[]): void {
    this.message = '';
    this.fileUploaded = true;
    this.imgURL = '';
    this.uploadedFiles = files;
    // tslint:disable-next-line: no-non-null-assertion
    const ext = this.getExtension(this.uploadedFiles[0].file?.name!);
    switch (ext.toLowerCase()) {
      case 'jpg':
      case 'gif':
      case 'bmp':
      case 'png':
        this.saveProfilePhoto(
          // tslint:disable-next-line: no-non-null-assertion
          this.uploadedFiles[0].file!,
          this.displayName,
          this.documentPurposeCode,
          this.documentId,
          this.personId,
          this.resourceTypeCode,
        );
        return;
    }
    this.message = '*Only images are supported.';
    return;
  }

  getExtension(filename: string): string {
    const parts = filename.split('.');
    return parts[parts.length - 1];
  }

  onUpload(): void {
    const fileUpload = document.getElementById(
      'fileUpload'
    ) as HTMLInputElement;
    fileUpload?.click();
  }

  preview(files: FileList, event: Event): void {
    this.message = '';
    this.fileUploaded = false;
    if (files?.length === 0) {
      return;
    }
    const mimeType = files[0]?.type;
    this.message = '';
    if (mimeType.match(/image\/*/) == null) {
      this.message = '*Only images are supported.';
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (EVENT) => {
      this.imgURL = reader?.result;
    };
    const ext = this.getExtension(files[0].name);
    const target = event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    // tslint:disable-next-line: no-non-null-assertion
    this.saveProfilePhoto(
      file,
      this.displayName,
      this.documentPurposeCode,
      this.documentId,
      this.personId,
      this.resourceTypeCode,
    );
  }

  saveProfilePhoto(
    file: File,
    displayName: string,
    documentPurposeCode: string,
    documentId: string,
    personId: string,
    resourceTypeCode: string,
  ): void {
    this.isLoading = true;
    if (!documentId) {
      this.isNewDocument = 'true';
    } else {
      this.isNewDocument = 'false';
    }
    this.employeeProfileApiService
      .uploadEmployeeProfilePhoto(
        file,
        displayName,
        documentPurposeCode,
        documentId,
        personId,
        resourceTypeCode,
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          if (data?.errorCode === 0) {
            this.matNotificationService.success(
              ':: Profile Photo saved successfully'
            );
          }
          else {
            this.matNotificationService.warn(
              ':: Unable to save profile photo successfully');
            this.isLoading = false;
          }
        },
        (error) => {
          this.message =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to save profile photo successfully'
          );
          this.isLoading = false;
        }
      );
  }

  onSave(): void {
    this.empProfileResult.personData.contactAddresses = [];
    this.empProfileResult.personData.addresses = [];
    this.empProfileResult.personData.firstName =
      this.editProfileForm?.controls?.firstName?.value;
    this.empProfileResult.personData.lastName =
      this.editProfileForm?.controls?.lastName?.value;
    this.empProfileResult.personData.alias =
      this.editProfileForm?.controls?.alias?.value;
    this.empProfileResult.personData.genderCode =
      this.editProfileForm?.controls?.gender?.value;

    this.cellContactAddId =
      this.isUpdateCellPhone === true
        ? this.cellContactAddId
        : '00000000-0000-0000-0000-000000000000';
    if (
      this.isUpdateCellPhone === true ||
      (this.isUpdateCellPhone === false &&
        this.editProfileForm?.controls?.cellPhoneNumber?.value !== '')
    ) {
      this.empProfileResult.personData.contactAddresses.push({
        countryCode: this.editProfileForm?.controls?.cellCountryCode?.value,
        contactAddress: this.parsePhoneNumberToSave(
          this.editProfileForm?.controls?.cellPhoneNumber?.value
        ),
        contactAddressId: this.cellContactAddId,
        contactAddressTypeCode: this.cellContactAddTypeCode,
        entityTypeCode: this.entityTypeCodeValue,
        contactAddressPurposeCode: this.contactAddPurposeCode,
        entityId: this.personId,
      });
    }
    this.officeContactAddId =
      this.isUpdateOfficePhone === true
        ? this.officeContactAddId
        : '00000000-0000-0000-0000-000000000000';
    if (this.editProfileForm?.controls?.officePhoneNumber?.value === '') {
      this.contactAddressValue = '';
    } else {
      this.contactAddressValue =
        this.parsePhoneNumberToSave(
          this.editProfileForm?.controls?.officePhoneNumber?.value
        ) +
        '|' +
        this.editProfileForm?.controls?.officeExt?.value;
    }
    // tslint:disable-next-line: max-line-length
    if (
      this.isUpdateOfficePhone === true ||
      (this.isUpdateOfficePhone === false &&
        this.editProfileForm?.controls?.officePhoneNumber?.value !== '')
    ) {
      this.empProfileResult.personData.contactAddresses.push({
        countryCode: this.editProfileForm?.controls?.officeCountryCode?.value,
        contactAddress: this.contactAddressValue,
        contactAddressId: this.officeContactAddId,
        contactAddressTypeCode: this.officeContactAddTypeCode,
        entityTypeCode: this.entityTypeCodeValue,
        contactAddressPurposeCode: this.contactAddPurposeCode,
        entityId: this.personId,
      });
    }

    this.homeContactAddId =
      this.isUpdateHomePhone === true
        ? this.homeContactAddId
        : '00000000-0000-0000-0000-000000000000';
    if (
      this.isUpdateHomePhone === true ||
      (this.isUpdateHomePhone === false &&
        this.editProfileForm?.controls?.homePhoneNumber?.value !== '')
    ) {
      this.empProfileResult.personData.contactAddresses.push({
        countryCode: this.editProfileForm?.controls?.homeCountryCode?.value,
        contactAddress: this.parsePhoneNumberToSave(
          this.editProfileForm?.controls?.homePhoneNumber?.value
        ),
        contactAddressId: this.homeContactAddId,
        contactAddressTypeCode: this.homeContactAddTypeCode,
        entityTypeCode: this.entityTypeCodeValue,
        contactAddressPurposeCode: this.contactAddPurposeCode,
        entityId: this.personId,
      });
    }

    this.emailContactAddId =
      this.isUpdateEmail === true
        ? this.emailContactAddId
        : '00000000-0000-0000-0000-000000000000';
    if (
      this.isUpdateEmail === true ||
      (this.isUpdateEmail === false &&
        this.editProfileForm?.controls?.emailId?.value !== '')
    ) {
      this.empProfileResult.personData.contactAddresses.push({
        contactAddress: this.editProfileForm?.controls?.emailId?.value,
        contactAddressId: this.emailContactAddId,
        contactAddressTypeCode: this.emailContactAddTypeCode,
        entityTypeCode: this.entityTypeCodeValue,
        contactAddressPurposeCode: this.contactAddPurposeCode,
        entityId: this.personId,
      });
    }

    this.empProfileResult.personData.dateOfBirth =
      this.editProfileForm?.controls?.dateOfBirth?.value;

    this.mailingAddressId =
      this.isUpdateMailing === true
        ? this.mailingAddressId
        : '00000000-0000-0000-0000-000000000000';
    if (
      this.isUpdateMailing === true ||
      (this.isUpdateMailing === false &&
        this.editProfileForm?.controls?.mailingAddressLine1?.value !== '')
    ) {
      this.empProfileResult.personData.addresses.push({
        addressLine1:
          this.editProfileForm?.controls?.mailingAddressLine1?.value,
        addressLine2:
          this.editProfileForm?.controls?.mailingAddressLine2?.value,
        countryCode:
          this.editProfileForm?.controls?.mailingCountry?.value.toString(),
        city: this.editProfileForm?.controls?.mailingCity?.value,
        stateCode:
          this.editProfileForm?.controls?.mailingStateCode?.value.toString(),
        postalCode: this.editProfileForm?.controls?.mailingPostalCode?.value,
        addressId: this.mailingAddressId,
        addressTypeCode: this.mailingAddressTypeCode,
        addressPurposeCode: this.mailingAddressPurposeCode,
        entityTypeCode: this.entityTypeCodeValue,
        entityId: this.personId,
      });
    }

    this.empProfileResult.employmentTypeCode =
      this.editProfileForm?.controls?.employmentType?.value.toString();
    this.empProfileResult.startDate =
      this.editProfileForm?.controls?.startDate?.value;
    this.empProfileResult.terminationDate =
      this.editProfileForm?.controls?.terminationDate?.value;
    this.empProfileResult.wageTypeCode =
      this.editProfileForm?.controls?.wageType?.value.toString();
    this.empProfileResult.workAuthorizationStatusCode =
      this.editProfileForm?.controls?.workAuthorizationStatus?.value.toString();
    this.empProfileResult.supervisorId = this.getKeyByValue(
      this.mapSuper,
      this.supervisor?.value
    );
    this.empProfileResult.withBenefits =
      this.editProfileForm?.controls?.withBenefits?.value;
    this.isLoading = true;
    this.employeeProfileApiService
      .updateEmployeeProfile(this.empProfileResult)
      .subscribe(
        (data) => {
          if (data?.errorCode === 0) {
            this.isLoading = false;
            this.matNotificationService.success(
              ':: Information updated successfully'
            );
            this.dialogRef.close('success');
          }
          else {
            this.matNotificationService.warn(':: Unable to save successfully');
            this.isLoading = false;
          }
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to save successfully');
          this.isLoading = false;
        }
      );
  }

  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object.keys(object).find((key) => object[key] === value);
  }

  onCancel(e: Event): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you want to leave without saving?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialogRef.close('cancel');
      }
    });
    e.preventDefault();
  }
}
