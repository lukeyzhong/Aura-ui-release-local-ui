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
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { FoundInList } from '../../../../../shared/custom-validators/custom-validator-foundinlist';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import {
  CertificationAddEditRecord,
  CertificationResult,
} from '../../../interface/certification.interface';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DatePipe } from '@angular/common';
import { DateValidator } from '../../../../../shared/custom-validators/custom-validator-date';
import { GlobalVariables } from '../../../../../shared/enums/global-variables.enum';

@Component({
  selector: 'app-add-edit-certification',
  templateUrl: './add-edit-certification.component.html',
  styleUrls: ['./add-edit-certification.component.scss'],
})
export class AddEditCertificationComponent
  extends DocumentUploadInfo
  implements OnInit
{
  certificateForm!: FormGroup;
  certificateResult!: CertificationAddEditRecord;
  certificationId = '';

  addCertificateDoc!: CertificationResult;

  mapCertificationAgencyName = new Map<string, string>();
  mapCertificationAgency = new Map<string, string>();
  certifyingAgency!: FormControl;
  hideDomain = false;
  mapCertificationStatus = new Map<number, string>();
  isDomain = false;
  issueDateIsBig = false;

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
    this.certificateResult = data?.obj?.certificationData;
    this.personId = data?.obj?.personId;
    this.certificationId = data?.obj?.certificationData?.certificationId;
    this.actionType = data?.obj?.action;
    this.mapCertificationAgency = data?.obj?.mapCertificationAgency;

    this.addCertificateDoc = {
      personId: '',
      certificateSerialNumber: '',
      certificationName: '',
      certificationCode: '',
      certifyingAgencyId: '',
      certificationStatusCode: 0,
      issuedDate: '',
      expiryDate: '',
      isNewDocument: true,
      resourceTypeCode: 38,
      documentPurposeCode: 54,
    };
  }
  ngOnInit(): void {
    this.certificateForm = this.fb.group(
      {
        certificationName: [
          '',
          [Validators.required, Validators.pattern('^[a-zA-Z-. ]+$')],
        ],
        certificationCode: ['', Validators.pattern('^[a-zA-Z0-9- ]+$')],
        certificateSerialNumber: ['', Validators.pattern('[a-zA-Z0-9]{0,15}')],
        certificationStatus: ['', [Validators.required]],
        certifyingAgencyDomain: [
          '',
          [
            Validators.pattern(
              '((http|https|ftp|www)?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'
            ),
          ],
        ],
        issuedDate: [''],
        expiryDate: [''],
        documentInfo: [''],
        docProperty: this.fb.array([this.addDocPropertyFormGroup()]),
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

    this.certifyingAgency = new FormControl(
      '',
      FoundInList.isFoundInList(this.mapCertificationAgency)
    );
    if (this.certifyingAgency.value === '') {
      this.certifyingAgency.setValue(null);
    } else {
      this.certifyingAgency.setValue(this.certifyingAgency.value);
    }
    this.certifyingAgency.valueChanges
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if (searchString !== null && (searchString as string).length >= 2) {
          if (searchString !== '') {
            this.lookupService
              .getCertificationAgencyByOrgName(searchString)
              .subscribe(
                (data) => {
                  this.mapCertificationAgencyName = data?.result;
                },
                (err) => {
                  console.warn(err);
                }
              );
          }
        }
      });

    this.isLoading = true;
    this.lookupService.getCertificationStatus().subscribe((data) => {
      for (const certStatus of data?.result) {
        this.mapCertificationStatus.set(
          certStatus?.lookupCode,
          certStatus?.description
        );
      }
      this.isLoading = false;
    });

    if (this.actionType === 'Add') {
      this.headerTitle = 'Certificate';
    }
    if (this.actionType === 'Edit') {
      this.headerTitle = 'Edit Certificate';

      this.certificateForm.patchValue({
        certificationName: this.certificateResult?.certificationName.trim(),
        certificationCode:
          this.certificateResult?.certificationCode === 'null'
            ? ''
            : this.certificateResult?.certificationCode,
        certificateSerialNumber:
          this.certificateResult?.certificateSerialNumber === 'null'
            ? ''
            : this.certificateResult?.certificateSerialNumber,
        certificationStatus: this.certificateResult?.certificationStatusCode,
        issuedDate:
          this.certificateResult?.issuedDate?.split('T')[0] === undefined
            ? ''
            : this.certificateResult?.issuedDate?.split('T')[0],
        expiryDate:
          this.certificateResult?.expiryDate?.split('T')[0] === undefined
            ? ''
            : this.certificateResult?.expiryDate?.split('T')[0],
        certifyingAgencyDomain: this.certificateResult?.certifyingAgencyDomain,
      });
      this.certifyingAgency.setValue(this.certificateResult?.certifyingAgency);

      this.certificateForm.setControl(
        'docProperty',
        this.setDocumentProperty(
          // tslint:disable-next-line: no-non-null-assertion
          this.certificateResult?.documents!
        )
      );
      this.totalFiles = this.certificateResult?.documents?.length as number;
    }

    this.setMaxDate();
  }

  setMaxDate(): void {
    this.issueMaxDate = new Date().toISOString().slice(0, 10);

    const expiryCurrentMaxDate = new Date();
    const next5Years = expiryCurrentMaxDate?.getFullYear() + 5;
    expiryCurrentMaxDate?.setFullYear(next5Years);
    this.endMaxDate = expiryCurrentMaxDate?.toISOString().slice(0, 10);
  }

  get docProperty(): FormArray {
    return this.certificateForm?.get('docProperty') as FormArray;
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
        this.certificateForm.setControl(
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

  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object?.keys(object)?.find((key) => object[key] === value);
  }
  saveCertificate(): void {
    this.isLoading = true;
    this.addCertificateDoc.personId = this.personId;

    this.addCertificateDoc.certificationStatusCode =
      this.certificateForm?.controls?.certificationStatus?.value;
    this.addCertificateDoc.certificationStatus = String(
      this.mapCertificationStatus?.get(
        this.addCertificateDoc?.certificationStatusCode
      )
    );

    this.addCertificateDoc.certificationName =
      this.certificateForm?.controls?.certificationName?.value.trim();

    this.addCertificateDoc.certificationCode =
      this.certificateForm?.controls?.certificationCode?.value;

    this.addCertificateDoc.certifyingAgencyId =
      this.getKeyByValue(
        this.mapCertificationAgencyName,
        this.certifyingAgency?.value
      ) === undefined
        ? ''
        : this.getKeyByValue(
            this.mapCertificationAgencyName,
            this.certifyingAgency?.value
          );

    this.addCertificateDoc.issuedDate = String(
      this.datepipe.transform(
        this.certificateForm?.controls?.issuedDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.addCertificateDoc.expiryDate = String(
      this.datepipe.transform(
        this.certificateForm?.controls?.expiryDate?.value,
        'yyyy-MM-dd'
      )
    );

    this.addCertificateDoc.certificateSerialNumber =
      this.certificateForm?.controls?.certificateSerialNumber?.value;

    this.addCertificateDoc.certificationId =
      this.certificateResult?.certificationId;

    if (
      this.certifyingAgency?.value !== null &&
      this.getKeyByValue(
        this.mapCertificationAgencyName,
        this.certifyingAgency?.value
      ) === undefined
    ) {
      this.hideDomain = false;
      this.addCertificateDoc.certifyingAgencyId = GlobalVariables.DefaultGUID;
      this.addCertificateDoc.certifyingAgency =
        this.certifyingAgency?.value.trim();

      if (
        this.certificateForm?.controls?.certifyingAgencyDomain?.value.trim() ===
        ''
      ) {
        this.addCertificateDoc.certifyingAgencyDomain = `http://${this.addCertificateDoc.certifyingAgency?.toLowerCase()}.com`;
      } else {
        this.addCertificateDoc.certifyingAgencyDomain =
          this.certificateForm?.controls?.certifyingAgencyDomain?.value.trim();
      }
    }
    if (this.totalFiles > 0) {
      for (let i = 0; i < this.totalFiles; i++) {
        if (this.files?.length > 0) {
          this.docAddFile?.push(this.files[i]);
        }
      }

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.docProperty.controls.length; i++) {
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
              : this.docProperty?.controls[i].get('fileDescription')?.value
          );
        }
      }
      this.saveCertificateDetails();
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
          this.saveCertificateDetails();
        } else {
          this.isLoading = false;
        }
      });
    }
  }
  saveCertificateDetails(): void {
    this.genericProfileApiService
      .saveCertificationDocuments(
        this.actionType,
        this.addCertificateDoc,
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
          if (data?.errorCode === 32) {
            this.matNotificationService.warn(
              ':: Duplicate Certificates cannot be added'
            );
          } else {
            this.matNotificationService.success(
              ':: Information stored successfully'
            );
          }
          this.isLoading = false;
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

  showDomainField(): void {
    this.hideDomain = !this.hideDomain;
    this.isDomain = this.hideDomain ? true : false;
  }
  optionSelected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;
    if (
      this.getKeyByValue(this.mapCertificationAgencyName, value) === undefined
    ) {
      this.hideDomain = true;
    } else {
      this.hideDomain = false;
    }
  }

  checkForValidExpiryDate(issuedDate: string, expiryDate: string): void {
    if (new Date(issuedDate) > new Date(expiryDate)) {
      this.issueDateIsBig = true;
    } else {
      this.issueDateIsBig = false;
    }
  }
}
