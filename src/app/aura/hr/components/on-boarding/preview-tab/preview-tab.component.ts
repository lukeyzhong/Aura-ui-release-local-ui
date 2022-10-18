import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CandidateOnboardingService } from '../../../service/dashboard/candidate-onboarding.service';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { Router } from '@angular/router';
import {
  Addresses,
  AddressType,
  ContactAddressType,
} from '../../../../search/interface/person.interface';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AllOnboardingDocumentsInfoResult,
  CompensationInformationResult,
  EmploymentInformationResult,
  PersonalInformationResult,
  WebFormAllDocumentsInfoResult,
  WebFormsAndDocumentsByPkgCodeResult,
} from '../../../interface/dashboard/candidate-onboarding.interface';
import { MatStepper } from '@angular/material/stepper';
import { DigitalSignatureComponent } from 'src/app/shared/components/digital-signature/digital-signature.component';
import { CandidateOnboardingWorkflowService } from '../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { PreviewDocumentComponent } from 'src/app/shared/components/preview-document/preview-document.component';

@Component({
  selector: 'app-preview-tab',
  templateUrl: './preview-tab.component.html',
  styleUrls: ['./preview-tab.component.scss'],
})
export class PreviewTabComponent implements OnInit {
  personalInformationResult!: PersonalInformationResult;
  employmentInformationResult!: EmploymentInformationResult;
  compensationInformationResult!: CompensationInformationResult;
  documentsInfoResult!: WebFormsAndDocumentsByPkgCodeResult;
  panelOpenState = false;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  @Output() moveToPersonalTab = new EventEmitter();
  @Input() stepper!: MatStepper;
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';

  reload = true;
  cellPhone = '';
  homePhone = '';
  officePhone = '';
  email = '';
  livingAddress!: Addresses | null;
  livingAddrStateName = '';
  livingAddrCountryName = '';
  documents: AllOnboardingDocumentsInfoResult[] = [];
  additionalDocuments: AllOnboardingDocumentsInfoResult[] = [];
  webForms: WebFormAllDocumentsInfoResult[] = [];
  additionalWebForms: WebFormAllDocumentsInfoResult[] = [];
  employeeOnboardingId!: string;
  docURL!: string;
  errorMessage!: string;

  constructor(
    private router: Router,
    private lookupService: LookupService,
    private candidateOnboardingService: CandidateOnboardingService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog
  ) {}

  ngOnInit(): void {
    this.candidateOnboardingService.getDocsUpdated().subscribe((status) => {
      this.reload = status;
      this.setPreviewInformation();
    });
  }

