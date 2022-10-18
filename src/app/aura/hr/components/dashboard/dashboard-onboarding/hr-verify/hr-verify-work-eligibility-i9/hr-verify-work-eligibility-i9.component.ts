import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output,
} from '@angular/core';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import {
  CandidateOnboardingWorkEligibilityAndI9FormResult,
  TncActionResult,
  USCISResult,
} from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatRadioChange } from '@angular/material/radio';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { DatePipe } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DigitalSignatureComponent } from '../../../../../../../shared/components/digital-signature/digital-signature.component';
import { ActiveUserInfoService } from '../../../../../../../core/service/active-user-info.service';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import { UscisCaseStatus } from '../../../../../../../aura/hr/enum/uscisCaseStatus.enum';
import { CaseResultsComponent } from './case-results/case-results.component';
import { PhotoMatch } from '../../../../../../../aura/hr/enum/photoMatch.enum';
import { UploadDocumentsComponent } from '../../../../../../../shared/components/upload-documents/upload-documents.component';
import { PopupDialogBoxComponent } from '../../../../../../../shared/components/popup-dialog-box/popup-dialog-box.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { FutureDateValidator } from '../../../../../../../shared/custom-validators/custom-future-date';

@Component({
  selector: 'app-hr-verify-work-eligibility-i9',
  templateUrl: './hr-verify-work-eligibility-i9.component.html',
  styleUrls: ['./hr-verify-work-eligibility-i9.component.scss'],
  providers: [DatePipe],
})
export class HrVerifyWorkEligibilityI9Component implements OnInit {
  @Input() employeeOnboardingId!: string;
  @Input() countKeysWorkEligibilityInfo!: number;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  workEligibilityAndI9FormResult!: CandidateOnboardingWorkEligibilityAndI9FormResult;
  tncActionResult!: TncActionResult;
  photoMatchResult!: TncActionResult;
  i9Form!: FormGroup;
  tncForm!: FormGroup;
  docURL = '';
  isLoadingI9Form = false;
  isLoading = false;
  citizenshipStatusCode!: number;
  categoryA = 'LIST_A';
  categoryB = 'LIST_B';
  categoryC = 'LIST_C';
  listADocs = new Map<number, string>();
  listBDocs = new Map<number, string>();
  listCDocs = new Map<number, string>();
  listBDocumentTypeCode!: number;
  candSignURL = '';
  prepSignURL = '';
  employerSignURL = '';
  commentForm!: FormGroup;
  comment = '';
  commentKey = '';
  // tslint:disable-next-line: no-any
  commentValue!: any;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentLength!: number;
  hrCommentsMap = new Map<string, string>();
  showUpdateButton = false;
  @ViewChild(MatMenuTrigger) commentMenusTrigger!: MatMenuTrigger;
  signDate!: Date;
  selectedIndex = 0;
  maxNumberOfTabs = 1;
  radioBtnValue = 0;
  index = 0;
  showRowOne = true;
  showRowTwo = false;
  showRowThree = false;
  errorMsg = '';
  tabIndex = 0;
  removedRow: number[] = [];
  signEmployerStatus = false;
  employerSignId!: string;
  employerSignFile!: File;
  candSignFile!: File;
  prepSignFile!: File;
  userId!: string;
  languages: string[] = [];
  pdfId!: string;
  pdfDisplayName!: string;
  uscisCreateData!: USCISResult;
  photoMatchValue!: string;
  // tslint:disable-next-line: no-any
  empPhoto!: string;
  listADropdownValue = '';
  listBDropdownValue = '';
  listCDropdownValue = '';
  tncEmployeeNotified!: boolean;
  tncRefer!: boolean;
  tncLanguage = '';
  referValue!: boolean;
  tncRadioBtnValue = 0;
  driverSateBtnValue = 0;
  driverSateBtnSelectedCode!: number;
  driverBtnChecked!: boolean;
  stateBtnChecked!: boolean;
  noExpirationDate!: boolean;
  tncLangDropdownValue = '';
  showTabs = true;
  showPdf = false;
  showPhotoMatch = false;
  showAuthConfirm = false;
  showFinalNonConfirm = false;
  showResubmit = false;
  showManualReview = false;
  showPendingReferral = false;
  showNonConfirmSuccess = false;
  showQueued = false;
  showReferred = false;
  showClossed = false;
  showUnSuccessfullMsg = false;
  unSuccessfullErrorMsg = '';
  dialogConfirmRefTnc!: MatDialogRef<PopupDialogBoxComponent>;
  mapState = new Map<number, string>();
  keysSectionWise: string[] = [];
  countKeysSectionWise = 0;
  @Output() checkUscisStatus = new EventEmitter();
  @Output() checkCommentLength = new EventEmitter();

  constructor(
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private documentsService: DocumentsService,
    private lookupCodeService: LookupService,
    private domSanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private activeUserInfo: ActiveUserInfoService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private dialogConfirm: MatDialog,
    private dialogConfirmTnc: MatDialog,
    private lookupService: LookupService
  ) { }

