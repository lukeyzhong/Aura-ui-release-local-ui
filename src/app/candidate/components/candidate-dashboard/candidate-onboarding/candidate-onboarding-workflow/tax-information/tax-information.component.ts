import { Component, Input, OnInit } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  CandidateOnboardingTaxInformationResult,
  ClaimDependents,
  FilingStatus,
  GenerateW4,
  MultipleJobs,
  OtherAdjustments,
  ResourceDocuments,
  StateTax,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { DigitalSignatureComponent } from '../../../../../../shared/components/digital-signature/digital-signature.component';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { ActiveUserInfoService } from '../../../../../../core/service/active-user-info.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { MatSelectChange } from '@angular/material/select';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { Router } from '@angular/router';
import { PersonInfoShare } from '../../../../../interface/dashboard/candidate-dashboard.interface';

@Component({
  selector: 'app-tax-information',
  templateUrl: './tax-information.component.html',
  styleUrls: ['./tax-information.component.scss'],
})
export class TaxInformationComponent implements OnInit {
  @Input() stepper!: MatStepper;
  @Input() employeeOnboardingId = '';
  taxInformationId!: string;
  taxInformationResult!: CandidateOnboardingTaxInformationResult;
  isLoading = false;
  isLoadingFederalTax = false;
  mapState = new Map<number, string>();
  mapCountry = new Map<number, string>();
  selectedIndex = 0;
  taxInfoForm!: FormGroup;
  mapFederalFilingStatusCode = new Map<number, string>();
  showStep4B = false;

  onlyUseTwoJobs = false;
  isMultipleJobsOrSpouseWorks = false;

  isUseMultipleJobsChecked = false;
  candSignId!: string;
  candSignURL = '';
  candSignFile!: File;
  signEmpStatus = false;
  docURL = '';
  isSignSaved!: boolean;
  signDate!: Date;
  userId!: string;
  errorMsg = '';
  federalTaxWithHoldingFormsList: ResourceDocuments[] = [];
  stateTaxWithHoldingFormsList: ResourceDocuments[] = [];

  stateTax = false;
  totalChildrenClaimAmt = 0;
  totalDependentsClaimAmt = 0;
  totalClaimAmt = 0;

  taxFormsUpdated: number[] = [];
  currentTaxFormIndex = 0;
  taxFormsList = ['Federal Tax Withholding', 'State Tax Withholding'];