  setPreviewInformation(): void {
    this.candidateOnboardingService
      .getPreviewInformation(this.candidateId, this.candidateJobRequirementId)
      .subscribe(
        (data) => {
          this.employeeOnboardingId = data?.result?.employeeOnboardingId;
          this.personalInformationResult = data?.result?.personalInfo;
          this.setPersonalInfo(this.personalInformationResult);
          this.employmentInformationResult = data?.result?.employmentInfo;
          this.compensationInformationResult = data?.result?.compensationInfo;
          this.documentsInfoResult = data?.result?.documentInfo;
          this.documents = data?.result?.documentInfo?.documents;
          this.additionalDocuments =
            data?.result?.documentInfo?.additionalDocuments;
          this.webForms = data?.result?.documentInfo?.webForms;
          this.additionalWebForms =
            data?.result?.documentInfo?.additionalWebForms;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setPersonalInfo(personalInformationResult: PersonalInformationResult): void {
    if (personalInformationResult.contactAddresses !== null) {
      for (const contact of personalInformationResult?.contactAddresses) {
        switch (contact?.contactAddressTypeCode) {
          case ContactAddressType.Email:
            {
              this.email = contact?.contactAddress;
            }
            break;

          case ContactAddressType.Mobile:
            {
              this.cellPhone = this.parsePhoneNumber(
                contact?.countryCode,
                contact?.contactAddress
              );
            }
            break;

          case ContactAddressType.HomePhone:
            {
              this.homePhone = this.parsePhoneNumber(
                contact?.countryCode,
                contact?.contactAddress
              );
            }
            break;

          case ContactAddressType.WorkPhone:
            {
              this.officePhone = this.parsePhoneNumber(
                contact?.countryCode,
                contact?.contactAddress
              );
            }
            break;
        }
      }
    }

    if (
      this.personalInformationResult?.address?.addressTypeCode ===
      AddressType.Mailing
    ) {
      this.livingAddress = this.personalInformationResult?.address;
      this.findLivingAddressStateName(this.livingAddress?.stateCode);
      this.findLivingAddressCountryName(this.livingAddress?.countryCode);
    } else {
      this.livingAddress = null;
    }
  }
  parsePhoneNumber(
    countryCode: string | undefined,
    phoneNumber: string
  ): string {
    let parsedPhoneNumber = '';
    if (phoneNumber) {
      if (phoneNumber === null) {
        parsedPhoneNumber = '-';
      } else {
        if (countryCode === null) {
          parsedPhoneNumber =
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        } else {
          parsedPhoneNumber =
            '+' +
            countryCode +
            ' (' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        }
      }
    }
    return parsedPhoneNumber;
  }
  findLivingAddressCountryName(countryCode: string): void {
    this.lookupService.getCountryCode().subscribe(
      (data) => {
        for (const country of data?.result) {
          if (country?.lookupCode === Number(countryCode)) {
            this.livingAddrCountryName = country?.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  findLivingAddressStateName(stateCode: string): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          if (state?.lookupCode === Number(stateCode)) {
            this.livingAddrStateName = state?.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  continue(): void {
    this.panelOpenState = false;

    const dialogConfig = new MatDialogConfig();

    const obj = {
      employeeOnboardingId: this.employeeOnboardingId,
      formType: 'HR Sign',
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialogConfirm.open(
      DigitalSignatureComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((res) => {
      if (res === 'success') {
        this.candidateOnboardingWorkflowService
          .getOfferLetterDocument(this.employeeOnboardingId)
          .subscribe(
            (data) => {
              if (data?.byteLength === 94) {
                this.errorMessage =
                  'Requested data not loaded. Please try again.';
              } else {
                if (data?.errorCode) {
                  this.errorMessage = data?.errorMessage;
                  this.showHRSignedOfferLetter('', this.errorMessage);
                } else {
                  this.errorMessage = '';
                  const file = new Blob([data], {
                    type: 'application/pdf',
                  });

                  const fileURL = URL.createObjectURL(file);

                  this.docURL = fileURL;

                  this.showHRSignedOfferLetter(this.docURL);
                }
              }
            },
            (err) => {
              console.warn(err);
            }
          );
      }
    });
  }
  showHRSignedOfferLetter(docURL: string, errorMessage: string = ''): void {
    if (docURL === '') {
      const dialogConfig = new MatDialogConfig();
      const obj = {
        errorMessage,
        displayName: 'Error',
        formType: 'HR Sign',
        isLoading: true,
      };
      dialogConfig.disableClose = true;
      dialogConfig.width = '60%';
      dialogConfig.autoFocus = false;
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialogConfirm.open(
        PreviewDocumentComponent,
        dialogConfig
      );
    } else {
      const dialogConfig = new MatDialogConfig();
      const obj = {
        fileURL: docURL,
        displayName: 'Offer Letter',
        formType: 'HR Sign',
        isLoading: true,
      };
      dialogConfig.disableClose = true;
      dialogConfig.width = '60%';
      dialogConfig.autoFocus = false;
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialogConfirm.open(
        PreviewDocumentComponent,
        dialogConfig
      );
      this.dialogRef.afterClosed().subscribe((result: string) => {
        if (result === 'cancel') {
          this.stepper.next();
        }
      });
    }
  }
  goToHrDashboard(): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Are you sure, you want to close?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/aura/hr/dashboard']);
      }
    });
  }

  redirectTo(index: number): void {
    if (index === 0) {
      this.candidateOnboardingService.sendPIStatus(true);
    } else {
      this.candidateOnboardingService.sendPIStatus(false);
    }
    this.stepper.selectedIndex = index;
  }
}
