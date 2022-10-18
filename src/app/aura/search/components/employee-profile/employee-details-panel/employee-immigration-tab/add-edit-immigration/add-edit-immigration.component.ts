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
  MatDialogConfig,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { EmployeeProfileApiService } from '../../../../../../search/service/employee/employee-profile-api.service';
import { EmployeeImmigrationAddEditRecord } from '../../../../../../search/interface/employee-profile/employee-profile-immigration.interface';
import { DocumentInformation } from '../../../../../../../shared/interface/document-info.interface';
import { WorkAuthorizationDocumentMapResultResponse } from '../../../../../../../shared/interface/lookup.interface';
import { PreviewEadComponent } from '../../../../../../../shared/components/preview-ead/preview-ead.component';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-add-edit-immigration',
  templateUrl: './add-edit-immigration.component.html',
  styleUrls: ['./add-edit-immigration.component.scss'],
})
export class AddEditImmigrationComponent implements OnInit {
  immigrationForm!: FormGroup;
  personId = '';
  immigrationInfoId = '';
  fileCount = 0;
  newFileAddedCount = 0;
  docCount = 0;
  actionType = '';
  workAuthorizationText = '';
  workAuthorizationTypeCode = '';
  workAuthorizationNumber = '';
  workAuthorizationStartDate = '';
  workAuthorizationExpiryDate = '';
  eadCategoryCode!: number;
  eadCategory!: string;
  WorkAuthDocumentMapData!: WorkAuthorizationDocumentMapResultResponse;
  fileExt = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'pdf'];
  prevailingWage = '';
  isNewDocument = true;
  resourceTypeCode = '25';
  documentPurposeCode = '';
  isLoading = false;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  empImmigrationResult!: EmployeeImmigrationAddEditRecord;
  mapWorkAuth = new Map<number, string>();
  mapEADCategory = new Map<number, string>();
  mapEADCategoryCodes = new Map<number, string>();
  workAuthType!: number;
  headerText = '';
  errorMsg = '';
  showPrevilingWage = false;
  showEAD = false;
  showAthorizationType = false;
  fileDesc: string[] = [];
  files: File[] = [];
  docAddId: string[] = [];
  docAddDisplayName: string[] = [];
  docAddFileDescription: string[] = [];
  docAddFile: File[] = [];
  docUpdateId: string[] = [];
  docUpdateDisplayName: string[] = [];
  docUpdateFileDescription: string[] = [];
  docDeleteId: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<AddEditImmigrationComponent>,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private dialogConfirm: MatDialog,
    private matNotificationService: MatNotificationService,
    private employeeProfileApiService: EmployeeProfileApiService,
    // tslint:disable-next-line: no-any
    private dialogReference: MatDialogRef<any>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.empImmigrationResult = data?.obj?.immigrationData;
    this.personId = data?.obj?.personId;
    this.immigrationInfoId = data?.obj?.immigrationData?.immigrationInfoId;
    this.workAuthorizationText =
      data?.obj?.immigrationData?.workAuthorizationType;
    this.actionType = data?.obj?.action;
  }

  ngOnInit(): void {
    this.immigrationForm = this.fb.group({
      workAuthorizationType: ['', Validators.required],
      workAuthorizationNumber: [
        '',
        [Validators.required, Validators.pattern('[A-Za-z]{1}[0-9]{14}')],
      ],
      workAuthorizationStartDate: ['', Validators.required],
      workAuthorizationExpiryDate: [''],
      eadCategoryCode: [''],
      eadCategory: [''],
      prevailingWage: [
        '',
        [
          Validators.required,
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
          Validators.min(15000),
          Validators.max(30000),
        ],
      ],
      fileUpload: [''],
      docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
    });
    if (this.actionType === 'Add') {
      this.showAthorizationType = true;
    }
    if (this.actionType === 'Edit') {
      this.showAthorizationType = false;
    }
    this.isLoading = true;
    this.lookupService.getWorkAuthorizationTypeCode().subscribe(
      (data) => {
        for (const workAuth of data?.result) {
          this.mapWorkAuth.set(workAuth.lookupCode, workAuth.description);
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );

    this.lookupService.getWorkAuthorizationDocumentMap().subscribe(
      (data) => {
        this.WorkAuthDocumentMapData = data;
      },
      (error) => {}
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

    if (this.actionType === 'Add') {
      this.headerText = 'Add New';
    }
    if (this.actionType === 'Edit') {
      this.headerText = 'Edit ' + this.workAuthorizationText;
      // tslint:disable-next-line: radix
      this.workAuthType = this.empImmigrationResult?.workAuthorizationTypeCode;
      this.immigrationForm.patchValue({
        workAuthorizationType:
          this.empImmigrationResult?.workAuthorizationTypeCode,
        workAuthorizationNumber:
          this.empImmigrationResult?.workAuthorizationNumber,
        eadCategoryCode: this.empImmigrationResult?.eadCategoryCode,
        eadCategory: this.empImmigrationResult?.eadCategory,
        workAuthorizationStartDate:
          this.empImmigrationResult?.workAuthorizationStartDate?.split('T')[0],
        workAuthorizationExpiryDate:
          this.empImmigrationResult?.workAuthorizationExpiryDate?.split('T')[0],
      });

      this.immigrationForm.setControl(
        'docProperty',
        this.setDocumentProperty(
          // tslint:disable-next-line: no-non-null-assertion
          this.empImmigrationResult?.documents!
        )
      );
      if (this.workAuthType !== 8) {
        this.showPrevilingWage = false;
        this.immigrationForm?.controls?.prevailingWage.disable();
      } else {
        this.showPrevilingWage = true;
        this.immigrationForm?.controls?.prevailingWage.enable();
      }
      if (this.workAuthType === 2) {
        this.immigrationForm?.controls?.eadCategory.disable();
      }
      this.fileCount = Number(this.empImmigrationResult?.documents?.length);
    }
  }

  setDocumentProperty(documents: DocumentInformation[]): FormArray {
    const formArray = new FormArray([]);
    documents?.forEach((d) => {
      formArray.push(
        this.fb.group({
          documentId: d.documentId,
          displayName: [
            d.displayName.split('.')[0],
            [Validators.maxLength(30)],
          ],
          fileDescription: [
            d.fileDescription === 'null' ? '' : d.fileDescription,
            [Validators.maxLength(150)],
          ],
          fileExtension: d.fileExtension,
        })
      );
    });
    return formArray;
  }

  addDocPropertyFormGroup(): FormGroup {
    return this.fb.group({
      documentId: [''],
      displayName: ['', [Validators.maxLength(30)]],
      fileDescription: ['', [Validators.maxLength(150)]],
      fileExtension: [''],
    });
  }

  addDocProperty(file: File): FormGroup {
    return this.fb.group({
      documentId: [''],
      displayName: [file.name.split('.')[0], [Validators.maxLength(30)]],
      fileDescription: ['', [Validators.maxLength(150)]],
      fileExtension: ['.' + file.name.split('.')[1]],
    });
  }

  // tslint:disable-next-line: no-any
  preview(event: any): void {
    this.files = event.target.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt.includes(file.name.split('.')[1])
    );
    this.newFileAddedCount = this.files.length;
    if (this.newFileAddedCount > 0) {
      if (this.actionType === 'Add') {
        this.immigrationForm.setControl(
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

  setDocProperty(files: File[]): FormArray {
    const formArray = new FormArray([]);
    for (const file of files) {
      formArray.push(
        this.fb.group({
          documentId: '',
          displayName: [file.name.split('.')[0], [Validators.maxLength(30)]],
          fileDescription: ['', [Validators.maxLength(150)]],
          fileExtension: ['.' + file.name.split('.')[1]],
        })
      );
    }
    return formArray;
  }

  onSave(): void {
    // tslint:disable-next-line: radix
    this.workAuthType = parseInt(
      this.immigrationForm?.controls?.workAuthorizationType?.value
    );
    this.workAuthorizationTypeCode =
      this.immigrationForm?.controls?.workAuthorizationType?.value.toString();
    this.workAuthorizationNumber =
      this.immigrationForm?.controls?.workAuthorizationNumber?.value.toString();
    this.workAuthorizationStartDate =
      this.immigrationForm?.controls?.workAuthorizationStartDate?.value;
    this.workAuthorizationExpiryDate =
      this.immigrationForm?.controls?.workAuthorizationExpiryDate?.value;
    this.prevailingWage =
      this.immigrationForm?.controls?.prevailingWage?.value?.toString();
    this.eadCategoryCode =
      this.immigrationForm?.controls?.eadCategoryCode?.value?.toString();
    this.eadCategory = this.immigrationForm?.controls?.eadCategory?.value;
    this.getDcumentPurposeCode();
    if (this.fileCount > 0 || this.newFileAddedCount > 0) {
      for (const doc of this.docProperty.controls) {
        if (doc.get('documentId')?.value === '') {
          this.docAddId.push(doc.get('documentId')?.value);
          this.docAddDisplayName.push(
            doc.get('displayName')?.value.split('.')[0] === ''
              ? 'no-name'
              : doc.get('displayName')?.value.split('.')[0]
          );
          this.docAddFileDescription.push(doc.get('fileDescription')?.value);
        } else {
          this.docUpdateId.push(doc.get('documentId')?.value);
          this.docUpdateDisplayName.push(
            doc.get('displayName')?.value.split('.')[0] === ''
              ? 'no-name'
              : doc.get('displayName')?.value.split('.')[0]
          );
          this.docUpdateFileDescription.push(
            doc.get('fileDescription')?.value === ''
              ? 'null'
              : doc.get('fileDescription')?.value
          );
        }
      }
      for (let i = 0; i < this.newFileAddedCount; i++) {
        if (this.files[i]) {
          this.docAddFile.push(this.files[i]);
        }
      }
    }
    if (this.fileCount > 0 || this.newFileAddedCount > 0) {
      this.isLoading = true;
      this.employeeProfileApiService
        .uploadEmployeeImmigrationRecord(
          this.actionType,
          this.newFileAddedCount,
          this.personId,
          this.immigrationInfoId,
          this.workAuthorizationTypeCode,
          this.workAuthorizationNumber,
          this.workAuthorizationStartDate,
          this.workAuthorizationExpiryDate,
          this.prevailingWage,
          this.eadCategoryCode,
          this.eadCategory,
          this.documentPurposeCode,
          this.resourceTypeCode,
          this.isNewDocument,
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
          this.isLoading = true;
          this.employeeProfileApiService
            .uploadEmployeeImmigrationRecord(
              this.actionType,
              this.newFileAddedCount,
              this.personId,
              this.immigrationInfoId,
              this.workAuthorizationTypeCode,
              this.workAuthorizationNumber,
              this.workAuthorizationStartDate,
              this.workAuthorizationExpiryDate,
              this.prevailingWage,
              this.eadCategoryCode,
              this.eadCategory,
              this.documentPurposeCode,
              this.resourceTypeCode,
              this.isNewDocument,
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
                  ':: Information updated successfully'
                );
                this.dialogRef.close('success');
              },
              (error) => {
                this.errorMsg =
                  '*There is problem with the service. Please try again later';
                this.matNotificationService.warn(
                  ':: Unable to save successfully'
                );
                this.isLoading = false;
              }
            );
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
          this.fileCount = this.fileCount - 1;
        }
        this.docProperty?.removeAt(i);
        if (doc?.get('documentId')?.value === '') {
          this.newFileAddedCount = this.newFileAddedCount - 1;
        }
      }
    });
  }

  get docProperty(): FormArray {
    return this.immigrationForm.get('docProperty') as FormArray;
  }

  getSelectedValue(value: number): void {
    if (value === 8) {
      this.showPrevilingWage = true;
      this.immigrationForm?.controls?.prevailingWage.enable();
    } else {
      this.showPrevilingWage = false;
      this.immigrationForm?.controls?.prevailingWage.disable();
    }
    if (value === 2) {
      this.showEAD = true;
      this.immigrationForm?.controls?.eadCategoryCode.enable();
      this.immigrationForm?.controls?.eadCategory.disable();
    } else {
      this.showEAD = false;
      this.immigrationForm?.controls?.eadCategoryCode.disable();
      this.immigrationForm?.controls?.eadCategory.disable();
    }
  }

  getDcumentPurposeCode(): void {
    for (const rec of this.WorkAuthDocumentMapData?.result) {
      if (rec.workAuthorizationTypeCode === this.workAuthType) {
        this.documentPurposeCode = rec.documentPurposeCode.toString();
        break;
      }
    }
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

  openEADDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    this.dialogReference = this.dialogConfirm.open(
      PreviewEadComponent,
      dialogConfig
    );
  }

  chooseEAD(event: MatSelectChange): void {
    this.eadCategory = String(this.mapEADCategoryCodes.get(event?.value));
    this.immigrationForm?.controls?.eadCategory?.setValue(
      this.mapEADCategoryCodes.get(event?.value)
    );
    this.immigrationForm?.controls?.eadCategory?.disable();
  }
}
