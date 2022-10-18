import { Component, Input, OnInit } from '@angular/core';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';
import {
  CandidateOnboardingTaxInformationResult,
  ResourceDocuments,
} from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { PreviewDocumentComponent } from '../../../../../../../shared/components/preview-document/preview-document.component';
import { MatRadioChange } from '@angular/material/radio';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';

@Component({
  selector: 'app-hr-verify-tax-information',
  templateUrl: './hr-verify-tax-information.component.html',
  styleUrls: ['./hr-verify-tax-information.component.scss'],
})
export class HrVerifyTaxInformationComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  taxInformationResult!: CandidateOnboardingTaxInformationResult;
  federalTaxWithHoldingFormsList: ResourceDocuments[] = [];
  stateTaxWithHoldingFormsList: ResourceDocuments[] = [];
  mapWorkAuth = new Map<number, string>();
  ficaTaxForm!: FormGroup;
  workAuthorizationTypeCode!: number;
  isLivedForFiveYearsInUSA = false;
  isNotLivedForFiveYearsInUSA = false;
  isIgnoreSSNCalculation = false;
  isIgnoreMedicareCalculation = false;
  isLoading = false;
  optionBtnValue!: number;
  linkIndex = 0;
  selectedIndex = 0;
  federalTaxURL = '';
  showFederalTax = true;
  showStateTax = false;
  showFicaTax = false;
  showNotLiableForFICA = false;

  constructor(
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private documentsService: DocumentsService,
    private lookupService: LookupService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private matNotificationService: MatNotificationService
  ) {}

  ngOnInit(): void {
    this.setTaxInformation();
    this.getWorkAuthorizationType();

    this.ficaTaxForm = this.fb.group({
      workAuthorizationType: ['', Validators.required],
      lived: ['', Validators.required],
      livedForFiveYearsInUSA: [''],
      notLivedForFiveYearsInUSA: [''],
      ignoreSSNCalculation: [''],
      ignoreMedicareCalculation: [''],
    });
  }

  setTaxInformation(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingTaxInformation(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.taxInformationResult = data?.result;
          const formsList = this.taxInformationResult?.resourceDocuments;

          this.federalTaxWithHoldingFormsList = formsList?.filter(
            (forms) => forms.isFederalForm === true
          );
          this.stateTaxWithHoldingFormsList = formsList?.filter(
            (forms) => forms.isFederalForm === false
          );
          if (this.federalTaxWithHoldingFormsList) {
            this.openFederalTaxForm(this.federalTaxWithHoldingFormsList[0]);
          }

          this.ficaTaxForm.patchValue({
            workAuthorizationType:
              this.taxInformationResult?.workAuthorizationTypeCode,
              lived:
              this.taxInformationResult?.livedForFiveYearsInUSA === true
              ? '1'
              : this.taxInformationResult?.notLivedForFiveYearsInUSA === true
              ? '2'
              : '',
            livedForFiveYearsInUSA: this.taxInformationResult?.livedForFiveYearsInUSA,
            notLivedForFiveYearsInUSA: this.taxInformationResult?.notLivedForFiveYearsInUSA,
            ignoreSSNCalculation:
              this.taxInformationResult?.ignoreSSNCalculation,
            ignoreMedicareCalculation:
              this.taxInformationResult?.ignoreMedicareCalculation,
          });

          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  getWorkAuthorizationType(): void {
    this.isLoading = true;
    this.lookupService.getWorkAuthorizationTypeCode().subscribe(
      (data) => {
        for (const workAuth of data.result) {
          this.mapWorkAuth.set(workAuth.lookupCode, workAuth.name);
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  openFederalTaxForm(federalForm: ResourceDocuments): void {
    federalForm.resourceValue = this.employeeOnboardingId;
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getFedralTaxWithHolding(federalForm?.resourceValue)
      .subscribe(
        (data) => {
          this.federalTaxURL = `data:application/pdf;base64,${data?.result?.documentBytes}`;
          this.isLoading = false;
          
        },
        (err) => {
          this.isLoading = false;
          console.warn(err);
        }
      );
  }

  onFederalTax(): void {
    this.showFederalTax = true;
    this.showStateTax = false;
    this.showFicaTax = false;
    this.linkIndex = 0;
  }

  onStateTax(): void {
    this.showFederalTax = false;
    this.showStateTax = true;
    this.showFicaTax = false;
    this.linkIndex = 1;
    this.selectedIndex = 0;
  }

  onFicaTax(): void {
    this.showFederalTax = false;
    this.showStateTax = false;
    this.showFicaTax = true;
    this.linkIndex = 3;
  }

  moveNext(): void {
    if (this.linkIndex <= 3) {
      this.linkIndex = this.linkIndex + 1;
    }
    if (this.linkIndex === 1) {
      this.showFederalTax = false;
      this.showStateTax = true;
      this.showFicaTax = false;
      this.selectedIndex = 0;
    }
    if (this.linkIndex === 2) {
      this.showFederalTax = false;
      this.showStateTax = true;
      this.showFicaTax = false;
      this.selectedIndex = 1;
    }
    if (this.linkIndex === 3) {
      this.showFederalTax = false;
      this.showStateTax = false;
      this.showFicaTax = true;
    }

    if (this.linkIndex === 4) {
      this.saveFICATax();
    }
  }

  movePrevious(): void {
    if (this.linkIndex >= 1) {
      this.linkIndex = this.linkIndex - 1;
    }
    if (this.linkIndex === 0) {
      this.showFederalTax = true;
      this.showStateTax = false;
      this.showFicaTax = false;
    }
    if (this.linkIndex === 1) {
      this.showFederalTax = false;
      this.showStateTax = true;
      this.showFicaTax = false;
      this.selectedIndex = 0;
    }
    if (this.linkIndex === 2) {
      this.showFederalTax = false;
      this.showStateTax = true;
      this.showFicaTax = false;
      this.selectedIndex = 1;
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedIndex = tabChangeEvent.index;
  }

  saveFICATax(): void {
    this.isLoading = true;
    this.workAuthorizationTypeCode =
      this.ficaTaxForm?.controls?.workAuthorizationType?.value;
    this.isIgnoreSSNCalculation =
      this.ficaTaxForm?.controls?.ignoreSSNCalculation?.value;
    if (this.ficaTaxForm?.controls?.ignoreSSNCalculation?.value === ''
      || this.ficaTaxForm?.controls?.livedForFiveYearsInUSA?.value === true) {
      this.isIgnoreSSNCalculation = false;
    }
    this.isIgnoreMedicareCalculation =
      this.ficaTaxForm?.controls?.ignoreMedicareCalculation?.value;
    if (this.ficaTaxForm?.controls?.ignoreMedicareCalculation?.value === ''
      || this.ficaTaxForm?.controls?.livedForFiveYearsInUSA?.value === true) {
      this.isIgnoreMedicareCalculation = false;
    }

    // tslint:disable-next-line: no-any
    let ficaTaxData: any;
    ficaTaxData = {
      taxInformationId: this.taxInformationResult?.taxInformationId,
      employeeOnboardingId: this.employeeOnboardingId,
      workAuthorizationTypeCode: this.workAuthorizationTypeCode,
      livedForFiveYearsInUSA: this.isLivedForFiveYearsInUSA,
      notLivedForFiveYearsInUSA: this.isNotLivedForFiveYearsInUSA,
      ignoreSSNCalculation: this.isIgnoreSSNCalculation,
      ignoreMedicareCalculation: this.isIgnoreMedicareCalculation,
    };
    this.candidateOnboardingWorkflowService
      .saveFICATaxInfo(ficaTaxData)
      .subscribe(
        (data) => {
          if (data?.result === 1) {
            this.matNotificationService.success(
              ':: FICA Tax information saved successfully'
            );
          } else {
            this.matNotificationService.warn(':: Unable to save successfully');
          }
          this.isLoading = false;
        },
        (error) => {
          console.warn(error);
          this.matNotificationService.warn(':: Unable to save successfully');
          this.isLoading = false;
        }
      );
  }

  downloadFederalTaxWithHolding(resourceValue: string): void {
    if (resourceValue) {
      resourceValue = this.employeeOnboardingId;
      this.candidateOnboardingWorkflowService
        .getFedralTaxWithHolding(resourceValue)
        .subscribe(
          (data) => {
            saveAs(
              `data:application/pdf;base64,${data?.result?.documentBytes}`,
              'Federal Tax WithHolding'
            );
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  openStateTaxForm(federalForm: ResourceDocuments): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: federalForm,
      type: 'StateTax',
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

  changeRadioBtn(e: MatRadioChange): void {
    this.optionBtnValue = e.value;
    if (this.optionBtnValue.toString() === '2') {
      this.showNotLiableForFICA = true;
      this.isLivedForFiveYearsInUSA = false;
      this.isNotLivedForFiveYearsInUSA = true;
      this.ficaTaxForm.patchValue({
        livedForFiveYearsInUSA: false,
        notLivedForFiveYearsInUSA: true
      });
      this.taxInformationResult.notLivedForFiveYearsInUSA = true;
    } else if (this.optionBtnValue.toString() === '1') {
      this.showNotLiableForFICA = false;
      this.isLivedForFiveYearsInUSA = true;
      this.isNotLivedForFiveYearsInUSA = false;
      this.ficaTaxForm.patchValue({
        livedForFiveYearsInUSA: true,
        notLivedForFiveYearsInUSA: false
      });
      this.taxInformationResult.notLivedForFiveYearsInUSA = false;
    }
  }
}