  filingStatus!: FilingStatus;
  multipleJobs!: MultipleJobs;
  claimDependents!: ClaimDependents;
  otherAdjustments!: OtherAdjustments;
  generateW4!: GenerateW4;
  stateTaxDetails!: StateTax;
  ssn!: string;
  piObj!: PersonInfoShare;
  taxFilingStatus!: string;
  disableStep1NextBtn = true;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private activeUserInfo: ActiveUserInfoService,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private documentsService: DocumentsService,
    private domSanitizer: DomSanitizer,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.activeUserInfo?.getActiveUserInfo()?.userId;
    this.signDate = new Date();
    this.taxInfoForm = this.fb.group({
      federalFilingStatus: ['', Validators.required],
      federalTaxStep2RadioBtnAction: [''],
      estimateWithIRS: [''],
      useMultipleJobWorkSheet: [''],
      onlyUseTwoJobs: [''],
      multipleJobs: [''],
      twoJobsAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      threeJobsAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      threeJobs2aAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      threeJobs2bAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      threeJobs2cAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      numberOfPayPeriods: ['', Validators.pattern(/^\d*\.?\d*$/)],
      amountPerPayPeriod: ['', Validators.pattern(/^\d*\.?\d*$/)],
      numberOfChildren: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      numberOfDependents: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      childrenClaimAmount: [''],
      dependentClaimAmount: [''],
      totalClaimAmount: [''],
      otherIncome: ['', Validators.pattern(/^\d*\.?\d*$/)],
      hasDeductions: [''],
      numberOfDeductions: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      deductionAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      deduction1Amount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      deduction2Amount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      deductionDifferenceAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      adjustmentAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      totalDeductionAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],
      additionalTaxAmount: ['', Validators.pattern(/^\d*\.?\d*$/)],

      // state & locality tax
      stateFilingstatus: [''],
      workedState: [''],
      exemptionInWorkedState: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      livedInState: [''],
      exemptionsInLivedInState: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      totalExemptionsForAgeOrBlind: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      stateAdditionalTaxAmount: ['', [Validators.pattern(/^\d*\.?\d*$/)]],

      workedinCity: ['', Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      exemptionsInWorkedCity: [
        '',
        [
          Validators.pattern('[0-9]{0,10}'),
          Validators.min(0),
          Validators.max(10),
        ],
      ],
      livedInCity: ['', Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
    });

    this.filingStatus = Object.assign({}, this.filingStatus);
    this.multipleJobs = Object.assign({}, this.multipleJobs);
    this.claimDependents = Object.assign({}, this.claimDependents);
    this.otherAdjustments = Object.assign({}, this.otherAdjustments);
    this.generateW4 = Object.assign({}, this.generateW4);
    this.stateTaxDetails = Object.assign({}, this.stateTaxDetails);

    this.setTaxInformation();
  }
  setThirdPartyLookupCodes(): void {
    this.lookupService.getThirdPartyLookupCodes('FilingStatus').subscribe(
      (data) => {
        for (const filingStatus of data?.result) {
          this.mapFederalFilingStatusCode.set(
            filingStatus?.thirdPartyLookupCode,
            filingStatus?.name
          );
        }
      },
      (error) => {
        console.warn(error);
      }
    );
  }
  setTaxInformation(): void {
    this.setThirdPartyLookupCodes();
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingTaxInformation(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.taxInformationResult = data?.result;
            if (this.taxInformationResult?.taxInformationId) {
              this.taxInformationId = String(
                this.taxInformationResult?.taxInformationId
              );
            }
            if (
              this.taxInformationResult?.federalFilingStatus === null ||
              this.taxInfoForm?.controls?.federalFilingStatus?.value === 0
            ) {
              this.disableStep1NextBtn = true;
            } else {
              this.disableStep1NextBtn = false;
            }
            this.candidateOnboardingWorkflowService
              .getSSN()
              .subscribe((ssnObj) => {
                this.ssn = ssnObj.ssn;
              });

            this.candidateOnboardingWorkflowService
              .getPersInfo()
              .subscribe((pi) => {
                this.piObj = pi?.piObj;
              });

            const formsList = this.taxInformationResult?.resourceDocuments;
            if (formsList) {
              this.federalTaxWithHoldingFormsList = formsList?.filter(
                (forms) => forms?.isFederalForm === true
              );
              this.stateTaxWithHoldingFormsList = formsList?.filter(
                (forms) => forms?.isFederalForm === false
              );
            }
            if (this.taxInformationResult?.candidateSignatureId) {
              this.setCandidateSignDocumentId(
                String(this.taxInformationResult?.candidateSignatureId)
              );
            }

            this.isMultipleJobsOrSpouseWorks =
              this.taxInformationResult?.onlyUseTwoJobs === true ||
              this.taxInformationResult?.multipleJobs
                ? true
                : false;
            this.showStep4B = this.taxInformationResult?.hasDeductions
              ? true
              : false;
            this.isUseMultipleJobsChecked = this.taxInformationResult
              ?.useMultipleJobWorkSheet
              ? true
              : false;

            this.totalChildrenClaimAmt = this.taxInformationResult
              ?.numberOfChildren
              ? 2000 * this.taxInformationResult?.numberOfChildren
              : this.taxInformationResult?.childrenClaimAmount;

            this.totalDependentsClaimAmt = this.taxInformationResult
              ?.numberOfDependents
              ? 500 * this.taxInformationResult?.numberOfDependents
              : this.taxInformationResult?.dependentClaimAmount;

            this.totalClaimAmt =
              this.taxInformationResult?.numberOfChildren ||
              this.taxInformationResult?.numberOfDependents
                ? this.totalChildrenClaimAmt + this.totalDependentsClaimAmt
                : this.taxInformationResult?.totalClaimAmount;

            this.taxInfoForm.patchValue({
              taxInformationId: this.taxInformationResult?.taxInformationId,
              employeeOnboardingId:
                this.taxInformationResult?.employeeOnboardingId,
              federalFilingStatus:
                this.taxInformationResult?.federalFilingStatusCode,
              federalTaxStep2RadioBtnAction:
                this.taxInformationResult?.estimateWithIRS === true
                  ? '1'
                  : this.taxInformationResult?.useMultipleJobWorkSheet === true
                  ? '2'
                  : this.taxInformationResult?.onlyUseTwoJobs === true
                  ? '3'
                  : '',

              multipleJobs: this.taxInformationResult?.multipleJobs,
              twoJobsAmount: this.taxInformationResult?.twoJobsAmount,
              threeJobsAmount: this.taxInformationResult?.threeJobsAmount,
              threeJobs2aAmount: this.taxInformationResult?.threeJobs2aAmount,
              threeJobs2bAmount: this.taxInformationResult?.threeJobs2bAmount,
              threeJobs2cAmount: this.taxInformationResult?.threeJobs2cAmount,

              numberOfPayPeriods: this.taxInformationResult?.numberOfPayPeriods,
              amountPerPayPeriod: this.taxInformationResult?.amountPerPayPeriod,

              numberOfChildren: this.taxInformationResult?.numberOfChildren,
              numberOfDependents: this.taxInformationResult?.numberOfDependents,

              otherIncome: this.taxInformationResult?.otherIncome,
              hasDeductions:
                this.taxInformationResult?.hasDeductions === true
                  ? 'Yes'
                  : 'No',

              numberOfDeductions: this.taxInformationResult?.numberOfDeductions,
              deductionAmount: this.taxInformationResult?.deductionAmount,
              deduction1Amount: this.taxInformationResult?.deduction1Amount,
              deduction2Amount: this.taxInformationResult?.deduction2Amount,
              deductionDifferenceAmount:
                this.taxInformationResult?.deductionDifferenceAmount,

              adjustmentAmount: this.taxInformationResult?.adjustmentAmount,
              totalDeductionAmount:
                this.taxInformationResult?.totalDeductionAmount,
              additionalTaxAmount:
                this.taxInformationResult?.additionalTaxAmount,

              candidateSignatureId:
                this.taxInformationResult?.candidateSignatureId,

              workedState: this.taxInformationResult?.workedState,

              exemptionInWorkedState:
                this.taxInformationResult?.exemptionInWorkedState,
              livedInState: this.taxInformationResult?.livedInState,

              exemptionsInLivedInState:
                this.taxInformationResult?.exemptionsInLivedInState,
              totalExemptionsForAgeOrBlind:
                this.taxInformationResult?.totalExemptionsForAgeOrBlind,
              stateAdditionalTaxAmount:
                this.taxInformationResult?.stateAdditionalTaxAmount,

              workedinCity: this.taxInformationResult?.workedinCity,
              exemptionsInWorkedCity:
                this.taxInformationResult?.exemptionsInWorkedCity,

              livedInCity: this.taxInformationResult?.livedInCity,
            });

            if (
              this.taxInfoForm?.controls?.federalTaxStep2RadioBtnAction
                ?.value === '1' ||
              this.taxInfoForm?.controls?.federalTaxStep2RadioBtnAction
                ?.value === '3'
            ) {
              this.clearMultipleJobs();
            }
            if (this.taxInfoForm?.controls?.hasDeductions?.value === 'No') {
              this.clearOtherAdjustmentsStep4B();
            }

            if (this.taxInformationResult?.federalFilingStatus) {
              this.taxInformationResult.stateFilingStatus =
                this.taxInformationResult?.federalFilingStatus;
              this.taxInformationResult.stateFilingstatusCode =
                this.taxInformationResult?.federalFilingStatusCode;
            }
            this.taxInfoForm?.controls?.workedState?.disable();
            this.taxInfoForm?.controls?.livedInState?.disable();

            this.isLoading = false;
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
          const file = new Blob([data], { type: 'image/*' });
          const fileURL = URL.createObjectURL(file);
          this.candSignURL = this.domSanitizer.bypassSecurityTrustUrl(
            fileURL
          ) as string;
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }
  onRestore(e: Event): void {
    this.stepper.selectedIndex = 0;
  }
  onPrevious(): void {
    this.stepper.selectedIndex = 2;
  }

  // tabChanged(tabChangeEvent: MatTabChangeEvent): void {
  //   this.selectedIndex = tabChangeEvent.index;
  // }

  nextStep(): void {
    this.selectedIndex += 1;
  }

  previousStep(): void {
    this.selectedIndex -= 1;

    if (this.selectedIndex === -1) {
      this.stateTax = false;
      --this.currentTaxFormIndex;
    }
  }

  selectFederalTaxStep2RadioBtnActionOption(value: string): void {
    switch (Number(value)) {
      case 1:
        this.isMultipleJobsOrSpouseWorks = false;
        this.isUseMultipleJobsChecked = false;
        this.clearMultipleJobs();
        break;
      case 2:
        this.isMultipleJobsOrSpouseWorks = false;
        this.isUseMultipleJobsChecked = true;
        break;
      case 3:
        this.isMultipleJobsOrSpouseWorks = true;
        this.isUseMultipleJobsChecked = false;
        this.clearMultipleJobs();
        break;
    }
  }
  clearMultipleJobs(): void {
    this.taxInfoForm?.controls?.multipleJobs?.setValue(
      this.isMultipleJobsOrSpouseWorks
    );

    this.taxInfoForm?.controls?.twoJobsAmount?.setValue(null);
    this.taxInfoForm?.controls?.threeJobsAmount?.setValue(null);
    this.taxInfoForm?.controls?.threeJobs2aAmount?.setValue(null);
    this.taxInfoForm?.controls?.threeJobs2bAmount?.setValue(null);
    this.taxInfoForm?.controls?.threeJobs2cAmount?.setValue(null);
    this.taxInfoForm?.controls?.numberOfPayPeriods?.setValue(null);
    this.taxInfoForm?.controls?.amountPerPayPeriod?.setValue(null);
  }
  openSignatureDialog(signType: string): void {
    const dialogConfig = new MatDialogConfig();

    const obj = {
      employeeOnboardingId: this.employeeOnboardingId,
      formType: 'Tax',
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
            this.saveSignatureAndGetNewSignId(this.candSignFile);
          }
        }
      }
    });
  }

  deleteSign(): void {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you wants to delete the signature?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taxInformationResult.candidateSignatureId = null;
        this.candSignURL = '';

        this.matNotificationService.success(
          '::Selected signature deleted successfully.'
        );
      }
    });
  }
  saveSignatureAndGetNewSignId(signfile: File): void {
    this.candidateOnboardingWorkflowService
      .saveSignature(this.userId, signfile)
      .subscribe(
        (data) => {
          this.candSignId = data?.result;

          this.matNotificationService.success(
            ':: Signature stored successfully'
          );
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  // Step1
  saveFederalFilingStatus(): void {
    this.isLoading = true;

    this.filingStatus.taxInformationId = this.taxInformationId;
    this.filingStatus.employeeOnboardingId = this.employeeOnboardingId;
    this.filingStatus.federalFilingStatusCode =
      this.taxInfoForm?.controls?.federalFilingStatus?.value;
    this.taxFilingStatus = String(
      this.mapFederalFilingStatusCode.get(
        this.taxInfoForm?.controls?.federalFilingStatus?.value
      )
    );
    this.candidateOnboardingWorkflowService.sendTaxFilingStatus(
      this.taxFilingStatus
    );
    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingTaxFilingStatus(this.filingStatus)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Federal Tax filing status updated successfully.'
          );

          this.isLoading = false;
          this.nextStep();
        },
        (error) => {
          this.isLoading = false;
          this.errorMsg =
            '*There is problem with the service. Please try again later.';
          this.matNotificationService.warn(
            ':: Unable to update filing status successfully.'
          );
          console.warn(error);
        }
      );
  }
  // Step2
  saveMultipleJobs(): void {
    this.isLoading = true;
    this.multipleJobs.taxInformationId = this.taxInformationId;
    this.multipleJobs.employeeOnboardingId = this.employeeOnboardingId;
    this.multipleJobs.estimateWithIRS =
      this.taxInfoForm?.controls?.federalTaxStep2RadioBtnAction?.value === '1'
        ? true
        : false;

    this.multipleJobs.useMultipleJobWorkSheet =
      this.taxInfoForm?.controls?.federalTaxStep2RadioBtnAction?.value === '2'
        ? true
        : false;

    this.multipleJobs.onlyUseTwoJobs =
      this.taxInfoForm?.controls?.federalTaxStep2RadioBtnAction?.value === '3'
        ? true
        : false;

    this.multipleJobs.multipleJobs = this.isMultipleJobsOrSpouseWorks;

    this.multipleJobs.twoJobsAmount =
      this.taxInfoForm?.controls?.twoJobsAmount?.value;
    this.multipleJobs.threeJobsAmount =
      this.taxInfoForm?.controls?.threeJobsAmount?.value;
    this.multipleJobs.threeJobs2aAmount = Number(
      this.taxInfoForm?.controls?.threeJobs2aAmount?.value
    );
    this.multipleJobs.threeJobs2bAmount =
      this.taxInfoForm?.controls?.threeJobs2bAmount?.value;
    this.multipleJobs.threeJobs2cAmount =
      this.taxInfoForm?.controls?.threeJobs2cAmount?.value;
    this.multipleJobs.numberOfPayPeriods =
      this.taxInfoForm?.controls?.numberOfPayPeriods?.value;
    this.multipleJobs.amountPerPayPeriod =
      this.taxInfoForm?.controls?.amountPerPayPeriod?.value;

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingTaxMultipleJobs(this.multipleJobs)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Federal Tax multiple jobs details updated successfully.'
          );

          this.isLoading = false;
          this.nextStep();
        },
        (error) => {
          this.isLoading = false;
          this.errorMsg =
            '*There is problem with the service. Please try again later.';
          this.matNotificationService.warn(
            ':: Unable to update multiple jobs details successfully.'
          );
          console.warn(error);
        }
      );
  }
  // Step3
  saveClaimDependents(): void {
    this.isLoading = true;
    this.claimDependents.taxInformationId = this.taxInformationId;
    this.claimDependents.employeeOnboardingId = this.employeeOnboardingId;

    this.claimDependents.numberOfChildren =
      this.taxInfoForm?.controls?.numberOfChildren?.value;
    this.claimDependents.numberOfDependents =
      this.taxInfoForm?.controls?.numberOfDependents?.value;

    this.claimDependents.childrenClaimAmount = this.totalChildrenClaimAmt;
    this.claimDependents.dependentClaimAmount = this.totalDependentsClaimAmt;
    this.claimDependents.totalClaimAmount = this.totalClaimAmt;

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingTaxClaimDependents(this.claimDependents)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Federal Tax claim dependent details updated successfully.'
          );

          this.isLoading = false;
          this.nextStep();
        },
        (error) => {
          this.isLoading = false;
          this.errorMsg =
            '*There is problem with the service. Please try again later.';
          this.matNotificationService.warn(
            ':: Unable to update claim dependent details successfully.'
          );
          console.warn(error);
        }
      );
  }
  // Step4
  saveOtherAdjustments(): void {
    this.isLoading = true;
    this.otherAdjustments.taxInformationId = this.taxInformationId;
    this.otherAdjustments.employeeOnboardingId = this.employeeOnboardingId;

    this.otherAdjustments.otherIncome =
      this.taxInfoForm?.controls?.otherIncome?.value;
    this.otherAdjustments.hasDeductions =
      this.taxInfoForm?.controls?.hasDeductions?.value === 'Yes' ? true : false;
    this.otherAdjustments.numberOfDeductions =
      this.taxInfoForm?.controls?.numberOfDeductions?.value === 'N/A'
        ? null
        : this.taxInfoForm?.controls?.numberOfDeductions?.value;
    this.otherAdjustments.deductionAmount =
      this.taxInfoForm?.controls?.deductionAmount?.value === 'N/A'
        ? null
        : this.taxInfoForm?.controls?.deductionAmount?.value;
    this.otherAdjustments.deduction1Amount =
      this.taxInfoForm?.controls?.deduction1Amount?.value;
    this.otherAdjustments.deduction2Amount =
      this.taxInfoForm?.controls?.deduction2Amount?.value;
    this.otherAdjustments.deductionDifferenceAmount =
      this.taxInfoForm?.controls?.deductionDifferenceAmount?.value;
    this.otherAdjustments.adjustmentAmount =
      this.taxInfoForm?.controls?.adjustmentAmount?.value;
    this.otherAdjustments.totalDeductionAmount =
      this.taxInfoForm?.controls?.totalDeductionAmount?.value;
    this.otherAdjustments.additionalTaxAmount =
      this.taxInfoForm?.controls?.additionalTaxAmount?.value;

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingTaxOtherAdjustments(this.otherAdjustments)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Federal Tax other adjustment details updated successfully.'
          );

          this.setTaxInformation();
          this.isLoading = false;
          this.nextStep();
        },
        (error) => {
          this.isLoading = false;
          this.errorMsg =
            '*There is problem with the service. Please try again later.';
          this.matNotificationService.warn(
            ':: Unable to update other adjustment details successfully.'
          );
          console.warn(error);
        }
      );
  }
  // Sign
  saveAndGenerateW4(): void {
    this.generateW4.taxInformationId = this.taxInformationId;
    this.generateW4.employeeOnboardingId = this.employeeOnboardingId;

    this.isLoadingFederalTax = true;

    this.generateW4.candidateSignatureId =
      this.candSignId === undefined && this.isSignSaved
        ? this.candSignId
        : null;

    if (this.generateW4.candidateSignatureId === null) {
      this.generateW4.candidateSignature = this.candSignFile;
    }

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingTaxGenerateW4(this.generateW4)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Signature added to Federal Tax form & Federal Tax form generated successfully.'
          );
          this.docURL = `data:application/pdf;base64,${data?.result?.documentBytes}`;
          this.candidateOnboardingWorkflowService.sendTaxDocURL(this.docURL);
          this.isLoadingFederalTax = false;
        },
        (error) => {
          this.isLoadingFederalTax = false;
          this.errorMsg =
            '*There is problem with the service. Please try again later.';
          this.matNotificationService.warn(
            ':: Unable to add & generate Federal Tax form successfully.'
          );
          console.warn(error);
        }
      );
  }
  // Save State Tax
  saveStateTaxDetails(): void {
    this.isLoading = true;
    this.stateTaxDetails.taxInformationId = this.taxInformationId;
    this.stateTaxDetails.employeeOnboardingId = this.employeeOnboardingId;
    this.stateTaxDetails.stateFilingstatusCode =
      this.taxInfoForm?.controls?.federalFilingStatus?.value;
    this.stateTaxDetails.stateFilingStatus = String(
      this.mapFederalFilingStatusCode.get(
        this.taxInfoForm?.controls?.federalFilingStatus?.value
      )
    );
    this.stateTaxDetails.workedState =
      this.taxInfoForm?.controls?.workedState?.value;
    this.stateTaxDetails.exemptionInWorkedState =
      this.taxInfoForm?.controls?.exemptionInWorkedState?.value;
    this.stateTaxDetails.livedInState =
      this.taxInfoForm?.controls?.livedInState?.value;
    this.stateTaxDetails.exemptionsInLivedInState =
      this.taxInfoForm?.controls?.exemptionsInLivedInState?.value;
    this.stateTaxDetails.totalExemptionsForAgeOrBlind =
      this.taxInfoForm?.controls?.totalExemptionsForAgeOrBlind?.value;
    this.stateTaxDetails.stateAdditionalTaxAmount =
      this.taxInfoForm?.controls?.stateAdditionalTaxAmount?.value;

    this.stateTaxDetails.workedinCity =
      this.taxInfoForm?.controls?.workedinCity?.value;
    this.stateTaxDetails.exemptionsInWorkedCity =
      this.taxInfoForm?.controls?.exemptionsInWorkedCity?.value;
    this.stateTaxDetails.livedInCity =
      this.taxInfoForm?.controls?.livedInCity?.value;

    this.candidateOnboardingWorkflowService.sendStateTaxDetails(
      this.stateTaxDetails
    );

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingStateTax(this.stateTaxDetails)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            '::State Tax details updated successfully'
          );
          this.isLoading = false;
          this.stateTax = false;
          this.selectedIndex = 0;
          this.docURL = '';
          this.stepper.next();
        },
        (error) => {
          this.isLoading = false;
          this.errorMsg =
            '*There is problem with the service. Please try again later.';
          this.matNotificationService.warn(
            ':: Unable to update State Tax details successfully.'
          );
          console.warn(error);
        }
      );
  }

  chooseDeductionsType(event: MatSelectChange): void {
    if (event.value === 'Yes') {
      this.showStep4B = true;
      this.taxInfoForm?.controls?.numberOfDeductions?.setValue(
        this.taxInformationResult?.numberOfDeductions
      );
      this.taxInfoForm?.controls?.numberOfDeductions?.enable();
      this.taxInfoForm?.controls?.deductionAmount?.setValue(
        this.taxInformationResult?.deductionAmount
      );
      this.taxInfoForm?.controls?.deductionAmount?.enable();
    } else {
      this.clearOtherAdjustmentsStep4B();
      this.showStep4B = false;
    }
  }
  clearOtherAdjustmentsStep4B(): void {
    this.taxInfoForm?.controls?.numberOfDeductions?.setValue('N/A');
    this.taxInfoForm?.controls?.numberOfDeductions?.disable();
    this.taxInfoForm?.controls?.deductionAmount?.setValue('N/A');
    this.taxInfoForm?.controls?.deductionAmount?.disable();

    this.taxInfoForm?.controls?.deduction1Amount?.setValue(null);
    this.taxInfoForm?.controls?.deduction2Amount?.setValue(null);
    this.taxInfoForm?.controls?.deductionDifferenceAmount?.setValue(null);
    this.taxInfoForm?.controls?.adjustmentAmount?.setValue(null);
    this.taxInfoForm?.controls?.totalDeductionAmount?.setValue(null);
  }
  openTaxForm(federalForm: ResourceDocuments): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: federalForm,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(PreviewDocumentComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.dialogRef.close('cancel');
      }
    });
  }

  openStateTaxWithHolding(): void {
    this.stateTax = true;
    this.docURL = '';
    this.selectedIndex = 0;
    this.taxFormsUpdated.push(this.currentTaxFormIndex);
    ++this.currentTaxFormIndex;
  }

  // tslint:disable-next-line: no-any
  updateTotalChildrenClaimAmt(event: any): void {
    this.totalChildrenClaimAmt = Number(event?.target?.value) * 2000;
    this.totalClaimAmt =
      this.totalChildrenClaimAmt + this.totalDependentsClaimAmt;
  }
  // tslint:disable-next-line: no-any
  updateTotalDependentsClaimAmt(event: any): void {
    this.totalDependentsClaimAmt = Number(event?.target?.value) * 500;
    this.totalClaimAmt =
      this.totalChildrenClaimAmt + this.totalDependentsClaimAmt;
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }

  chooseFilingStatus(filingStatus: number): void {
    const filingStatuses = [217, 218, 219];
    if (filingStatuses.includes(filingStatus)) {
      this.disableStep1NextBtn = false;
    } else {
      this.disableStep1NextBtn = true;
    }
  }
}
