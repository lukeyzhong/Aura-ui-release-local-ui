import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
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
import { debounceTime } from 'rxjs/operators';
import {
  EducationAddEditRecord,
  EducationResult,
} from '../../../interface/education.interface';
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FoundInList } from '../../../../../shared/custom-validators/custom-validator-foundinlist';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { DatePipe } from '@angular/common';
import { DateValidator } from '../../../../../shared/custom-validators/custom-validator-date';

@Component({
  selector: 'app-add-edit-education',
  templateUrl: './add-edit-education.component.html',
  styleUrls: ['./add-edit-education.component.scss'],
})
export class AddEditEducationComponent
  extends DocumentUploadInfo
  implements OnInit
{
  educationForm!: FormGroup;
  educationResult!: EducationAddEditRecord;
  educationInfoId = '';

  mapCountry = new Map<number, string>();
  mapDegree = new Map<number, string>();
  // major
  mapMajorType = new Map<string, string>();
  mapMajor = new Map<string, string>();
  majorType!: FormControl;

  mapMajorType1 = new Map<string, string>();
  mapMajor1 = new Map<string, string>();
  majorType1!: FormControl;

  mapUniversityName = new Map<string, string>();
  mapUniversity = new Map<string, string>();
  universityName!: FormControl;

  addEducationDoc!: EducationResult;
  startDateIsBig = false;

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
    this.educationResult = data?.obj?.educationData;
    this.personId = data?.obj?.personId;
    this.educationInfoId = data?.obj?.educationData?.educationInfoId;
    this.actionType = data?.obj?.action;
    this.mapUniversity = data?.obj?.mapUniversity;
    this.mapMajor = data?.obj?.mapMajor;
    this.mapMajor1 = data?.obj?.mapMajor1;

    this.addEducationDoc = {
      personId: '',
      degreeTypeCode: 0,
      universityId: '',
      startDate: '',
      endDate: '',
      highestDegreeFlag: false,
      stemFlag: false,
      majorTypeCode: 0,
      majorTypeCode1: '',
      isNewDocument: true,
      resourceTypeCode: 35,
      documentPurposeCode: 45,
    };
  }

  ngOnInit(): void {
    this.educationForm = this.fb.group(
      {
        degreeName: ['', [Validators.required]],
        startDate: ['', [Validators.required]],
        endDate: ['', [Validators.required]],
        stemFlag: [''],
        documentInfo: [''],
        docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
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

    this.universityName = new FormControl('', [
      Validators.required,
      FoundInList.isFoundInList(this.mapUniversity),
    ]);
    this.universityName.setValue(this.universityName.value);
    this.universityName.valueChanges
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if ((searchString as string).length >= 2) {
          if (searchString !== '') {
            this.lookupService.getUniversityByName(searchString).subscribe(
              (data) => {
                this.mapUniversityName = data?.result;
              },
              (err) => {
                console.warn(err);
              }
            );
          }
        }
      });

    this.majorType = new FormControl('', [
      Validators.required,
      FoundInList.isFoundInList(this.mapMajor),
    ]);
    this.majorType.setValue(this.majorType.value);
    this.majorType.valueChanges
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if (searchString !== '') {
          this.lookupService.getMajorByCode(searchString).subscribe(
            (data) => {
              this.mapMajorType = data?.result;
            },
            (err) => {
              console.warn(err);
            }
          );
        }
      });

    this.majorType1 = new FormControl('');
    this.majorType1.setValue(this.majorType1.value);
    this.majorType1.valueChanges
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if (searchString !== '') {
          this.lookupService.getMajorByCode(searchString).subscribe(
            (data) => {
              this.mapMajorType1 = data?.result;
            },
            (err) => {
              console.warn(err);
            }
          );
        }
      });

    this.isLoading = true;
    this.lookupService.getDegreeCode().subscribe((data) => {
      for (const degree of data?.result) {
        this.mapDegree.set(degree?.lookupCode, degree?.description);
      }
      this.isLoading = false;
    });
    this.lookupService.getCountryCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapCountry.set(country?.lookupCode, country?.description);
      }
    });
    if (this.actionType === 'Add') {
      this.headerTitle = 'Education Information';
    }
    if (this.actionType === 'Edit') {
      this.headerTitle = 'Edit Education Information';

      this.educationForm.patchValue({
        degreeName: this.educationResult?.degreeTypeCode,
        startDate: this.educationResult?.startDate?.split('T')[0],
        endDate: this.educationResult?.endDate?.split('T')[0],
        stemFlag: this.educationResult?.stemFlag,
      });
      this.universityName.setValue(this.educationResult?.universityName);

      this.majorType.setValue(this.educationResult?.majorType?.trim());

      this.majorType1.setValue(this.educationResult?.majorType1?.trim());

      this.educationForm.setControl(
        'docProperty',
        this.setDocumentProperty(
          // tslint:disable-next-line: no-non-null-assertion
          this.educationResult?.documents!
        )
      );
      this.totalFiles = this.educationResult?.documents?.length as number;
    }

    this.setMaxDate();
  }

  setMaxDate(): void {
    this.issueMaxDate = new Date().toISOString().slice(0, 10);

    const expiryCurrentMaxDate = new Date();
    const next2Years = expiryCurrentMaxDate?.getFullYear() + 2;
    expiryCurrentMaxDate.setFullYear(next2Years);
    this.endMaxDate = expiryCurrentMaxDate?.toISOString()?.slice(0, 10);
  }

  get docProperty(): FormArray {
    return this.educationForm?.get('docProperty') as FormArray;
  }

  // tslint:disable-next-line: no-any
  uploadfiles(event: any): void {
    this.files = event?.target?.files;
    this.files = Array.from(this.files).filter((file) =>
      this.fileExt?.includes(file?.name?.split('.')[1])
    );
    this.totalFiles = event?.target?.files?.length;
    this.newFileAddedCount = this.totalFiles;

    if (this.totalFiles > 0) {
      if (this.actionType === 'Add') {
        this.educationForm.setControl(
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
  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object?.keys(object)?.find((key) => object[key] === value);
  }
  saveEducation(): void {
    this.isLoading = true;
    this.addEducationDoc.personId = this.personId;

    this.addEducationDoc.degreeTypeCode =
      this.educationForm?.controls?.degreeName?.value;
    this.addEducationDoc.universityId = this.getKeyByValue(
      this.mapUniversityName,
      this.universityName?.value
    );

    this.addEducationDoc.startDate = String(
      this.datepipe.transform(
        this.educationForm?.controls?.startDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.addEducationDoc.endDate = String(
      this.datepipe.transform(
        this.educationForm?.controls?.endDate?.value,
        'yyyy-MM-dd'
      )
    );

    this.addEducationDoc.highestDegreeFlag = false;

    this.addEducationDoc.stemFlag =
      this.educationForm?.controls?.stemFlag?.value;

    this.addEducationDoc.majorTypeCode = this.getKeyByValue(
      this.mapMajorType,
      this.majorType?.value
    );
    if (
      this.getKeyByValue(this.mapMajorType1, this.majorType1?.value) ===
        undefined ||
      this.getKeyByValue(this.mapMajorType1, this.majorType1?.value) === ''
    ) {
      this.addEducationDoc.majorTypeCode1 = '';
    } else {
      this.addEducationDoc.majorTypeCode1 = this.getKeyByValue(
        this.mapMajorType1,
        this.majorType1?.value
      );
    }

    this.addEducationDoc.isNewDocument = true;
    this.addEducationDoc.educationInfoId =
      this.educationResult?.educationInfoId;

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
        .saveEducationDocuments(
          this.actionType,
          this.addEducationDoc,
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
            .saveEducationDocuments(
              this.actionType,
              this.addEducationDoc,
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

  checkForValidEndDate(startDate: string, endDate: string): void {
    if (new Date(startDate) > new Date(endDate)) {
      this.startDateIsBig = true;
    } else {
      this.startDateIsBig = false;
    }
  }
}