  ngOnInit(): void {
    this.languages.push('English');
    this.languages.push('Spanish');
    this.userId = this.activeUserInfo?.getActiveUserInfo()?.userId;
    this.signDate = new Date();
    this.getStateLookup();
    this.i9Form = this.fb.group({
      listADocumentCodeOne: [null, [Validators.required]],
      listAIssuingAuthorityOne: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listADocumentNumberOne: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listAExpirationDateOne: [null, [Validators.required, FutureDateValidator.futureDateCheck()]],
      listADocumentCodeTwo: [''],
      listAIssuingAuthorityTwo: ['', [Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listADocumentNumberTwo: ['', [Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listAExpirationDateTwo: [''],
      listADocumentCodeThree: [''],
      listAIssuingAuthorityThree: ['', [Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listADocumentNumberThree: ['', [Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listAExpirationDateThree: [''],
      listBDocumentCode: [null, [Validators.required]],
      listBIssuingAuthority: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listBDocumentNumber: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listBExpirationDate: [null, [Validators.required, FutureDateValidator.futureDateCheck()]],
      listBStateCode: [''],
      listBDriverSateRadioGroup: [''],
      listBDriver: [''],
      listBState: [''],
      listBNoExpirationDate: [''],
      listCDocumentCode: [null, [Validators.required]],
      listCIssuingAuthority: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listCDocumentNumber: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]],
      listCExpirationDate: [null, [Validators.required, FutureDateValidator.futureDateCheck()]],
      listABCRadioGroup: [''],
    });

    this.tncForm = this.fb.group({
      tncApplied: [''],
      tncLanguage: ['', Validators.required],
      tncRefer: [''],
    });

    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });

    this.getCandidateWorkEligibilityAndI9FormInfo();
  }

  setListAListBListCValidators(): void {
    const listADocumentCodeOneControl = this.i9Form.get('listADocumentCodeOne');
    const listAIssuingAuthorityOneControl = this.i9Form.get(
      'listAIssuingAuthorityOne'
    );
    const listADocumentNumberOneControl = this.i9Form.get(
      'listADocumentNumberOne'
    );
    const listAExpirationDateOneControl = this.i9Form.get(
      'listAExpirationDateOne'
    );

    const listBDocumentCodeControl = this.i9Form.get('listBDocumentCode');
    const listBIssuingAuthorityControl = this.i9Form.get(
      'listBIssuingAuthority'
    );
    const listBDocumentNumberControl = this.i9Form.get('listBDocumentNumber');
    const listBExpirationDateControl = this.i9Form.get('listBExpirationDate');

    const listCDocumentCodeControl = this.i9Form.get('listCDocumentCode');
    const listCIssuingAuthorityControl = this.i9Form.get(
      'listCIssuingAuthority'
    );
    const listCDocumentNumberControl = this.i9Form.get('listCDocumentNumber');
    const listCExpirationDateControl = this.i9Form.get('listCExpirationDate');

    if (this.radioBtnValue === 1 || this.radioBtnValue === 2) {
      if (this.radioBtnValue === 1) {
        listADocumentCodeOneControl?.setValidators([Validators.required]);
        listAIssuingAuthorityOneControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
        listADocumentNumberOneControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
        listAExpirationDateOneControl?.setValidators([Validators.required, FutureDateValidator.futureDateCheck()]);
        listBDocumentCodeControl?.setValidators(null);
        listBIssuingAuthorityControl?.setValidators(null);
        listBDocumentNumberControl?.setValidators(null);
        listBExpirationDateControl?.setValidators(null);
        listCDocumentCodeControl?.setValidators(null);
        listCIssuingAuthorityControl?.setValidators(null);
        listCDocumentNumberControl?.setValidators(null);
        listCExpirationDateControl?.setValidators(null);
      }

      if (this.radioBtnValue === 2) {
        listADocumentCodeOneControl?.setValidators(null);
        listAIssuingAuthorityOneControl?.setValidators(null);
        listADocumentNumberOneControl?.setValidators(null);
        listAExpirationDateOneControl?.setValidators(null);
        listBDocumentCodeControl?.setValidators([Validators.required]);
        listBIssuingAuthorityControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
        listBDocumentNumberControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
        listBExpirationDateControl?.setValidators([Validators.required, FutureDateValidator.futureDateCheck()]);
        listCDocumentCodeControl?.setValidators([Validators.required]);
        listCIssuingAuthorityControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
        listCDocumentNumberControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
        listCExpirationDateControl?.setValidators([Validators.required, FutureDateValidator.futureDateCheck()]);
      }
      listADocumentCodeOneControl?.updateValueAndValidity();
      listAIssuingAuthorityOneControl?.updateValueAndValidity();
      listADocumentNumberOneControl?.updateValueAndValidity();
      listAExpirationDateOneControl?.updateValueAndValidity();

      listBDocumentCodeControl?.updateValueAndValidity();
      listBIssuingAuthorityControl?.updateValueAndValidity();
      listBDocumentNumberControl?.updateValueAndValidity();
      listBExpirationDateControl?.updateValueAndValidity();

      listCDocumentCodeControl?.updateValueAndValidity();
      listCIssuingAuthorityControl?.updateValueAndValidity();
      listCDocumentNumberControl?.updateValueAndValidity();
      listCExpirationDateControl?.updateValueAndValidity();
    }

    this.i9Form
      ?.get('listABCRadioGroup')
      ?.valueChanges.subscribe((listSelection) => {
        if (listSelection === '1') {
          listADocumentCodeOneControl?.setValidators([Validators.required]);
          listAIssuingAuthorityOneControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
          listADocumentNumberOneControl?.setValidators([Validators.required]);
          listAExpirationDateOneControl?.setValidators([Validators.required, FutureDateValidator.futureDateCheck()]);
          listBDocumentCodeControl?.setValidators(null);
          listBIssuingAuthorityControl?.setValidators(null);
          listBDocumentNumberControl?.setValidators(null);
          listBExpirationDateControl?.setValidators(null);
          listCDocumentCodeControl?.setValidators(null);
          listCIssuingAuthorityControl?.setValidators(null);
          listCDocumentNumberControl?.setValidators(null);
          listCExpirationDateControl?.setValidators(null);
        }

        if (listSelection === '2') {
          listADocumentCodeOneControl?.setValidators(null);
          listAIssuingAuthorityOneControl?.setValidators(null);
          listADocumentNumberOneControl?.setValidators(null);
          listAExpirationDateOneControl?.setValidators(null);
          listBDocumentCodeControl?.setValidators([Validators.required]);
          listBIssuingAuthorityControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
          listBDocumentNumberControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
          listBExpirationDateControl?.setValidators([Validators.required, FutureDateValidator.futureDateCheck()]);
          listCDocumentCodeControl?.setValidators([Validators.required]);
          listCIssuingAuthorityControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
          listCDocumentNumberControl?.setValidators([Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]);
          listCExpirationDateControl?.setValidators([Validators.required, FutureDateValidator.futureDateCheck()]);
        }

        listADocumentCodeOneControl?.updateValueAndValidity();
        listAIssuingAuthorityOneControl?.updateValueAndValidity();
        listADocumentNumberOneControl?.updateValueAndValidity();
        listAExpirationDateOneControl?.updateValueAndValidity();

        listBDocumentCodeControl?.updateValueAndValidity();
        listBIssuingAuthorityControl?.updateValueAndValidity();
        listBDocumentNumberControl?.updateValueAndValidity();
        listBExpirationDateControl?.updateValueAndValidity();

        listCDocumentCodeControl?.updateValueAndValidity();
        listCIssuingAuthorityControl?.updateValueAndValidity();
        listCDocumentNumberControl?.updateValueAndValidity();
        listCExpirationDateControl?.updateValueAndValidity();
      });
  }

  getStateLookup(): void {
    this.lookupService.getStateCode().subscribe((data) => {
      for (const state of data?.result) {
        this.mapState.set(state?.lookupCode, state?.description);
      }
    });
  }

  getListsOfDocument(category: string): void {
    this.lookupCodeService
      .getListOfUSCISDocuments(this.citizenshipStatusCode, category)
      .subscribe((data) => {
        if (data?.result) {
          for (const docsList of data?.result) {
            if (category === 'LIST_A') {
              this.listADocs.set(
                docsList?.thirdPartyLookupCode,
                docsList?.name
              );
            } else if (category === 'LIST_B') {
              this.listBDocs.set(
                docsList?.thirdPartyLookupCode,
                docsList?.name
              );
            } else if (category === 'LIST_C') {
              this.listCDocs.set(
                docsList?.thirdPartyLookupCode,
                docsList?.name
              );
            }
          }
        }
      });
  }

  getCandidateWorkEligibilityAndI9FormInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingWorkEligibilityAndI9Form(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.workEligibilityAndI9FormResult = data?.result;
          this.citizenshipStatusCode =
            this.workEligibilityAndI9FormResult?.citizenshipStatusCode;
          this.setCandidateSignDocumentId(
            // tslint:disable-next-line: no-non-null-assertion
            this.workEligibilityAndI9FormResult?.candidateSignDocumentId!
          );
          this.setPreparerSignDocumentId(
            this.workEligibilityAndI9FormResult?.preparerSignDocumentId
          );
          this.setEmployerSignDocumentId(
            // tslint:disable-next-line: no-non-null-assertion
            this.workEligibilityAndI9FormResult?.employerSignDocumentId!
          );

          if (this.workEligibilityAndI9FormResult?.listADocCode2 !== null) {
            this.showRowTwo = true;
          }
          if (this.workEligibilityAndI9FormResult?.listADocCode3 !== null) {
            this.showRowThree = true;
          }

          this.i9Form.patchValue({
            listADocumentCodeOne:
              this.workEligibilityAndI9FormResult?.listADocCode1,
            listAIssuingAuthorityOne:
              this.workEligibilityAndI9FormResult?.listADocIssuingAuthority1,
            listADocumentNumberOne:
              this.workEligibilityAndI9FormResult?.listADocNumber1,
            // tslint:disable-next-line: no-non-null-assertion
            listAExpirationDateOne: this.datePipe.transform(
              this.workEligibilityAndI9FormResult?.listADocExpirationDate1,
              'yyyy-MM-dd'
            )!,
            listADocumentCodeTwo:
              this.workEligibilityAndI9FormResult?.listADocCode2,
            listAIssuingAuthorityTwo:
              this.workEligibilityAndI9FormResult?.listADocIssuingAuthority2,
            listADocumentNumberTwo:
              this.workEligibilityAndI9FormResult?.listADocNumber2,
            // tslint:disable-next-line: no-non-null-assertion
            listAExpirationDateTwo: this.datePipe.transform(
              this.workEligibilityAndI9FormResult?.listADocExpirationDate2,
              'yyyy-MM-dd'
            )!,
            listADocumentCodeThree:
              this.workEligibilityAndI9FormResult?.listADocCode3,
            listAIssuingAuthorityThree:
              this.workEligibilityAndI9FormResult?.listADocIssuingAuthority3,
            listADocumentNumberThree:
              this.workEligibilityAndI9FormResult?.listADocNumber3,
            // tslint:disable-next-line: no-non-null-assertion
            listAExpirationDateThree: this.datePipe.transform(
              this.workEligibilityAndI9FormResult?.listADocExpirationDate3,
              'yyyy-MM-dd'
            )!,
            listBDocumentCode:
              this.workEligibilityAndI9FormResult?.listBDocCode,
            listBIssuingAuthority:
              this.workEligibilityAndI9FormResult?.listBDocIssuingAuthority,
            listBDocumentNumber:
              this.workEligibilityAndI9FormResult?.listBDocNumber,
            // tslint:disable-next-line: no-non-null-assertion
            listBExpirationDate: this.datePipe.transform(
              this.workEligibilityAndI9FormResult?.listBDocExpirationDate,
              'yyyy-MM-dd'
            )!,
            listBStateCode: this.workEligibilityAndI9FormResult?.usStateCode,
            listBNoExpirationDate:
              this.workEligibilityAndI9FormResult?.noExpirationDate,
            listCDocumentCode:
              this.workEligibilityAndI9FormResult?.listCDocCode,
            listCIssuingAuthority:
              this.workEligibilityAndI9FormResult?.listCDocIssuingAuthority,
            listCDocumentNumber:
              this.workEligibilityAndI9FormResult?.listCDocNumber,
            // tslint:disable-next-line: no-non-null-assertion
            listCExpirationDate: this.datePipe.transform(
              this.workEligibilityAndI9FormResult?.listCDocExpirationDate,
              'yyyy-MM-dd'
            )!,
          });

          if (
            this.workEligibilityAndI9FormResult?.docSubTypeCode?.toString() ===
            '149'
          ) {
            this.driverBtnChecked = true;
          } else if (
            this.workEligibilityAndI9FormResult?.docSubTypeCode?.toString() ===
            '150'
          ) {
            this.stateBtnChecked = true;
          }

          if (this.workEligibilityAndI9FormResult?.noExpirationDate) {
            // tslint:disable-next-line: no-unused-expression
            this.i9Form?.controls?.listBExpirationDate?.disable();
          } else if (!this.workEligibilityAndI9FormResult?.noExpirationDate) {
            // tslint:disable-next-line: no-unused-expression
            this.i9Form?.controls?.listBExpirationDate?.enable();
          }

          if (this.workEligibilityAndI9FormResult?.listBDocCode) {
            // tslint:disable-next-line: radix
            this.listBDocumentTypeCode = parseInt(
              this.workEligibilityAndI9FormResult?.listBDocCode
            );
          }
          if (
            this.workEligibilityAndI9FormResult?.listADocCode1 != null ||
            this.workEligibilityAndI9FormResult?.listADocCode2 != null ||
            this.workEligibilityAndI9FormResult?.listADocCode3 != null
          ) {
            this.radioBtnValue = 1;
          }

          if (
            this.workEligibilityAndI9FormResult?.listBDocCode != null ||
            this.workEligibilityAndI9FormResult?.listCDocCode != null
          ) {
            this.radioBtnValue = 2;
          }
          this.setListAListBListCValidators();
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setCandidateSignDocumentId(docId: string): void {
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

  setPreparerSignDocumentId(docId: string): void {
    this.documentsService.getDocumentFile(docId).subscribe(
      (data) => {
        const file = new Blob([data], { type: 'image/*' });
        const fileURL = URL.createObjectURL(file);
        this.prepSignURL = this.domSanitizer.bypassSecurityTrustUrl(
          fileURL
        ) as string;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  setEmployerSignDocumentId(docId: string): void {
    this.documentsService.getDocumentFile(docId).subscribe(
      (data) => {
        const file = new Blob([data], { type: 'image/*' });
        const fileURL = URL.createObjectURL(file);
        this.employerSignURL = this.domSanitizer.bypassSecurityTrustUrl(
          fileURL
        ) as string;
      },
      (err) => {
        console.warn(err);
      }
    );
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
    return String(phoneNumber);
  }

  onSaveI9FormInfo(): void {
    for (const row of this.removedRow) {
      if (row === 1) {
        this.i9Form.patchValue({
          listADocumentCodeOne: null,
          listAIssuingAuthorityOne: null,
          listADocumentNumberOne: null,
          listAExpirationDateOne: null,
        });
      } else if (row === 2) {
        this.i9Form.patchValue({
          listADocumentCodeTwo: null,
          listAIssuingAuthorityTwo: null,
          listADocumentNumberTwo: null,
          listAExpirationDateTwo: null,
        });
      } else if (row === 3) {
        this.i9Form.patchValue({
          listADocumentCodeThree: null,
          listAIssuingAuthorityThree: null,
          listADocumentNumberThree: null,
          listAExpirationDateThree: null,
        });
      }
    }

    if (this.radioBtnValue?.toString() !== '2') {
      this.workEligibilityAndI9FormResult.listADocCode1 =
        this.i9Form?.controls?.listADocumentCodeOne?.value;
      this.workEligibilityAndI9FormResult.listADocIssuingAuthority1 =
        this.i9Form?.controls?.listAIssuingAuthorityOne?.value;
      this.workEligibilityAndI9FormResult.listADocNumber1 =
        this.i9Form?.controls?.listADocumentNumberOne?.value;
      this.workEligibilityAndI9FormResult.listADocExpirationDate1 =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listAExpirationDateOne?.value,
          'yyyy-MM-dd'
        )!;
      this.workEligibilityAndI9FormResult.listADocCode2 =
        this.i9Form?.controls?.listADocumentCodeTwo?.value;
      this.workEligibilityAndI9FormResult.listADocIssuingAuthority2 =
        this.i9Form?.controls?.listAIssuingAuthorityTwo?.value;
      this.workEligibilityAndI9FormResult.listADocNumber2 =
        this.i9Form?.controls?.listADocumentNumberTwo?.value;
      this.workEligibilityAndI9FormResult.listADocExpirationDate2 =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listAExpirationDateTwo?.value,
          'yyyy-MM-dd'
        )!;
      this.workEligibilityAndI9FormResult.listADocCode3 =
        this.i9Form?.controls?.listADocumentCodeThree?.value;
      this.workEligibilityAndI9FormResult.listADocIssuingAuthority3 =
        this.i9Form?.controls?.listAIssuingAuthorityThree?.value;
      this.workEligibilityAndI9FormResult.listADocNumber3 =
        this.i9Form?.controls?.listADocumentNumberThree?.value;
      this.workEligibilityAndI9FormResult.listADocExpirationDate3 =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listAExpirationDateThree?.value,
          'yyyy-MM-dd'
        )!;

      // Null list B & C Data
      this.i9Form.patchValue({
        listBDocumentCode: null,
        listBIssuingAuthority: null,
        listBDocumentNumber: null,
        listBExpirationDate: null,
        listCDocumentCode: null,
        listCIssuingAuthority: null,
        listCDocumentNumber: null,
        listCExpirationDate: null,
        listBStateCode: null,
        listBNoExpirationDate: false,
      });

      this.workEligibilityAndI9FormResult.listBDocCode =
        this.i9Form?.controls?.listBDocumentCode?.value;
      this.workEligibilityAndI9FormResult.listBDocIssuingAuthority =
        this.i9Form?.controls?.listBIssuingAuthority?.value;
      this.workEligibilityAndI9FormResult.listBDocNumber =
        this.i9Form?.controls?.listBDocumentNumber?.value;
      this.workEligibilityAndI9FormResult.listBDocExpirationDate =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listBExpirationDate?.value,
          'yyyy-MM-dd'
        )!;

      this.workEligibilityAndI9FormResult.docSubTypeCode = null;
      this.workEligibilityAndI9FormResult.usStateCode =
        this.i9Form?.controls?.listBStateCode?.value;
      this.workEligibilityAndI9FormResult.noExpirationDate =
        this.i9Form?.controls?.listBNoExpirationDate?.value;
      this.workEligibilityAndI9FormResult.listCDocCode =
        this.i9Form?.controls?.listCDocumentCode?.value;
      this.workEligibilityAndI9FormResult.listCDocIssuingAuthority =
        this.i9Form?.controls?.listCIssuingAuthority?.value;
      this.workEligibilityAndI9FormResult.listCDocNumber =
        this.i9Form?.controls?.listCDocumentNumber?.value;
      this.workEligibilityAndI9FormResult.listCDocExpirationDate =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listCExpirationDate?.value,
          'yyyy-MM-dd'
        )!;
    }

    if (this.radioBtnValue?.toString() === '2') {
      this.workEligibilityAndI9FormResult.listBDocCode =
        this.i9Form?.controls?.listBDocumentCode?.value;
      this.workEligibilityAndI9FormResult.listBDocIssuingAuthority =
        this.i9Form?.controls?.listBIssuingAuthority?.value;
      this.workEligibilityAndI9FormResult.listBDocNumber =
        this.i9Form?.controls?.listBDocumentNumber?.value;
      this.workEligibilityAndI9FormResult.listBDocExpirationDate =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listBExpirationDate?.value,
          'yyyy-MM-dd'
        )!;
      this.workEligibilityAndI9FormResult.listCDocCode =
        this.i9Form?.controls?.listCDocumentCode?.value;
      this.workEligibilityAndI9FormResult.listCDocIssuingAuthority =
        this.i9Form?.controls?.listCIssuingAuthority?.value;
      this.workEligibilityAndI9FormResult.listCDocNumber =
        this.i9Form?.controls?.listCDocumentNumber?.value;
      this.workEligibilityAndI9FormResult.listCDocExpirationDate =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listCExpirationDate?.value,
          'yyyy-MM-dd'
        )!;

      // tslint:disable-next-line: max-line-length
      this.driverSateBtnSelectedCode =
        this.i9Form?.controls?.listBDriverSateRadioGroup?.value;
      if (this.driverSateBtnSelectedCode.toString() === '1') {
        this.workEligibilityAndI9FormResult.docSubTypeCode = '149';
      } else if (this.driverSateBtnSelectedCode.toString() === '2') {
        this.workEligibilityAndI9FormResult.docSubTypeCode = '150';
      }
      this.workEligibilityAndI9FormResult.usStateCode =
        this.i9Form?.controls?.listBStateCode?.value;
      this.workEligibilityAndI9FormResult.noExpirationDate =
        this.i9Form?.controls?.listBNoExpirationDate?.value;

      // Null List A Data
      this.i9Form.patchValue({
        listADocumentCodeOne: null,
        listAIssuingAuthorityOne: null,
        listADocumentNumberOne: null,
        listAExpirationDateOne: null,
        listADocumentCodeTwo: null,
        listAIssuingAuthorityTwo: null,
        listADocumentNumberTwo: null,
        listAExpirationDateTwo: null,
        listADocumentCodeThree: null,
        listAIssuingAuthorityThree: null,
        listADocumentNumberThree: null,
        listAExpirationDateThree: null,
      });

      this.workEligibilityAndI9FormResult.listADocCode1 =
        this.i9Form?.controls?.listADocumentCodeOne?.value;
      this.workEligibilityAndI9FormResult.listADocIssuingAuthority1 =
        this.i9Form?.controls?.listAIssuingAuthorityOne?.value;
      this.workEligibilityAndI9FormResult.listADocNumber1 =
        this.i9Form?.controls?.listADocumentNumberOne?.value;
      this.workEligibilityAndI9FormResult.listADocExpirationDate1 =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listAExpirationDateOne?.value,
          'yyyy-MM-dd'
        )!;
      this.workEligibilityAndI9FormResult.listADocCode2 =
        this.i9Form?.controls?.listADocumentCodeTwo?.value;
      this.workEligibilityAndI9FormResult.listADocIssuingAuthority2 =
        this.i9Form?.controls?.listAIssuingAuthorityTwo?.value;
      this.workEligibilityAndI9FormResult.listADocNumber2 =
        this.i9Form?.controls?.listADocumentNumberTwo?.value;
      this.workEligibilityAndI9FormResult.listADocExpirationDate2 =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listAExpirationDateTwo?.value,
          'yyyy-MM-dd'
        )!;
      this.workEligibilityAndI9FormResult.listADocCode3 =
        this.i9Form?.controls?.listADocumentCodeThree?.value;
      this.workEligibilityAndI9FormResult.listADocIssuingAuthority3 =
        this.i9Form?.controls?.listAIssuingAuthorityThree?.value;
      this.workEligibilityAndI9FormResult.listADocNumber3 =
        this.i9Form?.controls?.listADocumentNumberThree?.value;
      this.workEligibilityAndI9FormResult.listADocExpirationDate3 =
        // tslint:disable-next-line: no-non-null-assertion
        this.datePipe.transform(
          this.i9Form?.controls?.listAExpirationDateThree?.value,
          'yyyy-MM-dd'
        )!;
    }

    this.workEligibilityAndI9FormResult.employerSignDocumentId =
      this.employerSignId === undefined
        ? this.workEligibilityAndI9FormResult.employerSignDocumentId
        : this.employerSignId;
    this.workEligibilityAndI9FormResult.i9Status = 'Step2Completed';
    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingWorkEligibilityAndI9Form(
        this.workEligibilityAndI9FormResult
      )
      .subscribe(
        (data) => {
          if (data?.errorCode === 0) {
            this.matNotificationService.success(
              ':: I9 Form Information updated successfully'
            );
            this.i9Form.markAsPristine();
            this.docURL = '';
            this.generateI9Form();
          } else {
            this.matNotificationService.warn(':: Error: ' + data?.errorMessage);
          }
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to update successfully');
          console.warn(error);
        }
      );
  }

