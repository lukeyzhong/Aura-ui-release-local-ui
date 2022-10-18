import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CandidateOnboardingWorkflowService } from '../../service/candidate-workflow/candidate-onboarding-workflow.service';
import { DocumentUploadInfo } from '../../abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { PreviewWithoutUploadComponent } from '../preview-without-upload/preview-without-upload.component';

@Component({
  selector: 'app-upload-documents',
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.scss'],
})
export class UploadDocumentsComponent
  extends DocumentUploadInfo
  implements OnInit
{
  uploadForm!: FormGroup;
  entityType!: string;
  totalFiles = 0;
  id!: string;
  formName = '';
  employeeOnboardingId = '';
  uploadedfileNames: File[] = [];
  // tslint:disable-next-line: no-any
  docURL!: any;
  filesSizeBytes = 0;
  fileSizeMB = 0;

  constructor(private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
              // tslint:disable-next-line: no-any
              @Inject(MAT_DIALOG_DATA) data: any,
              // tslint:disable-next-line: no-any
              dialogRef: MatDialogRef<any>,
              dialogConfirm: MatDialog,
              fb: FormBuilder,
              private dialog: MatDialog,
              private dialogRefPreview: MatDialogRef<PreviewWithoutUploadComponent>,
  ) {
    super(dialogRef, dialogConfirm, fb);
    this.entityType = data?.obj?.entityType;
    this.personId = data?.obj?.personId;
    this.id = data?.obj?.id;

    // HR Verify I9 Form
    this.employeeOnboardingId = data?.obj?.employeeOnboardingId;
    this.formName = data?.obj?.type;
  }

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      documentInfo: [''],
      docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
    });
  }

  // tslint:disable-next-line: no-any
  uploadFiles(event: any): void {
    this.files = event.target.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt?.includes(file?.name?.split('.')[1])
    );
    this.totalFiles = event?.target?.files?.length;
    this.newFileAddedCount = this.totalFiles;

    if (this.totalFiles > 0) {
      this.uploadForm.setControl(
        'docProperty',
        this.setDocProperty(this.files)
      );
    }
  }

  get docProperty(): FormArray {
    return this.uploadForm?.get('docProperty') as FormArray;
  }

  saveDocuments(): void {
    this.isLoading = true;

    const uploadFileList = [];
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
          const uploadFile = {
            file: this.docAddFile[i],
            id: this.docProperty?.controls[i]?.get('documentId')?.value,
            displayName:
              this.docProperty?.controls[i]?.get('displayName')?.value === ''
                ? this.files[i]?.name?.split('.')[0]
                : this.docProperty?.controls[i]?.get('displayName')?.value,
            fileDescription:
              this.docProperty?.controls[i]?.get('fileDescription')?.value,
            status: true,
          };
          uploadFileList.push(uploadFile);
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

      this.dialogRef.close({
        id: this.id,
        status: 'success',
        entityType: this.entityType,
        uploadFileList,
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

  // HR Verify I-9 Form: Start
  // tslint:disable-next-line: no-any
  uploadPassportFiles(event: any): void {
    this.files = event?.target?.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt?.includes(file?.name?.split('.')[1])
    );
    this.totalFiles = event?.target?.files?.length;
    if (this.totalFiles > 0) {
    if (this.uploadedfileNames?.length < 2){
       // tslint:disable-next-line: prefer-for-of
       for ( let i = 0; i < this.files?.length; i++){
       this.uploadedfileNames.push(this.files[i]);
      }
    }
    }
}

  deleteUploadedPassport(i: number): void {
    this.uploadedfileNames.splice(i, 1);
  }

  saveUploadedPassportDocs(): void{
    this.isLoading = true;
     // tslint:disable-next-line: prefer-for-of
    for (let k = 0; k < this.uploadedfileNames.length; k++ ){
      this.filesSizeBytes = this.filesSizeBytes + this.uploadedfileNames[k].size;
    }
    this.fileSizeMB = this.filesSizeBytes / 1048576;

    if (this.fileSizeMB <= 5){
    this.candidateOnboardingWorkflowService.saveUploadedPassportDocs(this.employeeOnboardingId,
      this.uploadedfileNames[0], this.uploadedfileNames[1]).subscribe(
      (data) => {
        this.errorMsg = '';
        this.isLoading = false;
        this.dialogRef.close({
          errorCode: data?.errorCode,
          errorMessage: data?.errorMessage,
          case_status: data?.result?.case_status,
          case_eligibility_statement: data?.result?.case_eligibility_statement,
        });
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
    }
    else{
      this.isLoading = false;
      this.errorMsg = 'files size should not be greater than 5 MB';
    }
  }

  previewDocsBeforeUpload(file: File): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      docFile: file,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRefPreview = this.dialog.open(
      PreviewWithoutUploadComponent,
      dialogConfig
    );
  }
 // HR Verify I-9 Form: End
}
