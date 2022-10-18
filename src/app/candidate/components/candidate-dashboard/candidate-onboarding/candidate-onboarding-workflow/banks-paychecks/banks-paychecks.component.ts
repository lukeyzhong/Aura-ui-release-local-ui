import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
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
} from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import {
  BankPaycheckInfo,
  CandidateOnboardingInformationResult,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
// tslint:disable-next-line: max-line-length
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { PreviewCancelChequeComponent } from '../../../../../../shared/components/preview-cancel-cheque/preview-cancel-cheque.component';
import { Router } from '@angular/router';
import { CompensationInformationResult } from '../../../../../../aura/hr/interface/dashboard/candidate-onboarding.interface';

@Component({
  selector: 'app-banks-paychecks',
  templateUrl: './banks-paychecks.component.html',
  styleUrls: ['./banks-paychecks.component.scss'],
})
export class BanksPaychecksComponent implements OnInit, AfterContentChecked {
  @Input() stepper!: MatStepper;
  amountInfo!: number;
  totalAmount!: number;
  bankAccountCount!: number;
  @Input() employeeOnboardingId!: string;
  resourceTypeCode = 39;
  resourceValue = '';
  name: string[] = [];
  accountType: number[] = [];
  bankAccountId: string[] = [];
  bankName: string[] = [];
  routingNumber: string[] = [];
  accountNumber: string[] = [];
  branchName: string[] = [];
  paycheckDistribution: number[] = [];
  percentage: number[] = [];
  amount: number[] = [];
  primaryAccount: boolean[] = [];
  documentPurposeCodeFile = 57;
  isNewDocument: boolean[] = [];
  resourceTypeCodeFile = 43;
  fileId: string[] = [];
  fileName: string[] = [];
  file: File[] = [];
  bankPaycheckForm!: FormGroup;
  bankPaycheckInfo!: BankPaycheckInfo[];
  addNewButton!: number;
  totalBanksPaychecks = 0;
  errorMsg = '';
  imgName: string[] = [];
  attachedfileName: string[] = [];
  attachedfileExt: string[] = [];
  mapWageCalculationType = new Map<number, string>();
  mapAccountType = new Map<number, string>();
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  chooseFileToggle: boolean[] = [];
  distributionSelection!: number;
  fileExt = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'tiff',
    'bmp',
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.tiff',
    '.bmp',
  ];
  docDeleteId: string[] = [];
  isLoading = false;
  payCheckDistValue!: number;
  percentageValue: number[] = [];
  amountValue: number[] = [];
  arrAmount: number[] = [];
  arrPercentage: number[] = [];
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();
  commentValue!: string;
  keysSectionWise: string[] = [];
  countKeysSectionWise = 0;
  countKeysBanksPaychecksInfo!: number;
  totalPercentage = 100;
  fileAttached = '';
  disableAddNew = true;
  paycheckDistributionValue!: number;
  compensationInfo!: CompensationInformationResult;
  candidateOnboardingInformationResult!: CandidateOnboardingInformationResult;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private dialog: MatDialog,
    private dialogConfirm: MatDialog,
    private dialogRef: MatDialogRef<PreviewCancelChequeComponent>,
    private documentsService: DocumentsService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bankPaycheckForm = this.fb.group({
      banksPaychecks: this.fb.array([this.bankPaychecksFormGroup()]),
    });
    this.candidateOnboardingWorkflowService
      .getSalaryInfo()
      .subscribe((info) => {
        if (info) {
          this.amountInfo = info;
          console.log('amountInfo-OnInit', this.amountInfo);
          this.setWageComponentCalculationType();
          this.setAccountType();
          this.setBanksAndPaychecks();
        }
      });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  get banksPaychecks(): FormArray {
    return this.bankPaycheckForm?.get('banksPaychecks') as FormArray;
  }

  setWageComponentCalculationType(): void {
    this.lookupService.getWageComponentCalculationType().subscribe((data) => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < data.result?.length; i++) {
        this.mapWageCalculationType.set(
          data.result[i]?.lookupCode,
          data.result[i]?.name
        );
      }
    });
  }

  setAccountType(): void {
    this.lookupService.getAccountType().subscribe((data) => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < data.result?.length; i++) {
        this.mapAccountType.set(
          data.result[i]?.lookupCode,
          data.result[i]?.name
        );
      }
    });
  }

  setBanksAndPaychecks(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getBanksAndPaychecks(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.bankPaycheckInfo = data?.result?.bankInfo;
          this.addNewButton = data?.result?.bankInfo?.length;
          if (this.bankPaycheckInfo) {
            this.fileAttached = 'fileNme';
            this.bankPaycheckForm.setControl(
              'banksPaychecks',
              this.setBanksAndPaychecksDetails(this.bankPaycheckInfo)
            );
            this.disableAddNew = false;
            this.imgName = [];
            this.getComments();
            if (
              this.banksPaychecks?.controls[0]?.get('paycheckDistribution')
                ?.value === undefined
            ) {
              this.totalPercentage = 100;
            }

            this.totalPercentage = 0;
            this.totalAmount = 0;
            for (let s = 0; s < this.bankPaycheckInfo?.length; s++) {
              if (
                this.banksPaychecks?.controls[0]?.get('paycheckDistribution')
                  ?.value === 2
              ) {
                this.distributionSelection = 2;
                this.totalAmount = this.amountInfo;
                this.percentage[s] =
                  this.banksPaychecks?.controls[s]?.get('percentage')?.value;
                this.totalPercentage =
                  this.totalPercentage + this.percentage[s];
              }
              if (
                this.banksPaychecks?.controls[0]?.get('paycheckDistribution')
                  ?.value === 1
              ) {
                this.distributionSelection = 1;
                this.totalPercentage = 100;
                this.amount[s] =
                  // tslint:disable-next-line: radix
                  parseInt(
                    this.banksPaychecks?.controls[s]?.get('amount')?.value
                  );
                this.totalAmount = this.totalAmount + this.amount[s];
              }
            }
          }
          if (this.bankPaycheckInfo?.length === 0) {
            this.bankPaycheckInfo.length = this.bankPaycheckInfo?.length + 1;
            this.addBanksPaychecks();
            this.fileAttached = '';
            this.disableAddNew = true;
          }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          console.warn(err);
        }
      );
  }

  deleteBankAccount(bankAccId: string): void {
    this.candidateOnboardingWorkflowService
      .deleteCandidateBankInfo(bankAccId)
      .subscribe(
        (data) => {
          this.setBanksAndPaychecks();
          this.matNotificationService.success(
            ':: Bank account deleted successfully'
          );
        },
        (err) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to delete successfully');
          console.warn(err);
        }
      );
  }

  setBanksAndPaychecksDetails(bankPaycheck: BankPaycheckInfo[]): FormArray {
    const formArray = new FormArray([]);
    bankPaycheck?.forEach((rec) => {
      formArray.push(
        this.fb.group({
          name: [
            rec?.bankAccountData?.accountName,
            [
              Validators.required,
              Validators.maxLength(60),
              Validators.pattern('[A-Za-z ]{1,50}'),
            ],
          ],
          accountType: [
            rec?.bankAccountData?.bankAccountTypeCode,
            Validators.required,
          ],
          bankAccountId: [rec?.bankAccountData?.bankAccountId],
          bankName: [
            rec?.bankAccountData?.bankName,
            [
              Validators.required,
              Validators.maxLength(60),
              Validators.pattern('[A-Za-z ]{1,50}'),
            ],
          ],
          routingNumber: [
            rec?.bankAccountData?.routingNumber,
            [
              Validators.required,
              Validators.maxLength(9),
              Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
            ],
          ],
          // tslint:disable-next-line: max-line-length
          accountNumber: [
            rec?.bankAccountData?.accountNumber,
            [
              Validators.required,
              Validators.minLength(10),
              Validators.maxLength(15),
              Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
            ],
          ],
          branchName: [
            rec?.bankAccountData?.branchName,
            [
              Validators.required,
              Validators.maxLength(60),
              Validators.pattern('^[a-zA-Z0-9 ]+$'),
            ],
          ],
          paycheckDistribution: [
            rec?.bankAccountData?.calculationTypeCode,
            Validators.required,
          ],
          percentage: rec?.bankAccountData?.calculationValue,
          amount: [
            rec?.bankAccountData?.calculationValue,
            [
              Validators.maxLength(10),
              Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
            ],
          ],
          fileId: rec?.bankAccountData?.document?.documentId,
          fileName: rec?.bankAccountData?.document?.displayName,
          fileExtension: rec?.bankAccountData?.document?.fileExtension,
          file: rec?.bankAccountData?.document?.documentInfo,
        })
      );
    });
    return formArray;
  }

  bankPaychecksFormGroup(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('[A-Za-z ]{1,50}'),
        ],
      ],
      accountType: ['', Validators.required],
      bankAccountId: [''],
      bankName: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('[A-Za-z ]{1,50}'),
        ],
      ],
      routingNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
        ],
      ],
      accountNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
        ],
      ],
      branchName: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('^[a-zA-Z0-9 ]+$'),
        ],
      ],
      paycheckDistribution: ['', Validators.required],
      percentage: [''],
      amount: [
        '',
        [
          Validators.maxLength(10),
          Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
        ],
      ],
      fileId: [''],
      fileName: [''],
      fileExtension: [''],
      file: [''],
    });
  }

  addBanksPaychecks(): void {
    this.fileAttached = '';
    this.banksPaychecks.push(this.addBankPaycheck());
    this.totalBanksPaychecks = this.banksPaychecks.controls.length;
    //   tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < this.banksPaychecks.controls.length; j++) {
      if (j === 0) {
        this.payCheckDistValue = this.banksPaychecks.controls[j].get(
          'paycheckDistribution'
        )?.value;
        this.percentageValue[j] =
          this.banksPaychecks.controls[j].get('percentage')?.value;
        this.amountValue[j] =
          this.banksPaychecks.controls[j].get('amount')?.value;
        if (
          this.banksPaychecks.controls[j].get('paycheckDistribution')?.value ===
          ''
        ) {
          this.banksPaychecks.controls[j]
            .get('paycheckDistribution')
            ?.patchValue(2);
          this.banksPaychecks.controls[j].get('percentage')?.patchValue(100);
          this.banksPaychecks.controls[j]
            .get('amount')
            ?.patchValue(this.amountInfo);
          this.totalPercentage = 100;
          this.totalAmount = this.amountInfo;
          this.distributionSelection = 2;
        }
        this.totalPercentage = 100;
        this.totalAmount = this.amountInfo;
      }
      if (j === 1) {
        this.percentageValue[j] =
          this.banksPaychecks.controls[j].get('percentage')?.value;
        this.amountValue[j] =
          this.banksPaychecks.controls[j].get('amount')?.value;
        if (
          this.banksPaychecks.controls[j].get('paycheckDistribution')?.value ===
          ''
        ) {
          if (this.payCheckDistValue === 1) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(1);
            this.banksPaychecks.controls[j]
              .get('amount')
              ?.patchValue(this.amountInfo - this.amountValue[0]);
            this.totalPercentage = 100;
          }
          if (this.payCheckDistValue === 2) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(2);
            this.banksPaychecks.controls[j]
              .get('percentage')
              ?.patchValue(100 - this.percentageValue[0]);
            // this.banksPaychecks.controls[j].get('amount')?.patchValue(0);
            this.totalAmount = this.amountInfo;
          }
        }
      }
      if (j === 2) {
        this.percentageValue[j] =
          this.banksPaychecks.controls[j].get('percentage')?.value;
        this.amountValue[j] =
          this.banksPaychecks.controls[j].get('amount')?.value;
        if (
          this.banksPaychecks.controls[j].get('paycheckDistribution')?.value ===
          ''
        ) {
          if (this.payCheckDistValue === 1) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(1);
            this.banksPaychecks.controls[j]
              .get('amount')
              ?.patchValue(
                this.amountInfo - (this.amountValue[0] + this.amountValue[1])
              );
            this.totalPercentage = 100;
          }
          if (this.payCheckDistValue === 2) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(2);
            this.banksPaychecks.controls[j]
              .get('percentage')
              ?.patchValue(
                100 - (this.percentageValue[0] + this.percentageValue[1])
              );
            //  this.banksPaychecks.controls[j].get('amount')?.patchValue(0);
            this.totalAmount = this.amountInfo;
          }
        }
      }
      if (j === 3) {
        this.percentageValue[j] =
          this.banksPaychecks.controls[j].get('percentage')?.value;
        this.amountValue[j] =
          this.banksPaychecks.controls[j].get('amount')?.value;
        if (
          this.banksPaychecks.controls[j].get('paycheckDistribution')?.value ===
          ''
        ) {
          if (this.payCheckDistValue === 1) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(1);
            this.banksPaychecks.controls[j]
              .get('amount')
              ?.patchValue(
                this.amountInfo -
                  (this.amountValue[0] +
                    this.amountValue[1] +
                    this.amountValue[2])
              );
            this.totalPercentage = 100;
          }
          if (this.payCheckDistValue === 2) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(2);
            this.banksPaychecks.controls[j]
              .get('percentage')
              ?.patchValue(
                100 -
                  (this.percentageValue[0] +
                    this.percentageValue[1] +
                    this.percentageValue[2])
              );
            //  this.banksPaychecks.controls[j].get('amount')?.patchValue(0);
            this.totalAmount = this.amountInfo;
          }
        }
      }
      if (j === 4) {
        this.percentageValue[j] =
          this.banksPaychecks.controls[j].get('percentage')?.value;
        this.amountValue[j] =
          this.banksPaychecks.controls[j].get('amount')?.value;
        if (
          this.banksPaychecks.controls[j].get('paycheckDistribution')?.value ===
          ''
        ) {
          if (this.payCheckDistValue === 1) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(1);
            this.banksPaychecks.controls[j]
              .get('amount')
              ?.patchValue(
                this.amountInfo -
                  (this.amountValue[0] +
                    this.amountValue[1] +
                    this.amountValue[2] +
                    this.amountValue[3])
              );
            this.totalPercentage = 100;
          }
          if (this.payCheckDistValue === 2) {
            this.banksPaychecks.controls[j]
              .get('paycheckDistribution')
              ?.patchValue(2);
            this.banksPaychecks.controls[j]
              .get('percentage')
              ?.patchValue(
                100 -
                  (this.percentageValue[0] +
                    this.percentageValue[1] +
                    this.percentageValue[2] +
                    this.percentageValue[3])
              );
            // this.banksPaychecks?.controls[j]?.get('amount')?.patchValue(0);
            this.totalAmount = this.amountInfo;
          }
        }
      }
    }

    if (this.payCheckDistValue === 2) {
      this.totalPercentage = 0;
      for (let k = 0; k < this.banksPaychecks?.controls?.length; k++) {
        this.percentage[k] =
          this.banksPaychecks?.controls[k]?.get('percentage')?.value;
        this.totalPercentage = this.totalPercentage + this.percentage[k];
      }
    }
    if (this.payCheckDistValue === 1) {
      this.totalAmount = 0;
      for (let k = 0; k < this.banksPaychecks?.controls?.length; k++) {
        this.amount[k] =
          // tslint:disable-next-line: radix
          parseInt(this.banksPaychecks?.controls[k]?.get('amount')?.value);
        this.totalAmount = this.totalAmount + this.amount[k];
      }
    }
    if (this.payCheckDistValue.toString() === '') {
      this.totalPercentage = 100;
      this.totalAmount = this.amountInfo;
    }
  }

  addBankPaycheck(): FormGroup {
    return this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('[A-Za-z ]{1,50}'),
        ],
      ],
      accountType: ['', Validators.required],
      bankAccountId: [''],
      bankName: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('[A-Za-z ]{1,50}'),
        ],
      ],
      routingNumber: [
        '',
        [
          Validators.required,
          Validators.maxLength(9),
          Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
        ],
      ],
      accountNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
        ],
      ],
      branchName: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('^[a-zA-Z0-9 ]+$'),
        ],
      ],
      paycheckDistribution: ['', Validators.required],
      percentage: [''],
      amount: [
        '',
        [
          Validators.maxLength(10),
          Validators.pattern('^[0-9]+([.][0-9]{1,2})?$'),
        ],
      ],
      fileId: [''],
      fileName: [''],
      fileExtension: [''],
      file: [''],
    });
  }

  paycheckDistributionSelection(rec: AbstractControl, i: number): void {
    this.totalPercentage = 0;
    this.totalAmount = 0;
    if (
      this.banksPaychecks.controls[0].get('paycheckDistribution')?.value === 1
    ) {
      this.distributionSelection = 1;
      // tslint:disable-next-line: prefer-for-of
      for (i = 0; i < this.banksPaychecks.controls.length; i++) {
        if (i === 0) {
          this.arrPercentage[i] =
            this.banksPaychecks.controls[i].get('percentage')?.value;
          // tslint:disable-next-line: radix
          if (this.banksPaychecks.controls[i].get('amount')?.value) {
            this.banksPaychecks.controls[i]
              .get('amount')
              ?.patchValue(this.arrAmount[i]);
          } else {
            this.banksPaychecks.controls[i]
              .get('amount')
              ?.patchValue(this.amountInfo);
          }
        }
        if (i === 1) {
          this.arrPercentage[i] =
            this.banksPaychecks.controls[i].get('percentage')?.value;
          if (this.banksPaychecks.controls[i].get('amount')?.value) {
            this.banksPaychecks.controls[i]
              .get('amount')
              ?.patchValue(this.amountInfo - this.arrAmount[0]);
          } else {
            this.banksPaychecks.controls[i].get('amount')?.patchValue(0);
          }
        }
        if (i === 2) {
          this.arrPercentage[i] =
            this.banksPaychecks.controls[i].get('percentage')?.value;
          if (this.banksPaychecks.controls[i].get('amount')?.value) {
            this.banksPaychecks.controls[i]
              .get('amount')
              ?.patchValue(
                this.amountInfo - (this.arrAmount[0] + this.arrAmount[1])
              );
          } else {
            this.banksPaychecks.controls[i].get('amount')?.patchValue(0);
          }
        }
        if (i === 3) {
          this.arrPercentage[i] =
            this.banksPaychecks.controls[i].get('percentage')?.value;
          if (this.banksPaychecks.controls[i].get('amount')?.value) {
            this.banksPaychecks.controls[i]
              .get('amount')
              ?.patchValue(
                this.amountInfo -
                  (this.arrAmount[0] + this.arrAmount[1] + this.arrAmount[2])
              );
          } else {
            this.banksPaychecks.controls[i].get('amount')?.patchValue(0);
          }
        }
        if (i === 4) {
          this.arrPercentage[i] =
            this.banksPaychecks.controls[i].get('percentage')?.value;
          if (this.banksPaychecks.controls[i].get('amount')?.value) {
            this.banksPaychecks.controls[i]
              .get('amount')
              ?.patchValue(
                this.amountInfo -
                  (this.arrAmount[0] +
                    this.arrAmount[1] +
                    this.arrAmount[2] +
                    this.arrAmount[3])
              );
          } else {
            this.banksPaychecks.controls[i].get('amount')?.patchValue(0);
          }
        }
      }
    }

    if (
      this.banksPaychecks.controls[0].get('paycheckDistribution')?.value === 2
    ) {
      this.distributionSelection = 2;
      // tslint:disable-next-line: prefer-for-of
      for (i = 0; i < this.banksPaychecks.controls.length; i++) {
        if (i === 0) {
          this.arrAmount[i] =
            // tslint:disable-next-line: radix
            parseInt(this.banksPaychecks.controls[i].get('amount')?.value);
          if (this.arrPercentage[i]) {
            this.banksPaychecks.controls[i]
              .get('percentage')
              ?.patchValue(this.arrPercentage[i]);
          } else {
            this.banksPaychecks.controls[i].get('percentage')?.patchValue(100);
          }
        }
        if (i === 1) {
          this.arrAmount[i] =
            // tslint:disable-next-line: radix
            parseInt(this.banksPaychecks.controls[i].get('amount')?.value);
          if (this.arrPercentage[i]) {
            this.banksPaychecks.controls[i]
              .get('percentage')
              ?.patchValue(100 - this.arrPercentage[0]);
          } else {
            this.banksPaychecks.controls[i].get('percentage')?.patchValue(0);
          }
        }
        if (i === 2) {
          this.arrAmount[i] =
            // tslint:disable-next-line: radix
            parseInt(this.banksPaychecks.controls[i].get('amount')?.value);
          if (this.arrPercentage[i]) {
            this.banksPaychecks.controls[i]
              .get('percentage')
              ?.patchValue(
                100 - (this.arrPercentage[0] + this.arrPercentage[1])
              );
          } else {
            this.banksPaychecks.controls[i].get('percentage')?.patchValue(0);
          }
        }
        if (i === 3) {
          this.arrAmount[i] =
            // tslint:disable-next-line: radix
            parseInt(this.banksPaychecks.controls[i].get('amount')?.value);
          if (this.arrPercentage[i]) {
            this.banksPaychecks.controls[i]
              .get('percentage')
              ?.patchValue(
                100 -
                  (this.arrPercentage[0] +
                    this.arrPercentage[1] +
                    this.arrPercentage[2])
              );
          } else {
            this.banksPaychecks.controls[i].get('percentage')?.patchValue(0);
          }
        }
        if (i === 4) {
          this.arrAmount[i] =
            // tslint:disable-next-line: radix
            parseInt(this.banksPaychecks.controls[i].get('amount')?.value);
          if (this.arrPercentage[i]) {
            this.banksPaychecks.controls[i]
              .get('percentage')
              ?.patchValue(
                100 -
                  (this.arrPercentage[0] +
                    this.arrPercentage[1] +
                    this.arrPercentage[2] +
                    this.arrPercentage[3])
              );
          } else {
            this.banksPaychecks.controls[i].get('percentage')?.patchValue(0);
          }
        }
      }
    }

    if (
      this.banksPaychecks.controls[0].get('paycheckDistribution')?.value === 2
    ) {
      this.totalPercentage = 0;
      this.totalAmount = this.amountInfo;
      for (let s = 0; s < this.banksPaychecks.controls.length; s++) {
        this.percentage[s] =
          this.banksPaychecks.controls[s].get('percentage')?.value;
        this.totalPercentage = this.totalPercentage + this.percentage[s];
      }
    }
    if (
      this.banksPaychecks.controls[0].get('paycheckDistribution')?.value === 1
    ) {
      this.totalPercentage = 100;
      this.totalAmount = 0;
      for (let s = 0; s < this.banksPaychecks.controls.length; s++) {
        this.arrAmount[s] =
          // tslint:disable-next-line: radix
          parseInt(this.banksPaychecks.controls[s].get('amount')?.value);
        this.totalAmount = this.totalAmount + this.arrAmount[s];
      }
    }
  }

  fileEvent(fileInput: Event, rec: AbstractControl, i: number): void {
    this.chooseFileToggle[i] = false;
    const target = fileInput.target as HTMLInputElement;
    const file: File = (target?.files as FileList)[0];
    this.attachedfileName[i] = file?.name;
    this.attachedfileExt[i] = file?.name?.split('.')[1];
    rec?.get('fileName')?.patchValue(file?.name);
    rec?.get('file')?.patchValue(file);
    this.fileAttached = rec?.get('fileName')?.value;
    if (!rec?.get('fileId')?.value) {
      this.isNewDocument[i] = true;
    }
    if (this.attachedfileExt[i] === 'pdf') {
      this.imgName[i] = 'icn-pdf.svg';
    }
    if (this.fileExt.includes(this.attachedfileExt[i])) {
      this.imgName[i] = 'icn-image.svg';
    }
    rec?.get('fileExtension')?.patchValue('');
    this.bankPaycheckForm.markAsDirty();
  }

  saveContinue(bankPaycheckForm: FormGroup): void {
    this.onSaveBankPaycheckInfo();
    bankPaycheckForm.markAsPristine();
    this.stepper.next();
  }

  onSaveBankPaycheckInfo(): void {
    this.resourceValue = this.employeeOnboardingId;
    this.bankAccountCount = this.banksPaychecks.length;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.banksPaychecks.controls.length; i++) {
      this.name[i] = this.banksPaychecks.controls[i].get('name')?.value;
      this.accountType[i] =
        this.banksPaychecks.controls[i].get('accountType')?.value;
      this.bankAccountId[i] =
        this.banksPaychecks.controls[i].get('bankAccountId')?.value;
      this.bankName[i] = this.banksPaychecks.controls[i].get('bankName')?.value;
      this.routingNumber[i] =
        this.banksPaychecks.controls[i].get('routingNumber')?.value;
      this.accountNumber[i] =
        this.banksPaychecks.controls[i].get('accountNumber')?.value;
      this.branchName[i] =
        this.banksPaychecks.controls[i].get('branchName')?.value;
      this.paycheckDistribution[i] = this.banksPaychecks.controls[i].get(
        'paycheckDistribution'
      )?.value;
      this.percentage[i] =
        this.banksPaychecks.controls[i].get('percentage')?.value;
      this.amount[i] = this.banksPaychecks.controls[i].get('amount')?.value;
      this.fileId[i] = this.banksPaychecks.controls[i].get('fileId')?.value;
      this.fileName[i] = this.banksPaychecks.controls[i].get('fileName')?.value;
      this.file[i] = this.banksPaychecks.controls[i].get('file')?.value;
      if (i === 0) {
        this.primaryAccount[i] = true;
      } else {
        this.primaryAccount[i] = false;
      }
    }

    this.candidateOnboardingWorkflowService
      .saveBanksAndPaychecks(
        this.bankAccountCount,
        this.employeeOnboardingId,
        this.bankAccountId,
        this.resourceTypeCode,
        this.resourceValue,
        this.name,
        this.accountType,
        this.bankName,
        this.routingNumber,
        this.accountNumber,
        this.branchName,
        this.paycheckDistribution,
        this.percentage,
        this.amount,
        this.primaryAccount,
        this.fileId,
        this.fileName,
        this.documentPurposeCodeFile,
        this.isNewDocument,
        this.resourceTypeCodeFile,
        this.file,
        this.docDeleteId
      )
      .subscribe(
        (data) => {
          if (data?.errorCode === 0) {
            this.disableAddNew = false;
            this.setBanksAndPaychecks();
            this.matNotificationService.success(
              ':: Banks and Paychecks information updated successfully.'
            );
          }
          else if (data?.errorCode === 30 && data?.errorMessage?.includes('Cannot insert duplicates')){
            this.matNotificationService.warn(
              ':: Unable to save duplicate account and routing numbers'
            );
          }
          else {
            this.matNotificationService.warn(
              ':: Unable to save Banks and Paychecks information'
            );
          }
        },
        (err) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to save successfully');
          console.warn(err);
        }
      );
  }

  onPrevious(e: Event): void {
    this.stepper.selectedIndex = 1;
  }

  removeBankPaycheck(rec: AbstractControl, i: number): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to delete this current bank account details?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (rec?.get('bankAccountId')?.value !== '') {
          this.deleteBankAccount(rec?.get('bankAccountId')?.value);
          this.totalBanksPaychecks = this.totalBanksPaychecks - 1;
          this.chooseFileToggle[i] = true;
        } else {
          this.totalBanksPaychecks = this.totalBanksPaychecks - 1;
          this.banksPaychecks?.removeAt(i);
          this.bankPaycheckForm?.markAsDirty();
          this.bankPaycheckForm?.controls?.banksPaychecks?.markAsDirty();
          this.fileAttached = 'fileNme';
          this.attachedfileName[i] = '';
          this.chooseFileToggle[i] = true;
          rec?.get('fileName')?.patchValue('');
        }
        if (this.distributionSelection === 2) {
          this.totalPercentage = 0;
          for (let l = 0; l < this.totalBanksPaychecks; l++) {
            this.percentage[l] =
              this.banksPaychecks.controls[l].get('percentage')?.value;
            this.totalPercentage = this.totalPercentage + this.percentage[l];
          }
        }
        if (this.distributionSelection === 1) {
          this.totalAmount = 0;
          for (let l = 0; l < this.totalBanksPaychecks; l++) {
            this.amount[l] =
              // tslint:disable-next-line: radix
              parseInt(this.banksPaychecks.controls[l].get('amount')?.value);
            this.totalAmount = this.totalAmount + this.amount[l];
          }
        }
      }
    });
  }

  removeFile(rec: AbstractControl, i: number): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to delete this attached file?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.fileAttached = '';
        if (rec?.get('fileId')?.value !== '') {
          this.docDeleteId[i] = rec?.get('fileId')?.value;
          this.isNewDocument[i] = true;
          this.chooseFileToggle[i] = true;
          this.bankPaycheckForm.markAsDirty();
        } else {
          this.isNewDocument[i] = true;
          this.attachedfileName[i] = '';
          this.chooseFileToggle[i] = true;
          rec?.get('fileName')?.patchValue('');
        }
      }
    });
  }

  updatePercentControl(rec: AbstractControl, value: number, i: number): void {
    rec?.get('percentage')?.patchValue(value);
    // tslint:disable-next-line: prefer-for-of
    this.totalPercentage = 0;
    for (let z = 0; z < this.banksPaychecks.controls.length; z++) {
      this.percentage[z] =
        this.banksPaychecks.controls[z].get('percentage')?.value;
      this.totalPercentage = this.totalPercentage + this.percentage[z];
    }
  }

  updateAmountControl(rec: AbstractControl, value: string, i: number): void {
    // tslint:disable-next-line: radix
    rec?.get('amount')?.patchValue(parseInt(value));
    // tslint:disable-next-line: prefer-for-of
    this.totalAmount = 0;
    for (let z = 0; z < this.banksPaychecks.controls.length; z++) {
      this.amount[z] =
        // tslint:disable-next-line: radix
        parseInt(this.banksPaychecks.controls[z].get('amount')?.value);
      this.totalAmount = this.totalAmount + this.amount[z];
    }
  }

  // tslint:disable-next-line: no-any
  checkUserSelection(CalculationTypeCode: number, index: number): any {
    // tslint:disable-next-line: prefer-for-of
    for (let r = 0; r < this.bankPaycheckInfo?.length; r++) {
      if (index === 0) {
        this.paycheckDistributionValue = this.banksPaychecks.controls[
          index
        ].get('paycheckDistribution')?.value;
      } else if (index > 0) {
        this.banksPaychecks.controls[index]
          .get('paycheckDistribution')
          ?.patchValue(this.paycheckDistributionValue);
        if (this.paycheckDistributionValue === 2) {
          if (CalculationTypeCode === 1) {
            return true;
          }
        }
        if (this.paycheckDistributionValue === 1) {
          if (CalculationTypeCode === 2) {
            return true;
          }
        }
      }
    }
  }

  downloadDocument(fileId: string, displayName: string): void {
    if (fileId) {
      this.documentsService.downloadDocumentFile(fileId).subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          const fileURL = URL.createObjectURL(file);
          let fileName = '';
          if (displayName.split('.')[1] === 'pdf') {
            fileName = displayName.split('.')[0];
          } else {
            fileName = displayName;
          }
          saveAs(fileURL, fileName);
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  previewCancelChequeDocument(
    docId: string,
    docName: string,
    docExt: string
  ): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDocId: docId,
      currentDocName: docName,
      currentFileExt: docExt,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      PreviewCancelChequeComponent,
      dialogConfig
    );
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.hrComments = JSON.parse(data?.result);
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));

            // get the comment for specific section : start
            this.keysSectionWise = [];
            if (this.hrComments) {
              for (const key of Object.keys(this.hrComments)) {
                if (key.toString().includes('banksPaychecks')) {
                  this.keysSectionWise.push(key);
                }
              }
            }
            this.countKeysBanksPaychecksInfo = this.keysSectionWise.length;
            // get the comment for specific section : end
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  showHRComment(key: string): void {
    Object.entries(this.hrComments).forEach((comments) => {
      if (comments[0] === key) {
        this.commentValue = comments[1];
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }
}
