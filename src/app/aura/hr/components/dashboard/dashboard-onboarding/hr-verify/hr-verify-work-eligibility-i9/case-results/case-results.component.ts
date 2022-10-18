import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CaseResult } from '../../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
@Component({
  selector: 'app-case-results',
  templateUrl: './case-results.component.html',
  styleUrls: ['./case-results.component.scss'],
})
export class CaseResultsComponent implements OnInit {
  employeeOnboardingId!: string;
  viewCaseResults!: CaseResult;
  isLoading = false;
  reportDate!: Date;
  caseClosureReason = '';

  constructor(
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.employeeOnboardingId = data?.obj?.empOnboardingId;
  }

  ngOnInit(): void {
    this.reportDate = new Date();
    this.getCaseResults();
  }

  getCaseResults(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCaseResultsData(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.viewCaseResults = data?.result;
          if (this.viewCaseResults?.caseClosureReason?.currentlyEmployed) {
            this.caseClosureReason =
              this.viewCaseResults?.caseClosureReason?.currentlyEmployedReason;
          } else {
            if (
              this.viewCaseResults?.caseClosureReason
                ?.caseClosureReasonCodeDisplay
            ) {
              this.caseClosureReason =
                this.viewCaseResults?.caseClosureReason?.caseClosureReasonCodeDisplay;
            } else {
              this.caseClosureReason =
                // tslint:disable-next-line: no-non-null-assertion
                this.viewCaseResults?.caseClosureReason?.otherReasonText!;
            }
          }
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  downloadReport(): void {
    if (this.employeeOnboardingId) {
      this.candidateOnboardingWorkflowService
        .getCaseClosureReport(this.employeeOnboardingId)
        .subscribe(
          (data) => {
            const file = new Blob([data], {
              type: 'image/* | application/pdf',
            });
            const fileURL = URL.createObjectURL(file);
            saveAs(fileURL, 'Case Result.pdf');
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }
}