  OnListADropDownChange(event: MatSelectChange): void {
    this.listADropdownValue = event.source.triggerValue;
  }

  OnListBDropDownChange(event: MatSelectChange): void {
    this.listBDocumentTypeCode = 0;
    this.listBDropdownValue = event.source.triggerValue;
  }

  OnListCDropDownChange(event: MatSelectChange): void {
    if (
      event?.value?.toString() === '88' ||
      event?.value?.toString() === '89'
    ) {
      this.i9Form?.controls?.listCExpirationDate?.disable();
    } else {
      this.i9Form?.controls?.listCExpirationDate?.enable();
    }
    this.listCDropdownValue = event.source.triggerValue;
  }

  showCheckOptions(event: MatCheckboxChange): void {
    if (event.checked) {
      // tslint:disable-next-line: no-unused-expression
      this.i9Form?.controls?.listBExpirationDate?.disable();
      this.i9Form.patchValue({
        listBExpirationDate: null,
      });
    } else if (!event.checked) {
      // tslint:disable-next-line: no-unused-expression
      this.i9Form?.controls?.listBExpirationDate?.enable();
    }
  }

  nextStep(i9Form: FormGroup): void {
    if (this.selectedIndex !== this.maxNumberOfTabs) {
      this.selectedIndex = this.selectedIndex + 1;
    }

    if (this.tabIndex === 1 && this.showTabs) {
      this.docURL = '';
      this.getComments();
      this.onSaveI9FormInfo();
    }

    if (this.showPdf) {
      this.createUSCISCase();
    }

    if (this.showPhotoMatch) {
      this.photoMatchAPI();
    }
  }

