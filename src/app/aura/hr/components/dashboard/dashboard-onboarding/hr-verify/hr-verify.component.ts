import { Component, OnInit } from '@angular/core';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { OnboardingDetailsResult } from '../../../../../hr/interface/dashboard/candidate-onboarding.interface';
import { CandidateOnboardingService } from '../../../../../hr/service/dashboard/candidate-onboarding.service';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GetRejectionEmailContentResult } from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { ColumnsDetailsComponent } from '../../../../../../aura/search/components/candidate-profile/candidate-details-panel/candidate-submissions-tab/columns-details/columns-details.component';

@Component({
  selector: 'app-hr-verify',
  templateUrl: './hr-verify.component.html',
  styleUrls: ['./hr-verify.component.scss'],
})
export class HrVerifyComponent implements OnInit {
  personId = '';
  title = '';
  employeeOnboardingId!: string;
  candidateJobRequirementId!: string;
  onboardingDetailsResult!: OnboardingDetailsResult;
  rejectionEmailContentResult!: GetRejectionEmailContentResult;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  // tslint:disable-next-line: no-any
  hrVerifyComments: any[] = [];
  hrCommentLength!: number;
  hrCommentLen!: number;
  hrVerifyCommentLength!: number;
  // fileNo = '';
  positionID = '';
  showDashboardLink = false;
  showSendEmail = false;
  keysPersonalInfo: string[] = [];
  keysIdentificationInfo: string[] = [];
  keysEducationInfo: string[] = [];
  keysContactsInfo: string[] = [];
  keysBanksPaychecksInfo: string[] = [];
  keysWorkEligibilityInfo: string[] = [];
  countKeysPersonalInfo!: number;
  countKeysIdentificationInfo!: number;
  countKeysEducationInfo!: number;
  countKeysContactsInfo!: number;
  countKeysBanksPaychecksInfo!: number;
  countKeysWorkEligibilityInfo!: number;
  i9SubmissionDate = false;
  showTaxInfoSection = true;
  isLoading = false;

  constructor(
    private candidateOnboardingService: CandidateOnboardingService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: no-any
    this.activatedRoute.queryParamMap.subscribe((paramMap: any) => {
      const { eOnBoardingId, cJobId } = paramMap.params;
      if (eOnBoardingId && cJobId) {
        this.employeeOnboardingId = eOnBoardingId;
        this.candidateJobRequirementId = cJobId;
        this.setOnboardingDetails();
      }
    });
    this.getComments();
  }

  setOnboardingDetails(): void {
    this.candidateOnboardingService
      .getOnboardingDetails(this.candidateJobRequirementId)
      .subscribe(
        (data) => {
          this.onboardingDetailsResult = data?.result;
          this.personId = data?.result?.personId;
          if (this.onboardingDetailsResult?.jobTitle) {
            this.title = this.onboardingDetailsResult?.jobTitle;
          } else {
            this.title = '';
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  previewDocument(doc: DocumentInformation): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      personId: this.personId,
      currentDoc: doc,
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

  getComments(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.hrComments = JSON.parse(data?.result);
          if (this.hrComments) {
            this.hrCommentLength = Object?.keys(this.hrComments)?.length;
          }
          // get the comment for personal Info section : start
          this.keysPersonalInfo = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('personalInformation')) {
                this.keysPersonalInfo.push(key);
              }
            }
          }
          this.countKeysPersonalInfo = this.keysPersonalInfo.length;
          // get the comment for specific section : end

          // get the comment for identification Info section : start
          this.keysIdentificationInfo = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('identificationInformation')) {
                this.keysIdentificationInfo.push(key);
              }
            }
          }
          this.countKeysIdentificationInfo = this.keysIdentificationInfo.length;
          // get the comment for specific section : end

          // get the comment for education Info section : start
          this.keysEducationInfo = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('educationInformation')) {
                this.keysEducationInfo.push(key);
              }
            }
          }
          this.countKeysEducationInfo = this.keysEducationInfo.length;
          // get the comment for specific section : end

          // get the comment for contacts Info section : start
          this.keysContactsInfo = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('emergencyContacts')) {
                this.keysContactsInfo.push(key);
              }
            }
          }
          this.countKeysContactsInfo = this.keysContactsInfo.length;
          // get the comment for specific section : end

          // get the comment for banks and paychecks section : start
          this.keysBanksPaychecksInfo = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('banksPaychecks')) {
                this.keysBanksPaychecksInfo.push(key);
              }
            }
          }
          this.countKeysBanksPaychecksInfo = this.keysBanksPaychecksInfo.length;
          // get the comment for specific section : end

          // get the comment for work eligibility i9 section : start
          this.keysWorkEligibilityInfo = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('workEligibilityI9')) {
                this.keysWorkEligibilityInfo.push(key);
              }
            }
          }
          this.countKeysWorkEligibilityInfo =
            this.keysWorkEligibilityInfo.length;
          // get the comment for specific section : end
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          console.warn(err);
        }
      );
  }

  checkForEmailADP(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.hrVerifyComments = JSON.parse(data?.result);
          if (this.hrVerifyComments) {
            this.hrVerifyCommentLength = Object?.keys(
              this.hrVerifyComments
            )?.length;
          }
          if (this.hrVerifyCommentLength > 0) {
            this.showSendEmail = true;
            this.isLoading = false;
          } else if (
            this.hrVerifyCommentLength === 0 ||
            !this.hrVerifyComments
          ) {
            this.callADPOnboarding();
          }
        },
        (err) => {
          this.isLoading = false;
          console.warn(err);
        }
      );
  }

  callADPOnboarding(): void {
    this.candidateOnboardingWorkflowService
      .submitADPOnboarding(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          console.log('Submit ADP Response', data);
         // this.fileNo = data?.result?.model?.fileNumber;
          this.positionID = data?.result?.model?.positionID;
          const dialogConfig = new MatDialogConfig();
          const obj = {
            type: 'HRVERIFY',
          //  fileId: data?.result?.model?.fileNumber,
            positionID: data?.result?.model?.positionID,
            errorCode: data?.errorCode,
            error: data?.result?.error,
          };
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = true;
          dialogConfig.data = {
            obj,
          };
          this.dialogConfirmRef = this.dialogConfirm.open(
            ConfirmationDialogComponent,
            dialogConfig
          );
          this.dialogConfirmRef.afterClosed().subscribe((result) => {
            if (result) {
              this.showDashboardLink = true;
            }
          });
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  goToHrDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
  }

  showAllAccordians(event: boolean): void {
    this.showSendEmail = event;
  }

  callHRComments(event: boolean): void {
    if (event) {
      this.getComments();
    }
  }

  checkUscisStatusValue(i9SubmissionDateTime: boolean): void {
    this.i9SubmissionDate = i9SubmissionDateTime;
    if (!this.showTaxInfoSection){
      this.i9SubmissionDate = false;
    }
  }

  checkCommentLengthValue(commentLength: number): void {
    this.hrCommentLen = commentLength;
    this.hrCommentLength = this.hrCommentLen;
  }

  checkEmploymentTypeValue(showTaxInformation: boolean): void {
    this.showTaxInfoSection = showTaxInformation;
    this.i9SubmissionDate = false;
  }

  showJobDescription(jobDescription: string): void {
    const dialogConfig = new MatDialogConfig();
    // tslint:disable-next-line: no-any
    const obj: any = {
      headerText: 'Job Description',
      description: jobDescription,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(ColumnsDetailsComponent, dialogConfig);
  }
}
