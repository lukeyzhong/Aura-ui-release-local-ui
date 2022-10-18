import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  DrivingLicenseAddEditRecord,
  DrivingLicenseResult,
  LocationResult,
} from '../../../interface/driving-license.interface';
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { DatePipe } from '@angular/common';
import { DateValidator } from '../../../../../shared/custom-validators/custom-validator-date';

@Component({
  selector: 'app-add-edit-drivinglicense',
  templateUrl: './add-edit-drivinglicense.component.html',
  styleUrls: ['./add-edit-drivinglicense.component.scss'],
})
export class AddEditDrivinglicenseComponent
  extends DocumentUploadInfo
  implements OnInit
{
  drivingLicenseForm!: FormGroup;
  drivingLicenseResult!: DrivingLicenseAddEditRecord;
  drivingLicenseID = '';

  mapState = new Map<number, string>();
  mapCountry = new Map<number, string>();

  addDrivingLicenseDoc!: DrivingLicenseResult;
  location!: LocationResult;
  newFileAddedCount = 0;

  constructor(
    private datepipe: DatePipe,
    private genericProfileApiService: GenericProfileApiService,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    // tslint:disable-next-line: no-any
    dialogRef: MatDialogRef<any>,
    dialogConfirm: MatDialog,
    fb: FormBuilder
  ) {
    super(dialogRef, dialogConfirm, fb);
    this.drivingLicenseResult = data?.obj?.drivingLicenseData;
    this.personId = data?.obj?.personId;
    this.drivingLicenseID = data?.obj?.drivingLicenseData?.drivingLicenseID;
    this.actionType = data?.obj?.action;

    this.location = Object.assign({}, this.location);
    this.addDrivingLicenseDoc = {
      personId: '',
      drivingLicenseNo: '',
      issueDate: '',
      expiryDate: '',
      location: this.location,
      isNewDocument: true,
      resourceTypeCode: 4,
      documentPurposeCode: 14,
    };
  }

  ngOnInit(): void {
    this.drivingLicenseForm = this.fb.group(
      {
        drivingLicenseNo: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z]*[0-9]{4,20}$')],
        ],
        city: [
          '',
          [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
        ],
        stateCode: ['', [Validators.required]],
        zip: ['', [Validators.required, Validators.pattern('[1-9][0-9]{4}')]],
        dlIssueDate: ['', [Validators.required]],
        dlExpiryDate: ['', [Validators.required]],
        documentInfo: [''],
        docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'dlIssueDate',
            'dlExpiryDate',
            'dlDatesNotValid'
          ),
        ],
      }
    );

    if (this.actionType === 'Add') {
      this.headerTitle = 'Driving License Information';
    }
    if (this.actionType === 'Edit') {
      this.headerTitle = 'Edit Driving License Information';
      this.drivingLicenseForm.patchValue({
        drivingLicenseNo: this.drivingLicenseResult?.drivingLicenseNo,
        city: this.drivingLicenseResult?.location?.city,
        stateCode: this.drivingLicenseResult?.location?.stateCode,
        zip: this.drivingLicenseResult?.location?.zip,
        dlIssueDate: this.drivingLicenseResult?.issueDate?.split('T')[0],
        dlExpiryDate: this.drivingLicenseResult?.expiryDate?.split('T')[0],
      });
      this.drivingLicenseForm.setControl(
        'docProperty',
        this.setDocumentProperty(
          // tslint:disable-next-line: no-non-null-assertion
          this.drivingLicenseResult?.documents!
        )
      );
      this.totalFiles = this.drivingLicenseResult?.documents?.length as number;
    }

    this.setMinAndMaxIssueAndExpiryDate();
    this.isLoading = true;
    this.lookupService.getStateCode().subscribe((data) => {
      for (const state of data?.result) {
        this.mapState.set(state?.lookupCode, state?.description);
      }
      this.isLoading = false;
    });
    this.lookupService.getCountryCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapCountry.set(country?.lookupCode, country?.description);
      }
    });
  }

  // tslint:disable-next-line: no-any
  uploadfiles(event: any): void {
    this.files = event.target.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt?.includes(file?.name?.split('.')[1])
    );
    this.totalFiles = event?.target?.files?.length;
    this.newFileAddedCount = this.totalFiles;

    if (this.totalFiles > 0) {
      if (this.actionType === 'Add') {
        this.drivingLicenseForm.setControl(
          'docProperty',
          this.setDocProperty(this.files)
        );
      }

      if (this.actionType === 'Edit') {
        for (const file of this.files) {
          this.docProperty?.push(this.addDocProperty(file));
        }
      }
    }
  }
  get docProperty(): FormArray {
    return this.drivingLicenseForm?.get('docProperty') as FormArray;
  }
  saveDrivingLicense(): void {
    this.isLoading = true;
    this.addDrivingLicenseDoc.personId = this.personId;

    this.addDrivingLicenseDoc.drivingLicenseNo =
      this.drivingLicenseForm?.controls?.drivingLicenseNo?.value;
    this.addDrivingLicenseDoc.issueDate = String(
      this.datepipe.transform(
        this.drivingLicenseForm?.controls?.dlIssueDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.addDrivingLicenseDoc.expiryDate = String(
      this.datepipe.transform(
        this.drivingLicenseForm?.controls?.dlExpiryDate?.value,
        'yyyy-MM-dd'
      )
    );

    this.addDrivingLicenseDoc.location.locationTypeCode = 1;
    this.addDrivingLicenseDoc.location.resourceTypeCode = 18;
    this.addDrivingLicenseDoc.location.city =
      this.drivingLicenseForm?.controls?.city?.value;
    this.addDrivingLicenseDoc.location.stateCode =
      this.drivingLicenseForm?.controls?.stateCode?.value.toString();
    this.addDrivingLicenseDoc.location.zip =
      this.drivingLicenseForm?.controls?.zip?.value;

    this.addDrivingLicenseDoc.isNewDocument = true;
    this.addDrivingLicenseDoc.drivingLicenseID =
      this.drivingLicenseResult?.drivingLicenseID;

    if (this.totalFiles > 0) {
      for (let i = 0; i < this.totalFiles; i++) {
        if (this.files?.length > 0) {
          this.docAddFile?.push(this.files[i]);
        }
      }
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.docProperty?.controls?.length; i++) {
        if (this.docProperty?.controls[i]?.get('documentId')?.value === '') {
          this.docAddId.push(
            this.docProperty?.controls[i]?.get('documentId')?.value
          );
          this.docAddDisplayName.push(
            this.docProperty?.controls[i]?.get('displayName')?.value === ''
              ? this.files[i]?.name?.split('.')[0]
              : this.docProperty?.controls[i]?.get('displayName')?.value
          );
          this.docAddFileDescription.push(
            this.docProperty?.controls[i]?.get('fileDescription')?.value
          );
        } else {
          this.docUpdateId.push(
            this.docProperty?.controls[i]?.get('documentId')?.value
          );
          this.docUpdateDisplayName.push(
            this.docProperty?.controls[i]?.get('displayName')?.value === ''
              ? 'no-name'
              : this.docProperty?.controls[i]?.get('displayName')?.value
          );
          this.docUpdateFileDescription.push(
            this.docProperty?.controls[i]?.get('fileDescription')?.value === ''
              ? 'null'
              : this.docProperty?.controls[i]?.get('fileDescription')?.value
          );
        }
      }
      this.genericProfileApiService
        .saveDrivingLicenseDocuments(
          this.actionType,
          this.addDrivingLicenseDoc,
          this.newFileAddedCount,
          this.docAddFileDescription,
          this.docAddDisplayName,
          this.docAddFile,
          this.docUpdateId,
          this.docUpdateDisplayName,
          this.docUpdateFileDescription,
          this.docDeleteId
        )
        .subscribe(
          (data) => {
            this.isLoading = false;
            this.matNotificationService.success(
              ':: Information stored successfully'
            );
            this.dialogRef.close('success');
          },
          (err) => {
            this.errorMsg =
              '*There is problem with the service. Please try again later';
            console.warn(err);
            this.matNotificationService.warn(':: Unable to store successfully');
            this.isLoading = false;
          }
        );
    } else {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save without document?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.genericProfileApiService
            .saveDrivingLicenseDocuments(
              this.actionType,
              this.addDrivingLicenseDoc,
              this.newFileAddedCount,
              this.docAddFileDescription,
              this.docAddDisplayName,
              this.docAddFile,
              this.docUpdateId,
              this.docUpdateDisplayName,
              this.docUpdateFileDescription,
              this.docDeleteId
            )
            .subscribe(
              (data) => {
                this.isLoading = false;
                this.matNotificationService.success(
                  ':: Information stored successfully'
                );
                this.dialogRef.close('success');
              },
              (err) => {
                this.errorMsg =
                  '*There is problem with the service. Please try again later';
                console.warn(err);
                this.matNotificationService.warn(
                  ':: Unable to store successfully'
                );
                this.isLoading = false;
              }
            );
        } else {
          this.isLoading = false;
        }
      });
    }
  }

  deleteFile(doc: AbstractControl, i: number): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to delete this document?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (doc?.get('documentId')?.value !== '') {
          this.docDeleteId?.push(doc?.get('documentId')?.value);
        }
        this.docProperty?.removeAt(i);
        if (doc?.get('documentId')?.value === '') {
          this.newFileAddedCount = this.newFileAddedCount - 1;
        }
      }
    });
  }
}
