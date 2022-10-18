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
  PassportAddEditRecord,
  PassportResult,
} from '../../../interface/passport.interface';
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { DatePipe } from '@angular/common';
import { DateValidator } from '../../../../../shared/custom-validators/custom-validator-date';

@Component({
  selector: 'app-add-edit-passport',
  templateUrl: './add-edit-passport.component.html',
  styleUrls: ['./add-edit-passport.component.scss'],
})
export class AddEditPassportComponent
  extends DocumentUploadInfo
  implements OnInit
{
  passportForm!: FormGroup;
  passportResult!: PassportAddEditRecord;
  passportInfoId = '';

  mapCountry = new Map<number, string>();
  addPassportDoc!: PassportResult;

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
    this.passportResult = data?.obj?.passportData;
    this.personId = data?.obj?.personId;
    this.passportInfoId = data?.obj?.passportData?.passportInfoId;
    this.actionType = data?.obj?.action;

    this.addPassportDoc = {
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
  }

  ngOnInit(): void {
    this.passportForm = this.fb.group(
      {
        passportNumber: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z]*[0-9]{4,12}$')],
        ],
        passportIssueDate: ['', [Validators.required]],
        passportExpiryDate: ['', [Validators.required]],
        passportIssuedCity: [
          '',
          [Validators.required, Validators.maxLength(100)],
        ],
        passportIssueCountryCode: ['', [Validators.required]],
        documentInfo: [''],
        docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
      },
      {
        validator: [
          DateValidator.fromToDate(
            'passportIssueDate',
            'passportExpiryDate',
            'passportDatesNotValid'
          ),
        ],
      }
    );

    this.isLoading = true;
    this.lookupService.getCountryCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapCountry.set(country?.lookupCode, country?.description);
      }
      this.isLoading = false;
    });

    if (this.actionType === 'Add') {
      this.headerTitle = 'Passport Information';
    }
    if (this.actionType === 'Edit') {
      this.headerTitle = 'Edit Passport Information';

      this.passportForm.patchValue({
        passportNumber: this.passportResult?.passportNumber,
        passportIssueDate:
          this.passportResult?.passportIssueDate?.split('T')[0],
        passportExpiryDate:
          this.passportResult?.passportExpiryDate?.split('T')[0],
        passportIssuedCity: this.passportResult?.passportIssuedCity,
        passportIssueCountryCode: this.passportResult?.passportIssueCountryCode,
      });
      this.passportForm.setControl(
        'docProperty',
        this.setDocumentProperty(
          // tslint:disable-next-line: no-non-null-assertion
          this.passportResult?.documents!
        )
      );
      this.totalFiles = this.passportResult?.documents?.length as number;
    }

    this.setMinAndMaxIssueAndExpiryDate();
  }

  // tslint:disable-next-line: no-any
  uploadPassportFiles(event: any): void {
    this.files = event.target.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt?.includes(file?.name?.split('.')[1])
    );
    this.totalFiles = event?.target?.files?.length;
    this.newFileAddedCount = this.totalFiles;

    if (this.totalFiles > 0) {
      if (this.actionType === 'Add') {
        this.passportForm.setControl(
          'docProperty',
          this.setDocProperty(this.files)
        );
      }

      if (this.actionType === 'Edit') {
        for (const file of this.files) {
          this.docProperty.push(this.addDocProperty(file));
        }
      }
    }
  }
  get docProperty(): FormArray {
    return this.passportForm?.get('docProperty') as FormArray;
  }
  savePassport(): void {
    this.isLoading = true;
    this.addPassportDoc.personId = this.personId;

    this.addPassportDoc.passportNumber =
      this.passportForm?.controls?.passportNumber?.value;
    this.addPassportDoc.passportIssueDate = String(
      this.datepipe.transform(
        this.passportForm?.controls?.passportIssueDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.addPassportDoc.passportExpiryDate = String(
      this.datepipe.transform(
        this.passportForm?.controls?.passportExpiryDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.addPassportDoc.passportIssuedCity =
      this.passportForm?.controls?.passportIssuedCity?.value;
    this.addPassportDoc.passportIssueCountryCode =
      this.passportForm?.controls?.passportIssueCountryCode?.value;
    this.addPassportDoc.passportIssueCountry = this.mapCountry.get(
      this.addPassportDoc?.passportIssueCountryCode
    ) as string;

    this.addPassportDoc.isNewDocument = true;
    this.addPassportDoc.passportInfoId = this.passportResult?.passportInfoId;

    if (this.totalFiles > 0) {
      for (let i = 0; i < this.totalFiles; i++) {
        if (this.files?.length > 0) {
          this.docAddFile.push(this.files[i]);
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
        .savePassportDocuments(
          this.actionType,
          this.addPassportDoc,
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
            .savePassportDocuments(
              this.actionType,
              this.addPassportDoc,
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
          this.docDeleteId.push(doc?.get('documentId')?.value);
        }
        this.docProperty?.removeAt(i);
        if (doc?.get('documentId')?.value === '') {
          this.newFileAddedCount = this.newFileAddedCount - 1;
        }
      }
    });
  }
}
