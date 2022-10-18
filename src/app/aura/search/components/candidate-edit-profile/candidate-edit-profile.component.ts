import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LookupService } from '../../../../shared/service/lookup/lookup.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AgeValidator } from '../../../../shared/custom-validators/custom-validator-age';
import { CandidateProfileResult } from '../../interface/candidate-profile/candidate-profile-api.interface';
import { CandidateProfileApiService } from '../../service/candidate/candidate-profile-api.service';
import { MatNotificationService } from '../../../../shared/service/mat-notification.service';
import { FileHandle } from '../../../../shared/interface/file-handle';
import {
  AddressType,
  ContactAddressType,
} from '../../interface/person.interface';

@Component({
  selector: 'app-candidate-edit-profile',
  templateUrl: './candidate-edit-profile.component.html',
  styleUrls: ['./candidate-edit-profile.component.scss'],
})
export class CandidateEditProfileComponent implements OnInit {
  @Input() accept = 'image/*';
  expYears!: number[];
  expMonths!: number[];
  yearExp!: number;
  monthExp!: number;
  uploadedFiles!: FileHandle[];
  fileUploaded = false;
  // tslint:disable-next-line: no-any
  imgURL: any;
  profileImgSrc!: string;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  editProfileForm!: FormGroup;
  canProfileResult!: CandidateProfileResult;
  errorMsg!: string;
  personId = '';
  documentId: '';
  displayName = 'ProfilePhoto';
  documentPurposeCode = '36';
  resourceTypeCode = '4';
  isOverwrite = 'true';
  isNewDocument = '';
  message = '';
  isLoading = false;
  mapCountry = new Map<number, string>();
  mapState = new Map<number, string>();
  mapGender = new Map<number, string>();
  mapWorkAuth = new Map<number, string>();
  mapEmpType = new Map<number, string>();
  mapMarital = new Map<number, string>();
  mapSource = new Map<number, string>();
  mapNotice = new Map<number, string>();
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
    private dialogRef: MatDialogRef<CandidateEditProfileComponent>,
    private candidateProfileApiService: CandidateProfileApiService,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private dialogConfirm: MatDialog,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.canProfileResult = data?.obj?.profileData;
    this.personId = data?.obj?.profileData?.personData?.personId;
    this.documentId = data?.obj?.profileData?.candidateProfilePhotoId;
    this.profileImgSrc = data?.obj?.profileSrc;
  }

  ngOnInit(): void {
    if (this.canProfileResult?.personData?.contactAddresses !== null) {
      for (const contact of this.canProfileResult?.personData
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

    if (this.canProfileResult?.personData?.addresses !== null) {
      for (const address of this.canProfileResult?.personData?.addresses) {
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
      socialSecurityNumber: [''],
      maritalStatus: [''],
      gender: [''],
      dateOfBirth: ['', [Validators.required, AgeValidator.isAgeInvalid()]],
      mailingAddressLine1: [
        '',
        [Validators.required, Validators.maxLength(50)],
      ],
      mailingAddressLine2: ['', [Validators.maxLength(50)]],
      mailingCountry: [''],
      mailingStateCode: [''],
      mailingCity: ['', [Validators.required, Validators.maxLength(20)]],
      mailingPostalCode: ['', Validators.pattern('^[0-9]{5}')],
      employmentType: [''],
      workAuthorizationStatus: [''],
      source: [''],
      jobAppliedFor: [''],
      recruiter: [''],
      willingToRelocate: [''],
      willingToTelecommute: [''],
      workExperienceYears: [''],
      workExperienceMonths: [''],
      availability: [''],
      currAnnualSalary: [
        '',
        [
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(10000),
          Validators.max(300000),
        ],
      ],
      expAnnualSalary: [
        '',
        [
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(10000),
          Validators.max(300000),
        ],
      ],
      proAnnualSalary: [
        '',
        [
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(10000),
          Validators.max(300000),
        ],
      ],
    });

    this.monthExp = this.canProfileResult?.workExperience % 12;
    this.yearExp = (this.canProfileResult?.workExperience - this.monthExp) / 12;
    this.editProfileForm.patchValue({
      firstName: this.canProfileResult?.personData?.firstName,
      lastName: this.canProfileResult?.personData?.lastName,
      alias: this.canProfileResult?.personData?.alias,
      cellCountryCode: this.cellCountry,
      cellPhoneNumber: this.parsePhoneNumberToShow(this.cellPhone),
      officeCountryCode: this.officeCountry,
      officePhoneNumber: this.parsePhoneNumberToShow(this.officePhone),
      officeExt: this.officeExtension,
      homeCountryCode: this.homeCountry,
      homePhoneNumber: this.parsePhoneNumberToShow(this.homePhone),
      emailId: this.email,
      socialSecurityNumber:
        this.canProfileResult?.personData?.socialSecurityNumber,
      maritalStatus: this.canProfileResult?.personData?.maritalStatusCode,
      gender: this.canProfileResult?.personData?.genderCode,
      dateOfBirth:
        this.canProfileResult?.personData?.dateOfBirth?.split('T')[0],
      mailingAddressLine1: this.mailingAddress1,
      mailingAddressLine2: this.mailingAddress2,
      // tslint:disable-next-line: radix
      mailingCountry: parseInt(this.mailingCountryCodeValue),
      // tslint:disable-next-line: radix
      mailingStateCode: parseInt(this.mailingStateCodeValue),
      mailingCity: this.mailingCityName,
      mailingPostalCode: this.mailingPostalCodeValue,
      employmentType: this.canProfileResult?.employmentTypeCode,
      workAuthorizationStatus:
        this.canProfileResult?.workAuthorizationStatusCode,
      source: this.canProfileResult?.sourceTypeCode,
      jobAppliedFor: this.canProfileResult?.jobAppliedFor,
      recruiter: this.canProfileResult?.recruiterName,
      willingToRelocate: this.canProfileResult?.relocationFlag,
      willingToTelecommute: this.canProfileResult?.telecommuteFlag,
      workExperienceYears: this.yearExp,
      workExperienceMonths: this.monthExp,
      availability: this.canProfileResult?.availabilityCode,
      candidateStatus: this.canProfileResult?.candidateStatus,
      resumeDocumentId: this.canProfileResult?.resumeDocumentId,
      // proAnnualSalary: this.canProfileResult?.proposedSalary,
    });

    this.editProfileForm.controls.jobAppliedFor.disable();
    this.editProfileForm.controls.socialSecurityNumber.disable();
    this.editProfileForm.controls.recruiter.disable();
    this.editProfileForm.controls.employmentType.disable();

    this.expYears = [];
    this.expMonths = [];
    for (let i = 0; i <= 60; i++) {
      this.expYears.push(i);
    }
    for (let i = 0; i <= 12; i++) {
      this.expMonths.push(i);
    }
    this.getAllDropDownData();
  }

  getAllDropDownData(): void {
    this.isLoading = true;
    this.lookupService
      .getAllDropDownDataForCandidate()
      .subscribe((responseList) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[0].result?.length; i++) {
          this.mapMarital.set(
            responseList[0].result[i]?.lookupCode,
            responseList[0].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[1].result?.length; i++) {
          this.mapGender.set(
            responseList[1].result[i]?.lookupCode,
            responseList[1].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[2].result?.length; i++) {
          this.mapCountry.set(
            responseList[2].result[i]?.lookupCode,
            responseList[2].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[3].result?.length; i++) {
          this.mapState.set(
            responseList[3].result[i]?.lookupCode,
            responseList[3].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[4].result?.length; i++) {
          this.mapEmpType.set(
            responseList[4].result[i]?.lookupCode,
            responseList[4].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[5].result?.length; i++) {
          this.mapWorkAuth.set(
            responseList[5].result[i]?.lookupCode,
            responseList[5].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[6].result?.length; i++) {
          this.mapSource.set(
            responseList[6].result[i]?.lookupCode,
            responseList[6].result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[7].result?.length; i++) {
          this.mapNotice.set(
            responseList[7].result[i]?.lookupCode,
            responseList[7].result[i]?.description
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

  onSave(): void {
    this.canProfileResult.personData.contactAddresses = [];
    this.canProfileResult.personData.addresses = [];
    this.canProfileResult.personData.firstName =
      this.editProfileForm?.controls?.firstName?.value;
    this.canProfileResult.personData.lastName =
      this.editProfileForm?.controls?.lastName?.value;
    this.canProfileResult.personData.alias =
      this.editProfileForm?.controls?.alias?.value;

    this.cellContactAddId =
      this.isUpdateCellPhone === true
        ? this.cellContactAddId
        : '00000000-0000-0000-0000-000000000000';
    if (
      this.isUpdateCellPhone === true ||
      (this.isUpdateCellPhone === false &&
        this.editProfileForm?.controls?.cellPhoneNumber?.value !== '')
    ) {
      this.canProfileResult.personData.contactAddresses.push({
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
      this.canProfileResult.personData.contactAddresses.push({
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
      this.canProfileResult.personData.contactAddresses.push({
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
      this.canProfileResult.personData.contactAddresses.push({
        contactAddress: this.editProfileForm?.controls?.emailId?.value,
        contactAddressId: this.emailContactAddId,
        contactAddressTypeCode: this.emailContactAddTypeCode,
        entityTypeCode: this.entityTypeCodeValue,
        contactAddressPurposeCode: this.contactAddPurposeCode,
        entityId: this.personId,
      });
    }

    this.canProfileResult.personData.maritalStatusCode =
      this.editProfileForm?.controls?.maritalStatus?.value;
    this.canProfileResult.personData.genderCode =
      this.editProfileForm?.controls?.gender?.value;
    this.canProfileResult.personData.dateOfBirth =
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
      this.canProfileResult.personData.addresses.push({
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

    this.canProfileResult.workAuthorizationStatusCode =
      this.editProfileForm?.controls?.workAuthorizationStatus?.value;
    this.canProfileResult.sourceTypeCode =
      this.editProfileForm?.controls?.source?.value;
    this.canProfileResult.relocationFlag =
      this.editProfileForm?.controls?.willingToRelocate?.value;
    this.canProfileResult.telecommuteFlag =
      this.editProfileForm?.controls?.willingToTelecommute?.value;
    this.canProfileResult.workExperience =
      this.editProfileForm?.controls?.workExperienceYears?.value * 12 +
      this.editProfileForm?.controls?.workExperienceMonths?.value;
    this.canProfileResult.availabilityCode =
      this.editProfileForm?.controls?.availability?.value;
    // this.canProfileResult.currentSalary = this.editProfileForm?.controls?.currAnnualSalary?.value;
    // this.canProfileResult.expectedSalary = this.editProfileForm?.controls?.expAnnualSalary?.value;
    // this.canProfileResult.proposedSalary = this.editProfileForm?.controls?.proAnnualSalary?.value;
    this.isLoading = true;
    this.candidateProfileApiService
      .updateCandidateProfile(this.canProfileResult)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.matNotificationService.success(
            ':: Information updated successfully'
          );
          this.dialogRef.close('success');
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to save successfully');
          this.isLoading = false;
        }
      );
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
          this.isOverwrite
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
      this.isOverwrite
    );
  }

  saveProfilePhoto(
    file: File,
    displayName: string,
    documentPurposeCode: string,
    documentId: string,
    personId: string,
    resourceTypeCode: string,
    isOverwrite: string
  ): void {
    this.isLoading = true;
    if (!documentId) {
      this.isNewDocument = 'true';
    } else {
      this.isNewDocument = 'false';
    }
    this.candidateProfileApiService
      .uploadCandidateProfilePhoto(
        file,
        displayName,
        documentPurposeCode,
        documentId,
        personId,
        resourceTypeCode,
        isOverwrite,
        this.isNewDocument
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.matNotificationService.success(
            ':: Profile Photo saved successfully'
          );
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
