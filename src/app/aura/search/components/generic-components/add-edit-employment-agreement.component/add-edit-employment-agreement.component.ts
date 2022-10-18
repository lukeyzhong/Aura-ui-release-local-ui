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
import { EmploymentAgreementAddEditRecord } from '../../../interface/employment-agreement-documents.interface';
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { InformationDialogComponent } from '../../../../../shared/components/information-dialog/information-dialog.component';
import { DocumentInformation } from '../../../../../shared/interface/document-info.interface';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';

@Component({
  selector: 'app-add-edit-employment-agreement',
  templateUrl: './add-edit-employment-agreement.component.html',
  styleUrls: ['./add-edit-employment-agreement.component.scss'],
})
export class AddEditEmploymentAgreementComponent
  extends DocumentUploadInfo
  implements OnInit
{
  agreeForm!: FormGroup;
  documentInfo: DocumentInformation[] = [];
  mapDocumentType = new Map<number, string>();
  mapDocType = new Map<number, string>();
  resourceValue = '';
  documentTypeCode = 0;
  // tslint:disable-next-line: no-any
  dialogConfirmRef!: MatDialogRef<any>;
  employmentAgreementResult!: EmploymentAgreementAddEditRecord;
  actionType = '';
  docPurposeCode!: number;
  resourceTypeCode = 0;

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    // tslint:disable-next-line: no-any
    dialogRef: MatDialogRef<any>,
    dialogConfirm: MatDialog,
    fb: FormBuilder
  ) {
    super(dialogRef, dialogConfirm, fb);
    this.employmentAgreementResult = data?.obj?.employmentAgreementData;
    this.resourceValue = data?.obj?.id;
    this.actionType = data?.obj?.action;
    this.mapDocType = data?.obj.mapDocType;
    this.headerTitle = data?.obj.title;
    this.resourceTypeCode = data?.obj.resourceTypeCode;

    if (this.actionType === 'Edit') {
      this.documentInfo = data?.obj?.documentInfo;
      this.docPurposeCode = data?.obj?.docPurposeCode;
    }
  }

  ngOnInit(): void {
    this.agreeForm = this.fb.group({
      documentType: ['', [Validators.required]],
      documentInfo: [''],
      docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
    });

    if (this.actionType === 'Edit') {
      this.headerTitle =
        this.headerTitle + this.mapDocType.get(this.docPurposeCode);

      this.agreeForm.patchValue({
        documentType: this.docPurposeCode,
      });
      this.agreeForm?.controls?.documentType.disable();
      this.agreeForm.setControl(
        'docProperty',
        this.setDocumentProperty(this.documentInfo)
      );
      this.totalFiles = this.documentInfo.length;
    }
  }

  // tslint:disable-next-line: no-any
  uploadAgreementFiles(event: any): void {
    this.files = event.target.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt.includes(file.name.split('.')[1])
    );
    this.totalFiles = event.target.files.length;
    this.newFileAddedCount = this.totalFiles;

    if (this.totalFiles > 0) {
      if (this.actionType === 'Add') {
        this.agreeForm.setControl(
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
    return this.agreeForm.get('docProperty') as FormArray;
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
          this.totalFiles = this.totalFiles - 1;
        }
      }
    });
  }

  saveAgreement(): void {
    this.isLoading = true;
    this.documentTypeCode = this.agreeForm?.controls?.documentType?.value;

    if (this.totalFiles > 0) {
      for (let i = 0; i < this.totalFiles; i++) {
        if (this.files?.length > 0) {
          this.docAddFile.push(this.files[i]);
        }
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.docProperty.controls.length; i++) {
        if (this.docProperty.controls[i].get('documentId')?.value === '') {
          this.docAddId.push(
            this.docProperty.controls[i].get('documentId')?.value
          );
          this.docAddDisplayName.push(
            this.docProperty.controls[i].get('displayName')?.value === ''
              ? this.files[i].name.split('.')[0]
              : this.docProperty.controls[i].get('displayName')?.value
          );
          this.docAddFileDescription.push(
            this.docProperty.controls[i].get('fileDescription')?.value
          );
        } else {
          this.docUpdateId.push(
            this.docProperty.controls[i].get('documentId')?.value
          );
          this.docUpdateDisplayName.push(
            this.docProperty.controls[i].get('displayName')?.value === ''
              ? 'no-name'
              : this.docProperty.controls[i].get('displayName')?.value
          );
          this.docUpdateFileDescription.push(
            this.docProperty.controls[i].get('fileDescription')?.value === ''
              ? 'null'
              : this.docProperty.controls[i].get('fileDescription')?.value
          );
        }
      }
      this.genericProfileApiService
        .saveEmployeeOrCandidateDocuments(
          this.actionType,
          this.resourceValue,
          this.docDeleteId,
          this.documentTypeCode,
          this.newFileAddedCount,
          this.docAddFileDescription,
          this.docAddDisplayName,
          this.docAddFile,
          this.docUpdateId,
          this.docUpdateDisplayName,
          this.docUpdateFileDescription,
          this.resourceTypeCode
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
        InformationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.informationMessage =
        'Please upload the file to save document?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.isLoading = false;
        }
      });
    }
  }
}
