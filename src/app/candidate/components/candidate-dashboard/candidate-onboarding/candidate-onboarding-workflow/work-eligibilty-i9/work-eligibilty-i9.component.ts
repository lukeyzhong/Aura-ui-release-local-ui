import { Component, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { DigitalSignatureComponent } from '../../../../../../shared/components/digital-signature/digital-signature.component';
import { CandidateOnboardingWorkEligibilityAndI9FormResult } from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { ActiveUserInfoService } from '../../../../../../core/service/active-user-info.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PersonInfoShare } from '../../../../../interface/dashboard/candidate-dashboard.interface';

@Component({
  selector: 'app-work-eligibilty-i9',
  templateUrl: './work-eligibilty-i9.component.html',
  styleUrls: ['./work-eligibilty-i9.component.scss'],
})
export class WorkEligibiltyI9Component implements OnInit {
  @Input() employeeOnboardingId = '';
  workEligibilityAndI9FormResult!: CandidateOnboardingWorkEligibilityAndI9FormResult;
  @Input() stepper!: MatStepper;
  signDate!: Date;
  previewI9 = true;
  citizenAlienAuthorized = false;
  citizenLawResident = false;
  preparer = false;
  i9Form!: FormGroup;
  docURL = '';
  signEmpStatus = false;
  candSignURL = '';
  signPreparerStatus = false;
  prepSignURL = '';
  errorMsg = '';
  usCitizen: boolean | null = false;
  mapState = new Map<string, string>();
  mapCountry = new Map<string, string>();
  isLoading = false;
  isLoadingI9Form = false;
  isLoadingState = false;
  candSignId!: string;
  prepSignId!: string;
  candSignFile!: File;
  prepSignFile!: File | null;
  userId!: string;
  candidateState!: string;
  isSignSaved = false;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();

  commentValue!: string;
  documentId!: string;

  piObj!: PersonInfoShare;
  ssn!: string;
  minDate!: string;
  maxDate!: string;

  alienRegNoOrUSCISNo!: string | null;
  foreignPassportNo!: string;
  countryOfIssuance!: string;
  i94AdmissionNo!: string;
  alienAuthExpiryDate!: string;
  hideTax = false;
  passportNumber = '';
  country = '';
  countryKey = '';

  constructor(
    private datepipe: DatePipe,
    private router: Router,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private activeUserInfo: ActiveUserInfoService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private matNotificationService: MatNotificationService,
    private documentsService: DocumentsService,
    private domSanitizer: DomSanitizer,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.activeUserInfo?.getActiveUserInfo()?.userId;
    this.signDate = new Date();
    this.candidateOnboardingWorkflowService
      .getHideTaxDetails()
      .subscribe((status) => {
        if (status) {
          this.hideTax = status;
        }
      });

    this.i9Form = this.fb.group({
      i9Id: [''],
      employeeOnboardingId: [''],
      employeeId: [''],
      candidateFilledLastName: [''],
      candidateFilledFirstName: [''],
      candidateFilledMiddleInitial: [''],
      candidateFilledOtherLastNames: [''],
      address: [''],
      unitOrApartmentNumber: [''],
      city: [''],
      state: [''],
      zip: [''],
      dateOfBirth: [''],
      ssn: [''],
      email: [''],
      phoneNumber: [''],
      preparerUsed: [''],
      preparerFirstName: ['', [Validators.pattern('[A-Za-z]{1,50}')]],
      preparerLastName: ['', Validators.pattern('[A-Za-z]{1,50}')],
      preparerAddress: ['', Validators.maxLength(200)],
      preparerCity: ['', Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      preparerState: [''],
      preparerZIPCode: ['', Validators.pattern('[0-9]{5}')],
      citizenshipStatusCode: [''],
      alienAuthorizedToWorkExpiryDate: ['', Validators.required],
      uscisNumber: [
        '',
        [Validators.required, Validators.pattern('[0-9]{9,14}')],
      ],
      i94Number: ['', [Validators.required, Validators.pattern('[0-9]{11}')]],
      foriegnPassportNumber: [
        '',
        [Validators.required, Validators.pattern('^[a-zA-Z]*[0-9]{4,12}$')],
      ],
      foriegnPassportIssuanceCountry: ['', Validators.required],
      candidateSignDocumentId: [''],
    });

    this.setCandidateWorkEligibilityAndI9FormInfo();
    this.setMinAndMaxForExpiryDate();

    this.candidateOnboardingWorkflowService.getPersInfo().subscribe((pi) => {
      if (pi?.piObj) {
        this.piObj = pi?.piObj;
        this.setCandidateWorkEligibilityAndI9FormInfo();
      }
    });
    this.candidateOnboardingWorkflowService
      .getPassportInfoDetails()
      .subscribe((passInfo) => {
        if (passInfo) {
          this.passportNumber = passInfo?.passportNumber;
          this.country = passInfo?.country;
        }
      });

    this.setStateCode();
    this.setCountryCode();
  }

  setStateCode(): void {
    this.isLoadingState = true;
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          this.mapState.set(state?.abbr, state?.description);
        }

        this.isLoadingState = false;
      },
      (error) => {
        this.isLoadingState = false;
        console.warn(error);
      }
    );
  }

  setCountryCode(): void {
    this.lookupService.getCountryCode().subscribe(
      (data) => {
        for (const country of data?.result) {
          this.mapCountry.set(country?.abbr, country?.description);
        }
      },
      (error) => {
        console.warn(error);
      }
    );
  }

  setCandidateWorkEligibilityAndI9FormInfo(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingWorkEligibilityAndI9Form(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.workEligibilityAndI9FormResult = data?.result;
            this.candidateState = String(
              this.mapState.get(this.workEligibilityAndI9FormResult?.state)
            );

            this.preparer = this.workEligibilityAndI9FormResult?.preparerUsed;
            this.citizenLawResident =
              this.workEligibilityAndI9FormResult?.citizenshipStatusCode === 67;
            this.citizenAlienAuthorized =
              this.workEligibilityAndI9FormResult?.citizenshipStatusCode === 68;

            if (
              this.workEligibilityAndI9FormResult?.candidateSignDocumentId &&
              this.workEligibilityAndI9FormResult?.candidateSignDocumentId !==
                null
            ) {
              this.candSignId =
                this.workEligibilityAndI9FormResult?.candidateSignDocumentId;
              this.setCandidateSignDocumentId(
                String(
                  this.workEligibilityAndI9FormResult?.candidateSignDocumentId
                )
              );
            } else {
              this.candSignURL = '';
            }

            this.candidateOnboardingWorkflowService
              .getPersInfo()
              .subscribe((pi) => {
                this.piObj = pi?.piObj;
              });

            this.candidateOnboardingWorkflowService
              .getSSN()
              .subscribe((ssnObj) => {
                this.ssn = ssnObj.ssn;
              });

            this.i9Form.patchValue({
              i9Id: this.workEligibilityAndI9FormResult?.i9Id,
              employeeOnboardingId:
                this.workEligibilityAndI9FormResult?.employeeOnboardingId,
              employeeId: this.workEligibilityAndI9FormResult?.employeeId,

              preparerUsed:
                this.workEligibilityAndI9FormResult?.preparerUsed === true
                  ? 'yes'
                  : 'no',
              preparerFirstName:
                this.workEligibilityAndI9FormResult?.preparerFirstName,
              preparerLastName:
                this.workEligibilityAndI9FormResult?.preparerLastName,
              preparerAddress:
                this.workEligibilityAndI9FormResult?.preparerAddress,
              preparerCity: this.workEligibilityAndI9FormResult?.preparerCity,
              preparerState: this.workEligibilityAndI9FormResult?.preparerState,
              preparerZIPCode:
                this.workEligibilityAndI9FormResult?.preparerZIPCode,

              citizenshipStatusCode:
                this.workEligibilityAndI9FormResult?.citizenshipStatusCode ===
                65
                  ? '65'
                  : this.workEligibilityAndI9FormResult
                      ?.citizenshipStatusCode === 66
                  ? '66'
                  : this.workEligibilityAndI9FormResult
                      ?.citizenshipStatusCode === 67
                  ? '67'
                  : this.workEligibilityAndI9FormResult
                      ?.citizenshipStatusCode === 68
                  ? '68'
                  : '',
              alienAuthorizedToWorkExpiryDate:
                this.workEligibilityAndI9FormResult
                  ?.alienAuthorizedToWorkExpiryDate,
              uscisNumber:
                this.workEligibilityAndI9FormResult?.uscisNumber?.substring(1),
              i94Number: this.workEligibilityAndI9FormResult?.i94Number,
              foriegnPassportNumber:
                this.workEligibilityAndI9FormResult?.foriegnPassportNumber,
              foriegnPassportIssuanceCountry:
                this.workEligibilityAndI9FormResult
                  ?.foriegnPassportIssuanceCountry,
            });
            this.isLoading = false;

            this.foreignPassportNo =
              this.workEligibilityAndI9FormResult?.foriegnPassportNumber;
            this.countryOfIssuance =
              this.workEligibilityAndI9FormResult?.foriegnPassportIssuanceCountry;

            this.selectCitizenOption(
              this.i9Form?.controls?.citizenshipStatusCode?.value
            );
            this.getComments();
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  setCandidateSignDocumentId(docId: string): void {
    if (docId) {
      this.documentsService.getDocumentFile(docId).subscribe(
        (data) => {
          // 92 means 401 err, 94 means no doc
          // if (data?.byteLength === 94 || data?.byteLength === 92) {
          //   this.candSignURL = './assets/images/default-pic.png';
          // } else {
          const file = new Blob([data], { type: 'image/*' });
          const fileURL = URL.createObjectURL(file);
          this.candSignURL = this.domSanitizer.bypassSecurityTrustUrl(
            fileURL
          ) as string;
          // }
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  parsePhoneNumberToShow(phoneNumber?: string): string {
    if (phoneNumber === undefined) {
      return '';
    } else if (phoneNumber) {
      phoneNumber =
        '(' +
        phoneNumber.substr(0, 3) +
        ')' +
        ' ' +
        phoneNumber.substr(3, 3) +
        '-' +
        phoneNumber.substr(6, 4);
    }
    return String(phoneNumber) === null ? '' : String(phoneNumber);
  }

  openSignatureDialog(signType: string): void {
    const dialogConfig = new MatDialogConfig();

    const obj = {
      employeeOnboardingId:
        this.workEligibilityAndI9FormResult?.candidateSignDocumentId,
      formType: 'I9Form',
      signType,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(DigitalSignatureComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((res) => {
      if (res?.status === 'success') {
        if (res?.signType === 'Employee') {
          this.signEmpStatus = true;
          this.candSignId = res?.docId;
          this.isSignSaved = res?.isSignSaved;
          this.candSignFile = res?.file;
          const reader = new FileReader();
          // tslint:disable-next-line: no-any
          reader.onload = (e: any) => {
            this.candSignURL = e?.target?.result;
          };
          reader.readAsDataURL(this.candSignFile);

          if (res?.docId === undefined && res?.isSignSaved) {
            this.saveSignatureAndGetNewSignId('Employee', this.candSignFile);
          }
        } else if (res?.signType === 'Preparer') {
          this.signPreparerStatus = true;
          this.prepSignId = res?.docId;
          this.prepSignFile = res?.file;

          const reader = new FileReader();
          // tslint:disable-next-line: no-any
          reader.onload = (e: any) => {
            this.prepSignURL = e?.target?.result;
          };
          reader.readAsDataURL(this.prepSignFile as File);
        }
      }
    });
  }
  saveSignatureAndGetNewSignId(signType: string, signfile: File): void {
    this.candidateOnboardingWorkflowService
      .saveSignature(this.userId, signfile)
      .subscribe(
        (data) => {
          switch (signType) {
            case 'Employee':
              this.candSignId = data?.result;
              break;
            case 'Preparer':
              this.prepSignId = data?.result;
              break;
          }

          this.matNotificationService.success(
            ':: Signature stored successfully'
          );
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  saveI9Form(): void {
    this.previewI9 = false;
    this.docURL = '';
    this.onSaveI9FormInfo();
  }

  onSaveI9FormInfo(): void {
    this.workEligibilityAndI9FormResult.preparerUsed = this.preparer;

    this.workEligibilityAndI9FormResult.candidateSignDocumentId =
      this.candSignId === undefined && this.isSignSaved
        ? null
        : this.candSignId;

    this.workEligibilityAndI9FormResult.ssn = this.ssn
      ? this.ssn
      : this.workEligibilityAndI9FormResult?.ssn;

    this.workEligibilityAndI9FormResult.i9Status = 'Step1Completed';
    this.workEligibilityAndI9FormResult.preparerFirstName =
      this.i9Form?.controls?.preparerFirstName?.value;
    this.workEligibilityAndI9FormResult.preparerLastName =
      this.i9Form?.controls?.preparerLastName?.value;
    this.workEligibilityAndI9FormResult.preparerAddress =
      this.i9Form?.controls?.preparerAddress?.value;
    this.workEligibilityAndI9FormResult.preparerCity =
      this.i9Form?.controls?.preparerCity?.value;
    this.workEligibilityAndI9FormResult.preparerState =
      this.i9Form?.controls?.preparerState?.value;
    this.workEligibilityAndI9FormResult.preparerZIPCode =
      this.i9Form?.controls?.preparerZIPCode?.value;
    this.workEligibilityAndI9FormResult.citizenshipStatusCode = Number(
      this.i9Form?.controls?.citizenshipStatusCode?.value
    );

    if (this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.value) {
      this.workEligibilityAndI9FormResult.alienAuthorizedToWorkExpiryDate =
        String(
          this.datepipe.transform(
            this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.value,
            'yyyy-MM-dd'
          )
        );
    }

    this.workEligibilityAndI9FormResult.uscisNumber =
      this.i9Form?.controls?.uscisNumber?.value === null ||
      this.i9Form?.controls?.uscisNumber?.value === ''
        ? null
        : 'A' + this.i9Form?.controls?.uscisNumber?.value;
    this.workEligibilityAndI9FormResult.i94Number =
      this.i9Form?.controls?.i94Number?.value;
    this.i9Form?.controls?.foriegnPassportNumber?.enable();
    this.workEligibilityAndI9FormResult.foriegnPassportNumber =
      this.i9Form?.controls?.foriegnPassportNumber?.value;

    this.i9Form?.controls?.foriegnPassportIssuanceCountry?.enable();
    this.workEligibilityAndI9FormResult.foriegnPassportIssuanceCountry =
      this.i9Form?.controls?.foriegnPassportIssuanceCountry?.value;

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingWorkEligibilityAndI9Form(
        this.workEligibilityAndI9FormResult
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: I9 Form Information details updated successfully'
          );

          this.i9Form.markAsPristine();
          this.docURL = '';
          this.generateI9Form();
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to update successfully');
          console.warn(error);
        }
      );
  }

  clearTaxFields(): void {
    this.i9Form?.controls?.uscisNumber?.setValue('');
    this.i9Form?.controls?.i94Number?.setValue('');
    this.i9Form?.controls?.foriegnPassportNumber?.setValue('');
    this.i9Form?.controls?.foriegnPassportIssuanceCountry?.setValue('');
    this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.setValue('');
  }
  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object.keys(object).find((key) => object[key] === value);
  }

  generateI9Form(): void {
    this.isLoadingI9Form = true;
    const webformTypeId = '1';
    this.candidateOnboardingWorkflowService
      .generateI9Form(
        webformTypeId,
        this.employeeOnboardingId,
        this.candSignFile,
        this.prepSignFile as File
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: I9 Form generated successfully'
          );

          this.documentId = String(data?.result?.documentId);

          this.docURL = `data:application/pdf;base64,${data?.result?.documentBytes}`;
          this.isLoadingI9Form = false;
          this.prepSignFile = null;
          this.candidateOnboardingWorkflowService.sendI9DocURL(this.docURL);
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to update I9 Form  successfully'
          );
          console.warn(error);
          this.isLoadingI9Form = false;
        }
      );
  }

  onPrevious(): void {
    this.previewI9 = true;
    if (this.hideTax) {
      this.stepper.selectedIndex = 2;
    } else {
      this.stepper.selectedIndex = 3;
    }
  }

  editI9Form(): void {
    this.previewI9 = true;
    this.setCandidateWorkEligibilityAndI9FormInfo();
  }

  selectPreparerOption(value: string): void {
    if (value === 'yes') {
      this.preparer = true;
    } else if (value === 'no') {
      this.preparer = false;
      this.prepSignURL = '';
      this.prepSignFile = null;
    }
  }

  selectCitizenOption(value: string): void {
    this.alienRegNoOrUSCISNo =
      this.workEligibilityAndI9FormResult?.uscisNumber?.substring(1) ===
        'undefined' ||
      this.workEligibilityAndI9FormResult?.uscisNumber === 'undefined' ||
      this.workEligibilityAndI9FormResult?.uscisNumber === undefined ||
      this.workEligibilityAndI9FormResult?.uscisNumber === null
        ? null
        : String(
            this.workEligibilityAndI9FormResult?.uscisNumber?.substring(1)
          );
    this.foreignPassportNo =
      this.workEligibilityAndI9FormResult?.foriegnPassportNumber;
    this.countryOfIssuance =
      this.workEligibilityAndI9FormResult?.foriegnPassportIssuanceCountry;
    this.i94AdmissionNo = this.workEligibilityAndI9FormResult?.i94Number;
    this.alienAuthExpiryDate =
      this.workEligibilityAndI9FormResult?.alienAuthorizedToWorkExpiryDate;

    switch (value) {
      case '65':
        this.usCitizen = true;
        this.citizenLawResident = false;
        this.citizenAlienAuthorized = false;
        this.clearTaxFields();
        this.i9Form?.controls?.uscisNumber?.setValue(null);

        this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.disable();
        this.i9Form?.controls?.i94Number?.disable();
        this.i9Form?.controls?.uscisNumber?.disable();
        this.i9Form?.controls?.foriegnPassportNumber?.disable();
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.disable();
        break;
      case '66':
        this.usCitizen = false;
        this.citizenLawResident = false;
        this.citizenAlienAuthorized = false;
        this.clearTaxFields();
        this.i9Form?.controls?.uscisNumber?.setValue(null);
        this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.disable();
        this.i9Form?.controls?.i94Number?.disable();
        this.i9Form?.controls?.uscisNumber?.disable();
        this.i9Form?.controls?.foriegnPassportNumber?.disable();
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.disable();
        break;
      case '67':
        this.citizenLawResident = true;
        this.citizenAlienAuthorized = false;
        this.usCitizen = null;
        this.clearTaxFields();
        this.i9Form?.controls?.uscisNumber?.setValue(this.alienRegNoOrUSCISNo);

        this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.disable();
        this.i9Form?.controls?.i94Number?.disable();
        this.i9Form?.controls?.uscisNumber?.enable();
        this.i9Form?.controls?.foriegnPassportNumber?.enable();
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.enable();

        for (const [k, v] of this.mapCountry) {
          if (v === this.country) {
            this.countryKey = k;
            break;
          }
        }

        this.i9Form?.controls?.foriegnPassportNumber?.setValue(
          this.foreignPassportNo ? this.foreignPassportNo : this.passportNumber
        );
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.setValue(
          this.countryOfIssuance ? this.countryOfIssuance : this.countryKey
        );
        this.i9Form?.controls?.foriegnPassportNumber?.disable();
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.disable();

        break;
      case '68':
        this.citizenAlienAuthorized = true;
        this.citizenLawResident = false;
        this.usCitizen = null;
        this.clearTaxFields();
        this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.enable();
        this.i9Form?.controls?.i94Number?.enable();
        this.i9Form?.controls?.uscisNumber?.enable();
        this.i9Form?.controls?.foriegnPassportNumber?.enable();
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.enable();

        this.i9Form?.controls?.uscisNumber?.setValue(this.alienRegNoOrUSCISNo);

        for (const [k, v] of this.mapCountry) {
          if (v === this.country) {
            this.countryKey = k;
            break;
          }
        }

        this.i9Form?.controls?.foriegnPassportNumber?.setValue(
          this.foreignPassportNo ? this.foreignPassportNo : this.passportNumber
        );
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.setValue(
          this.countryOfIssuance ? this.countryOfIssuance : this.countryKey
        );
        this.i9Form?.controls?.foriegnPassportNumber?.disable();
        this.i9Form?.controls?.foriegnPassportIssuanceCountry?.disable();

        this.i9Form?.controls?.i94Number?.setValue(this.i94AdmissionNo);
        this.i9Form?.controls?.alienAuthorizedToWorkExpiryDate?.setValue(
          this.alienAuthExpiryDate
        );

        if (this.i9Form?.controls?.uscisNumber?.value?.length > 0) {
          this.disableI94();
        }
        if (this.i9Form?.controls?.i94Number?.value?.length > 0) {
          this.disableUSCIS();
        }
    }
  }

  deleteSign(signType: string): void {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you wants to delete the signature?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (signType) {
          case 'Employee':
            this.workEligibilityAndI9FormResult.candidateSignDocumentId = null;
            this.candSignURL = '';
            break;
          case 'Preparer':
            this.prepSignURL = '';
            break;
        }
        this.matNotificationService.success(
          '::Selected signature deleted successfully.'
        );
      }
    });
  }

  getStateFullName(state?: string): string {
    return String(this.mapState.get(String(state)));
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result && data?.result !== '{}') {
            this.hrComments = JSON.parse(data?.result);
            this.hrCommentsMap = new Map(Object?.entries(this.hrComments));
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  showHRComment(key: string): void {
    Object?.entries(this.hrComments)?.forEach((comments) => {
      if (comments[0] === key) {
        this.commentValue = comments[1];
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }

  setMinAndMaxForExpiryDate(): void {
    const currentDate = new Date();
    this.minDate = new Date().toISOString().slice(0, 10);

    const next10Years = currentDate.getFullYear() + 10;
    currentDate.setFullYear(next10Years);
    this.maxDate = currentDate.toISOString().slice(0, 10);
  }

  disableI94(): void {
    if (this.i9Form?.controls?.uscisNumber?.value?.length > 0) {
      this.i9Form?.controls?.i94Number?.disable();
      this.i9Form?.controls?.uscisNumber?.enable();
    } else {
      this.i9Form?.controls?.i94Number?.enable();
      this.i9Form?.controls?.uscisNumber?.enable();
    }
  }

  disableUSCIS(): void {
    if (this.i9Form?.controls?.i94Number?.value?.length > 0) {
      this.i9Form?.controls?.i94Number?.enable();
      this.i9Form?.controls?.uscisNumber?.disable();
    } else {
      this.i9Form?.controls?.i94Number?.enable();
      this.i9Form?.controls?.uscisNumber?.enable();
    }
  }
}