  createUSCISCase(): void {
    this.isLoading = true;
    // tslint:disable-next-line: no-any
    let empOnboardingData: any;
    empOnboardingData = {
      EmployeeOnboardingId: this.employeeOnboardingId,
    };
    this.candidateOnboardingWorkflowService
      .createUSCISCase(empOnboardingData)
      .subscribe(
        (data) => {
          this.uscisCreateData = data?.result;
          this.showTabs = false;
          this.showPdf = false;
          console.log(
            'this.uscisCreateData?.caseStatus',
            this.uscisCreateData?.caseStatus
          );

          if (data?.errorCode === 0) {
            switch (this.uscisCreateData?.caseStatus) {
              case UscisCaseStatus.PhotoMatch:
                this.empPhoto = `data:image/png;base64,${this.uscisCreateData?.data?.document_photo}`;
                this.showPhotoMatch = true;
                break;
              case UscisCaseStatus.PendingReferral:
                this.showPendingReferral = true;
                break;
              case UscisCaseStatus.Referred:
                this.showReferred = true;
                break;
              case UscisCaseStatus.FinalNonConfirmation:
                this.showFinalNonConfirm = true;
                break;
              case UscisCaseStatus.EmploymentAuthorized:
                this.showAuthConfirm = true;
                break;
              case UscisCaseStatus.ManualReview:
                this.showManualReview = true;
                break;
              case UscisCaseStatus.CloseCaseAndResubmit:
                this.showResubmit = true;
                break;
              case UscisCaseStatus.Queued:
                this.showQueued = true;
                break;
              case UscisCaseStatus.Closed:
                if (
                  this.uscisCreateData?.data?.case_eligibility_statement ===
                  UscisCaseStatus.EmploymentAuthorized
                ) {
                  this.showAuthConfirm = true;
                } else {
                  this.showClossed = true;
                }
                break;
            }
          } else {
            this.showUnSuccessfullMsg = true;
            this.unSuccessfullErrorMsg = data?.errorMessage;
          }
          this.checkUscisInitiatedStatus();
          this.isLoading = false;
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to create the case successfully'
          );
          console.warn(error);
          this.isLoading = false;
        }
      );
  }

  photoMatchAPI(): void {
    this.isLoading = true;
    if (this.radioBtnValue.toString() === PhotoMatch.Matching) {
      this.photoMatchValue = PhotoMatch.Matching;
    } else if (this.radioBtnValue.toString() === PhotoMatch.NoImage) {
      this.photoMatchValue = PhotoMatch.NoImage;
    } else if (this.radioBtnValue.toString() === PhotoMatch.NotMatching) {
      this.photoMatchValue = PhotoMatch.NotMatching;
    }

    // tslint:disable-next-line: no-any
    let photoMatchData: any;
    photoMatchData = {
      EmployeeOnboardingId: this.employeeOnboardingId,
      PhotoMatch: this.photoMatchValue,
    };

    this.candidateOnboardingWorkflowService
      .getPhotoMatchData(photoMatchData)
      .subscribe(
        (data) => {
          this.photoMatchResult = data?.result;
          console.log(
            'this.photoMatchResult?.case_status',
            this.photoMatchResult?.case_status
          );
          if (data?.errorCode === 0) {
            switch (this.photoMatchResult?.case_status) {
              case UscisCaseStatus.PendingReferral:
                this.showPendingReferral = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.Referred:
                this.showReferred = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.FinalNonConfirmation:
                this.showFinalNonConfirm = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.EmploymentAuthorized:
                this.showAuthConfirm = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.ManualReview:
                this.showManualReview = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.CloseCaseAndResubmit:
                this.showResubmit = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.Queued:
                this.showQueued = true;
                this.showPhotoMatch = false;
                break;
              case UscisCaseStatus.Closed:
                if (
                  this.photoMatchResult?.case_eligibility_statement ===
                  UscisCaseStatus.EmploymentAuthorized
                ) {
                  this.showAuthConfirm = true;
                  this.showPhotoMatch = false;
                } else {
                  this.showClossed = true;
                  this.showPhotoMatch = false;
                }
                break;
              case UscisCaseStatus.ScanAndUpload:
                const dialogConfig = new MatDialogConfig();
                const obj = {
                  type: 'HRI9Form',
                  employeeOnboardingId: this.employeeOnboardingId,
                };
                dialogConfig.disableClose = true;
                dialogConfig.autoFocus = false;
                dialogConfig.data = {
                  obj,
                };
                this.dialogRef = this.dialogConfirm.open(
                  UploadDocumentsComponent,
                  dialogConfig
                );
                // tslint:disable-next-line: no-any
                this.dialogRef.afterClosed().subscribe((result: any) => {
                  if (result?.errorCode === 0) {
                    console.log('result?.case_status', result?.case_status);
                    switch (result?.case_status) {
                      case UscisCaseStatus.PendingReferral:
                        this.showPendingReferral = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.Referred:
                        this.showReferred = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.FinalNonConfirmation:
                        this.showFinalNonConfirm = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.EmploymentAuthorized:
                        this.showAuthConfirm = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.ManualReview:
                        this.showManualReview = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.CloseCaseAndResubmit:
                        this.showResubmit = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.Queued:
                        this.showQueued = true;
                        this.showPhotoMatch = false;
                        break;
                      case UscisCaseStatus.Closed:
                        if (
                          result?.case_eligibility_statement ===
                          UscisCaseStatus.EmploymentAuthorized
                        ) {
                          this.showAuthConfirm = true;
                          this.showPhotoMatch = false;
                        } else {
                          this.showClossed = true;
                          this.showPhotoMatch = false;
                        }
                        break;
                    }
                  } else {
                    this.showPhotoMatch = false;
                    this.showUnSuccessfullMsg = true;
                    this.unSuccessfullErrorMsg = result?.errorMessage;
                  }
                });
                break;
            }
          } else {
            this.showUnSuccessfullMsg = true;
            this.showPhotoMatch = false;
            this.unSuccessfullErrorMsg = data?.errorMessage;
          }
          this.isLoading = false;
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to create the case successfully'
          );
          console.warn(error);
          this.isLoading = false;
        }
      );
  }

  submitFNC(): void {
    this.isLoading = true;
    this.tncEmployeeNotified = this.tncForm?.controls?.tncApplied?.value;
    this.tncLanguage = this.tncForm?.controls?.tncLanguage?.value;
    this.tncRefer = this.tncForm?.controls?.tncRefer?.value;

    switch (this.tncRefer.toString()) {
      case '1':
        this.referValue = true;
        break;
      case '2':
        this.referValue = false;
        break;
    }
    // tslint:disable-next-line: no-any
    let empOnboardingData: any;
    empOnboardingData = {
      EmployeeOnboardingId: this.employeeOnboardingId,
      EmployeeNotified: this.tncEmployeeNotified,
      Refer: this.referValue,
      Language: this.tncLanguage.toLowerCase(),
    };

    this.candidateOnboardingWorkflowService
      .tncAction(empOnboardingData)
      .subscribe(
        (data) => {
          this.tncActionResult = data?.result;
          console.log(
            'this.tncActionResult?.case_status',
            this.tncActionResult?.case_status
          );
          if (data?.errorCode === 0) {
            switch (this.tncActionResult?.case_status) {
              case UscisCaseStatus.Referred:
                this.showPendingReferral = false;
                this.showNonConfirmSuccess = true;
                break;
              case UscisCaseStatus.Queued:
                this.showPendingReferral = false;
                this.showNonConfirmSuccess = true;
                break;
              case UscisCaseStatus.EmploymentAuthorized:
                this.showPendingReferral = false;
                this.showAuthConfirm = true;
                break;
              case UscisCaseStatus.CloseCaseAndResubmit:
                this.showPendingReferral = false;
                this.showResubmit = true;
                break;
              case UscisCaseStatus.FinalNonConfirmation:
                this.showPendingReferral = false;
                this.showFinalNonConfirm = true;
                break;
            }
          } else {
            this.showPendingReferral = false;
            this.showUnSuccessfullMsg = true;
            this.unSuccessfullErrorMsg = data?.errorMessage;
          }
          this.isLoading = false;
        },
        (error) => {
          console.warn(error);
          this.isLoading = false;
        }
      );
  }

  checkUscisInitiatedStatus(): void {
    this.checkUscisStatus.emit(true);
  }

  downloadFan(): void {
    this.candidateOnboardingWorkflowService
      .getFurtherActionNotice(
        this.employeeOnboardingId,
        this.tncLangDropdownValue
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], { type: 'image/* | application/pdf' });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, 'Further Action Notice.pdf');
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  downloadRdc(): void {
    this.candidateOnboardingWorkflowService
      .getReferralDateConfirmation(
        this.employeeOnboardingId,
        this.tncLangDropdownValue
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], { type: 'image/* | application/pdf' });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, 'Referral Date Confirmation.pdf');
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  generateI9Form(): void {
    this.showPdf = true;
    this.showTabs = false;
    this.isLoadingI9Form = true;
    const webformTypeId = '2';
    this.candidateOnboardingWorkflowService
      .generateI9Form(
        webformTypeId,
        this.employeeOnboardingId,
        this.candSignFile,
        this.prepSignFile,
        this.employerSignFile
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: I9 Form generated successfully'
          );
          this.docURL = `data:application/pdf;base64,${data?.result?.documentBytes}`;
          // tslint:disable-next-line: no-non-null-assertion
          this.pdfId = data?.result?.documentId!;
          this.pdfDisplayName = data?.result?.displayName;
          this.isLoadingI9Form = false;
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to update I9 Form successfully'
          );
          console.warn(error);
          this.isLoadingI9Form = false;
        }
      );
  }

  previousStep(): void {
    this.showTabs = true;
    this.showPdf = false;
    if (this.selectedIndex !== 0) {
      this.selectedIndex = this.selectedIndex - 1;
    }
    this.tabIndex = this.selectedIndex;
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabIndex = tabChangeEvent.index;
    this.selectedIndex = this.tabIndex;
    this.getListsOfDocument(this.categoryA);
    this.getListsOfDocument(this.categoryB);
    this.getListsOfDocument(this.categoryC);
    this.getCandidateWorkEligibilityAndI9FormInfo();
  }

  changeRadioBtn(e: MatRadioChange): void {
    this.radioBtnValue = e.value;
  }

  changeDriverSateCard(e: MatRadioChange): void {
    this.driverSateBtnValue = e.value;
  }

  addDocument(): void {
    this.removedRow = [];
    this.index = this.index + 1;
    if (this.index === 0) {
      this.showRowOne = true;
    } else if (this.index === 1) {
      this.showRowTwo = true;
    } else if (this.index === 2) {
      this.showRowThree = true;
    }
  }

  removeDocument(rowNumber: number): void {
    if (rowNumber === 1) {
      this.showRowOne = false;
      this.index = this.index - 1;
      this.removedRow.push(rowNumber);
    } else if (rowNumber === 2) {
      this.showRowTwo = false;
      this.index = this.index - 1;
      this.removedRow.push(rowNumber);
    } else if (rowNumber === 3) {
      this.showRowThree = false;
      this.index = this.index - 1;
      this.removedRow.push(rowNumber);
    }
    this.i9Form.markAsDirty();
  }

  tncLangDropDownChange(value: Event): void {
    this.tncLangDropdownValue = value.toString();
    // tslint:disable-next-line: no-unused-expression
    this.tncLangDropdownValue === '' ? null : this.tncLangDropdownValue;
  }

  tncRadioBtnChange(e: MatRadioChange): void {
    this.tncRadioBtnValue = e.value;
    if (this.tncRadioBtnValue.toString() === '2') {
      this.dialogConfirmRefTnc = this.dialogConfirmTnc.open(
        PopupDialogBoxComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRefTnc.componentInstance.confirmMessage =
        '<b>Are you sure?</b><br>Employee has confirmed not to contest the TNC';
      this.dialogConfirmRefTnc.afterClosed().subscribe((result) => {
        if (result) {
          this.submitFNC();
        }
      });
    }
  }

  openSignatureDialog(signType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      employeeOnboardingId:
        this.workEligibilityAndI9FormResult?.employerSignDocumentId,
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
      if (res.status === 'success') {
        if (res.signType === 'Employer') {
          this.signEmployerStatus = true;
          this.employerSignId = res.docId;
          this.employerSignFile = res.file;
          const reader = new FileReader();
          // tslint:disable-next-line: no-any
          reader.onload = (e: any) => {
            this.employerSignURL = e.target.result;
          };
          reader.readAsDataURL(this.employerSignFile);

          if (res.docId === undefined) {
            this.saveSignatureAndGetNewSignId(
              'Employer',
              this.employerSignFile
            );
          }
        }
      } else {
        this.getCandidateWorkEligibilityAndI9FormInfo();
      }
    });
  }

  saveSignatureAndGetNewSignId(signType: string, signfile: File): void {
    this.candidateOnboardingWorkflowService
      .saveSignature(this.userId, signfile)
      .subscribe(
        (data) => {
          switch (signType) {
            case 'Employer':
              this.employerSignId = data?.result;
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

  deleteSign(signType: string): void {
    this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you wants to delete the signature?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (signType) {
          case 'Employer':
            this.workEligibilityAndI9FormResult.employerSignDocumentId = null;
            this.employerSignURL = '';
            break;
        }
        this.matNotificationService.success(
          '::Selected signature deleted successfully.'
        );
      }
    });
  }

  downloadDocument(): void {
    if (this.pdfId) {
      this.documentsService.downloadDocumentFile(this.pdfId).subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, this.pdfDisplayName);
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.hrComments = JSON.parse(data?.result);
          if (this.hrComments) {
            this.checkCommentLength.emit(Object?.keys(this.hrComments)?.length);
            this.hrCommentLength = Object.keys(this.hrComments).length;
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));
          }

          // get the comment for specific section : start
          this.keysSectionWise = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('workEligibilityI9')) {
                this.keysSectionWise.push(key);
              }
            }
          }
          this.countKeysWorkEligibilityInfo = this.keysSectionWise.length;
          // get the comment for specific section : end
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onHover(val: string): void {
    this.showUpdateButton = false;
    this.commentForm.get('comment')?.patchValue('');
    this.commentKey = val;
    if (this.hrComments) {
      Object.entries(this.hrComments).forEach((d) => {
        if (d[0] === this.commentKey) {
          this.commentValue = d[1];
          this.commentForm.get('comment')?.patchValue(this.commentValue);
          this.commentForm?.markAsPristine();
          this.showUpdateButton = true;
        }
      });
    }
  }

  onSave(): void {
    this.commentValue = this.commentForm.get('comment')?.value;
    this.hrCommentsMap.delete(this.commentKey);
    this.hrCommentsMap.set(this.commentKey, this.commentValue);

    const commentStr = JSON.stringify(Object.fromEntries(this.hrCommentsMap));

    // tslint:disable-next-line: no-any
    let CommentList: any;
    CommentList = {
      EmployeeOnboardingId: this.employeeOnboardingId,
      HRComments: commentStr,
    };

    this.candidateOnboardingWorkflowService
      .saveHRComment(CommentList)
      .subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.getComments();
            this.matNotificationService.success(
              `:: Comment saved successfully`
            );
          } else {
            this.matNotificationService.warn(':: Error: ' + res.errorMessage);
          }
        },
        (error) => {
          this.matNotificationService.showSnackBarMessage(
            'Oops! Request has failed',
            error
          );
        }
      );
    this.commentMenusTrigger.closeMenu();
  }

  deleteComment(type: string, event: Event): void {
    this.getComments();
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );
    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to delete?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type === 'All') {
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('workEligibilityI9')) {
                this.hrCommentsMap.delete(key);
              }
            }
          }
        }
        if (type === 'Single') {
          this.hrCommentsMap.delete(this.commentKey);
        }
        const commentStr = JSON.stringify(
          Object.fromEntries(this.hrCommentsMap)
        );

        // tslint:disable-next-line: no-any
        let CommentList: any;
        CommentList = {
          EmployeeOnboardingId: this.employeeOnboardingId,
          HRComments: commentStr,
        };

        this.candidateOnboardingWorkflowService
          .saveHRComment(CommentList)
          .subscribe(
            (res) => {
              if (res.errorCode === 0) {
                this.getComments();
                if (type === 'Single') {
                  this.matNotificationService.success(
                    `:: Comment deleted successfully`
                  );
                } else if (type === 'All') {
                  this.matNotificationService.success(
                    `:: Comments deleted successfully`
                  );
                }
              } else {
                this.matNotificationService.warn(
                  ':: Error: ' + res.errorMessage
                );
              }
            },
            (error) => {
              this.matNotificationService.showSnackBarMessage(
                'Oops! Request has failed',
                error
              );
            }
          );
        this.commentMenusTrigger.closeMenu();
      }
    });
    event.preventDefault();
    event.stopPropagation();
  }

  closeMenu(): void {
    this.commentMenusTrigger.closeMenu();
  }

  openCaseResults(): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      empOnboardingId: this.employeeOnboardingId,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
      obj,
    };
    const dialogRef = this.dialog.open(CaseResultsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = window.atob(
      dataURI.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
    );
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }
}
