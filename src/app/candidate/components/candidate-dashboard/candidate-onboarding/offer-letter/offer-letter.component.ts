import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { CandidateOnboardingWorkflowService } from '../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { DigitalSignatureComponent } from '../../../../../shared/components/digital-signature/digital-signature.component';
import { OfferRejectComponent } from './offer-reject/offer-reject.component';
import { ActiveUserInfoService } from '../../../../../core/service/active-user-info.service';

@Component({
  selector: 'app-offer-letter',
  templateUrl: './offer-letter.component.html',
  styleUrls: ['./offer-letter.component.scss'],
})
export class OfferLetterComponent implements OnInit {
  @ViewChild('offerLetterPrint', { static: true })
  offerLetterPrintRef?: ElementRef;
  isLoading = true;
  errorMessage = '';
  docURL = '';
  employeeOnboardingId!: string;
  welcome = true;
  signDate!: Date;
  candidateName!: string;
  rejectDialog = true;
  signStatus = false;
  jobTitle!: string;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();

  constructor(
    protected sanitizer: DomSanitizer,
    private activeUserInfo: ActiveUserInfoService,
    private router: Router,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private route: ActivatedRoute
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.employeeOnboardingId = params.get('onboardingId')!;
      this.jobTitle = params.get('jobTitle')!;
    });
  }

  ngOnInit(): void {
    this.setOfferLetter();
    this.candidateName = this.activeUserInfo?.getActiveUserInfo()?.fullName;
    this.signDate = new Date();
    this.getComments();
  }

  setOfferLetter(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getOfferLetterDocument(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data.byteLength === 94) {
            this.errorMessage = 'Requested data not loaded. Please try again.';
            this.isLoading = false;
          } else {
            this.errorMessage = '';
            const file = new Blob([data], {
              type: 'application/pdf',
            });

            const fileURL = URL.createObjectURL(file);
            this.docURL = fileURL;
            this.isLoading = false;
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  openSignatureDialog(): void {
    const dialogConfig = new MatDialogConfig();

    const obj = {
      employeeOnboardingId: this.employeeOnboardingId,
      formType: 'Candidate Sign',
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(DigitalSignatureComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((res) => {
      if (res === 'success') {
        this.setOfferLetter();
        this.signStatus = true;
      } else {
        this.signStatus = false;
      }
    });
  }

  openReject(): void {
    const dialogConfig = new MatDialogConfig();
    this.rejectDialog = false;

    const obj = {
      employeeOnboardingId: this.employeeOnboardingId,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(OfferRejectComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((res) => {
      console.log(res);
      if (res !== 'success') {
        this.rejectDialog = true;
      } else {
        this.rejectDialog = true;
        this.welcome = false;
      }
    });
  }

  downloadDocument(): void {
    saveAs(this.docURL, 'Offerletter.pdf');
  }

  printPreview(): void {
    const newWindow = window.open();
    // opening in new window
    // tslint:disable-next-line: no-non-null-assertion
    newWindow!.location.assign(this.docURL);
  }

  openCandidateOnboarding(): void {
    this.router.navigate([
      '/candidate/dashboard/on-boarding',
      this.employeeOnboardingId,
    ]);
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result && data?.result !== '{}') {
            this.hrComments = JSON.parse(data?.result);
            this.hrCommentsMap = new Map(Object?.entries(this.hrComments));
            this.signStatus = true;
          } else {
            this.signStatus = false;
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  showOfferLetter(): void {
    this.welcome = false;
    this.setOfferLetter();
  }
}
