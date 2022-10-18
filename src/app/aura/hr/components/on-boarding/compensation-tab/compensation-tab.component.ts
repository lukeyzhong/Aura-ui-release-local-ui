import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  AdditionalEarnings,
  CompensationInformationResult,
} from '../../../interface/dashboard/candidate-onboarding.interface';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { CandidateOnboardingService } from '../../../service/dashboard/candidate-onboarding.service';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'app-compensation-tab',
  templateUrl: './compensation-tab.component.html',
  styleUrls: ['./compensation-tab.component.scss'],
})
export class CompensationTabComponent implements OnInit {
  compensationInfoForm!: FormGroup;

  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  compensationInformationResult!: CompensationInformationResult;
  @Input() stepper!: MatStepper;
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';

  mapWageCompensationType = new Map<number, string>();
  mapWageCompensationName = new Map<number, string>();
  mapCalculatedBy = new Map<number, string>();
  mapPayFrequency = new Map<number, string>();

  totalEarnings = 0;
  calculatedByAnnually = 6;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingService: CandidateOnboardingService,
    private dialogConfirm: MatDialog
  ) {}

  ngOnInit(): void {
    this.compensationInfoForm = this.fb.group({
      compensationType: ['', Validators.required],
      calculatedBy: ['', Validators.required],
      amount: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+([.][0-9]{1,2})?$')],
      ],
      paymentFrequency: ['', Validators.required],
      additionalEarnings: this.fb.array([this.additionalEarningsFormGroup()]),
      flsaClassification: ['', Validators.required],
      overTimePayInfo: [
        '',
        [Validators.required, Validators.pattern('^[0-9]+([.][0-9]{1,2})?$')],
      ],
    });

    this.setCompensationLookupTypes();
  }

  get additionalEarnings(): FormArray {
    return this.compensationInfoForm?.get('additionalEarnings') as FormArray;
  }

  removeAdditionalEarnings(index: number): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to delete this current earnings?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.totalEarnings = this.additionalEarnings?.length - 1;
        this.additionalEarnings?.removeAt(index);
        this.compensationInfoForm.markAsDirty();
        this.compensationInfoForm?.controls?.additionalEarnings?.markAsDirty();
      }
    });
  }

  additionalEarningsFormGroup(): FormGroup {
    return this.fb.group({
      compensationType: [''],

      calculatedBy: [''],
      paymentFrequency: [''],
      amount: ['', Validators.pattern('^[0-9]+([.][0-9]{1,2})?$')],
    });
  }

  addAdditionalEarnings(): void {
    if (this.totalEarnings > 2) {
      this.matNotificationService.warn(
        ':: You can not add more than 3 Additional Earnings!'
      );
    } else {
      this.totalEarnings = this.totalEarnings + 1;
      this.additionalEarnings.push(this.addEarning());
    }
  }

  addEarning(): FormGroup {
    return this.fb.group({
      compensationType: [''],

      calculatedBy: [''],
      paymentFrequency: [''],
      amount: ['', Validators.pattern('^[0-9]+([.][0-9]{1,2})?$')],
    });
  }

  onSaveCompensationInfo(): void {
    this.compensationInformationResult.additionalEarnings = [];

    this.compensationInformationResult.compensationTypeCode =
      this.compensationInfoForm?.controls?.compensationType?.value;
    this.compensationInformationResult.calculatedByCode =
      this.compensationInfoForm?.controls?.calculatedBy?.value;
    this.compensationInformationResult.amount = Number(
      this.compensationInfoForm?.controls?.amount?.value
    );
    this.compensationInformationResult.paymentFrequencyCode =
      this.compensationInfoForm?.controls?.paymentFrequency?.value;
    this.compensationInformationResult.flsaClassification =
      this.compensationInfoForm?.controls?.flsaClassification?.value === 'true'
        ? true
        : false;

    this.compensationInformationResult.overTimePayInfo =
      this.compensationInfoForm?.controls?.overTimePayInfo?.value === 'N/A'
        ? 0
        : Number(this.compensationInfoForm?.controls?.overTimePayInfo?.value);

    let addEarning: AdditionalEarnings;

    if (this.totalEarnings > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.additionalEarnings?.controls?.length; i++) {
        {
          addEarning = {
            compensationTypeCode:
              this.additionalEarnings?.controls[i]?.get('compensationType')
                ?.value,

            calculatedByCode:
              this.additionalEarnings?.controls[i]?.get('calculatedBy')?.value,
            paymentFrequencyCode:
              this.additionalEarnings?.controls[i]?.get('paymentFrequency')
                ?.value,
            amount: Number(
              this.additionalEarnings?.controls[i]?.get('amount')?.value
            ),
          };
          this.compensationInformationResult?.additionalEarnings?.push(
            addEarning
          );
        }
      }
    }

    this.candidateOnboardingService
      .saveCompensationInformation(this.compensationInformationResult)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Compensation Details updated successfully'
          );

          this.compensationInfoForm.markAsPristine();
          this.setCompensationInformation();
        },
        (error) => {
          this.matNotificationService.warn(
            ':: Unable to update successfully ' + error
          );
          console.warn(error);
        }
      );
  }

  setCompensationLookupTypes(): void {
    this.lookupService
      .getCompensationLookupTypes()
      .subscribe((responseList) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[0]?.result?.length; i++) {
          if (responseList[0]?.result[i]?.lookupCode !== 3) {
            this.mapWageCompensationType.set(
              responseList[0]?.result[i]?.lookupCode,
              responseList[0]?.result[i]?.description
            );
          }
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[0]?.result?.length; i++) {
          if (
            responseList[0]?.result[i]?.lookupCode !== 1 &&
            responseList[0]?.result[i]?.lookupCode !== 2
          ) {
            this.mapWageCompensationName.set(
              responseList[0]?.result[i]?.lookupCode,
              responseList[0]?.result[i]?.description
            );
          }
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[1]?.result?.length; i++) {
          this.mapCalculatedBy.set(
            responseList[1]?.result[i]?.lookupCode,
            responseList[1]?.result[i]?.description
          );
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < responseList[2]?.result?.length; i++) {
          this.mapPayFrequency.set(
            responseList[2]?.result[i]?.lookupCode,
            responseList[2]?.result[i]?.description
          );
        }

        this.setCompensationInformation();
      });
  }

  setCompensationInformation(): void {
    this.candidateOnboardingService
      .getCompensationInformation(
        this.candidateId,
        this.candidateJobRequirementId
      )
      .subscribe(
        (data) => {
          this.compensationInformationResult = data?.result;

          this.compensationInfoForm.patchValue({
            compensationType:
              this.compensationInformationResult?.compensationTypeCode,
            calculatedBy:
              this.compensationInformationResult?.calculatedByCode === null
                ? this.calculatedByAnnually
                : this.compensationInformationResult?.calculatedByCode,

            amount: this.compensationInformationResult?.amount,
            paymentFrequency:
              this.compensationInformationResult?.paymentFrequencyCode,

            flsaClassification:
              this.compensationInformationResult?.flsaClassification === null ||
              this.compensationInformationResult?.flsaClassification === false
                ? 'false'
                : 'true',
            overTimePayInfo:
              this.compensationInformationResult?.overTimePayInfo === 0
                ? 'N/A'
                : this.compensationInformationResult?.overTimePayInfo,
          });

          if (
            this.compensationInformationResult?.flsaClassification === null ||
            this.compensationInformationResult?.flsaClassification === false
          ) {
            this.compensationInfoForm?.controls?.overTimePayInfo?.enable();
          } else {
            this.compensationInfoForm?.controls?.overTimePayInfo?.setValue(
              'N/A'
            );
            this.compensationInfoForm?.controls?.overTimePayInfo?.disable();
          }
          this.compensationInfoForm.setControl(
            'additionalEarnings',
            this.setAdditionalEarnings(
              this.compensationInformationResult?.additionalEarnings
            )
          );

          this.totalEarnings = this.additionalEarnings?.length;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setAdditionalEarnings(addEarnings: AdditionalEarnings[]): FormArray {
    const formArray = new FormArray([]);
    addEarnings?.forEach((ae) => {
      formArray.push(
        this.fb.group({
          compensationType: ae?.compensationTypeCode,
          calculatedBy: ae?.calculatedByCode,
          paymentFrequency: ae?.paymentFrequencyCode,
          amount: [ae?.amount, Validators.pattern('^[0-9]+([.][0-9]{1,2})?$')],
        })
      );
    });
    return formArray;
  }

  onRestore(e: Event, compensationForm: FormGroup): void {
    if (
      compensationForm.dirty &&
      compensationForm.valid &&
      compensationForm?.controls?.additionalEarnings?.dirty &&
      compensationForm?.controls?.additionalEarnings?.valid
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setCompensationInformation();
          compensationForm.markAsPristine();
          this.stepper.selectedIndex = 1;
        }
      });
      e.preventDefault();
    } else {
      this.setCompensationInformation();
      this.stepper.selectedIndex = 1;
    }
  }

  goToHrDashboard(compensationInfoForm: FormGroup): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Are you sure, you want to save & close?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (compensationInfoForm.dirty && compensationInfoForm.valid) {
          this.onSaveCompensationInfo();
          compensationInfoForm.markAsPristine();
        }
        this.router.navigate(['/aura/hr/dashboard']);
      }
    });
  }

  saveContinue(compensationInfoForm: FormGroup): void {
    if (
      (compensationInfoForm.dirty ||
        compensationInfoForm?.controls?.additionalEarnings?.dirty) &&
      (compensationInfoForm.valid ||
        compensationInfoForm?.controls?.additionalEarnings?.valid)
    ) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onSaveCompensationInfo();
          compensationInfoForm.markAsPristine();
          this.stepper.next();
        }
      });
    } else if (
      compensationInfoForm.valid &&
      compensationInfoForm?.controls?.additionalEarnings?.status === 'VALID'
    ) {
      compensationInfoForm.markAsPristine();
      this.stepper.next();
      this.matNotificationService.success(':: No changes made.');
    }
  }

  chooseFLSAClassification(event: MatSelectChange): void {
    if (event.value === 'true') {
      this.compensationInfoForm?.controls?.overTimePayInfo?.setValue('N/A');
      this.compensationInfoForm?.controls?.overTimePayInfo?.disable();
    } else if (event.value === 'false') {
      this.compensationInfoForm?.controls?.overTimePayInfo?.setValue(
        this.compensationInformationResult?.overTimePayInfo === 0
          ? ''
          : this.compensationInformationResult?.overTimePayInfo
      );
      this.compensationInfoForm?.controls?.overTimePayInfo?.enable();
    }
  }
}
