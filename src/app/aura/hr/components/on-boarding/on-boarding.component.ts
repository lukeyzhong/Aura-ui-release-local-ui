import { Component, OnInit } from '@angular/core';
import { OnboardingDetailsResult } from '../../interface/dashboard/candidate-onboarding.interface';
import { CandidateOnboardingService } from '../../service/dashboard/candidate-onboarding.service';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { DocumentInformation } from '../../../../shared/interface/document-info.interface';
import { PreviewDocumentComponent } from '../../../../shared/components/preview-document/preview-document.component';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { ColumnsDetailsComponent } from '../../../../aura/search/components/candidate-profile/candidate-details-panel/candidate-submissions-tab/columns-details/columns-details.component';

@Component({
  selector: 'app-on-boarding',
  templateUrl: './on-boarding.component.html',
  styleUrls: ['./on-boarding.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false },
    },
  ],
})
export class OnBoardingComponent implements OnInit {
  isLinear = false;
  personalGroup!: FormGroup;
  employmentGroup!: FormGroup;
  compensationGroup!: FormGroup;
  documentsGroup!: FormGroup;
  previewGroup!: FormGroup;
  sendOfferGroup!: FormGroup;

  personId = '';
  onboardingDetailsResult!: OnboardingDetailsResult;

  candidateId = '';
  candidateJobRequirementId = '';
  candidateName = '';
  pkgTypeValue = '';
  pkgTypeCode = '';

  offerSentStatus = false;
  status = 'inactive';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private candidateOnboardingService: CandidateOnboardingService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: no-any
    this.activatedRoute.queryParamMap.subscribe((paramMap: any) => {
      const { cId, cJobId } = paramMap.params;

      if (cId && cJobId) {
        this.candidateId = cId;
        this.candidateJobRequirementId = cJobId;
        this.setOnboardingDetails();
      }
    });
  }

  // tslint:disable-next-line: no-any
  getNewName(event: any): void {
    this.candidateName = event.firstName + ' ' + event.lastName;
  }

  // tslint:disable-next-line: no-any
  getPkgType(event: any): void {
    this.pkgTypeValue = event.value;
    this.pkgTypeCode = event.code;
  }

  getOfferSentStatus(status: boolean): void {
    this.offerSentStatus = status;
  }

  setOnboardingDetails(): void {
    this.candidateOnboardingService
      .getOnboardingDetails(this.candidateJobRequirementId)
      .subscribe(
        (data) => {
          this.onboardingDetailsResult = data?.result;
          this.personId = data?.result?.personId;
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

  goToHrDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
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

  // tslint:disable-next-line: no-any
  setSideBarNavStatus(status: any): void {
    this.status = status;
  }
}
