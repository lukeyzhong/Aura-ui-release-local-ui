import { Component, Input, OnInit } from '@angular/core';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { ActiveUserInfoService } from '../../../../../../../core/service/active-user-info.service';
import { CandidateOnboardingDocumentsResult } from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
@Component({
  selector: 'app-hr-verify-documents',
  templateUrl: './hr-verify-documents.component.html',
  styleUrls: ['./hr-verify-documents.component.scss']
})
export class HrVerifyDocumentsComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  isLoading = true;
  errorMessage = '';
  offerLetterURL = '';
  handBookURL = '';
  documentsResult!: CandidateOnboardingDocumentsResult[];
  candidateName!: string;
  showBookDiv = true;
  showOfferDiv = false;
  headerText = 'Candidate Hand Book';

  constructor(
    private activeUserInfo: ActiveUserInfoService,
    private documentsService: DocumentsService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService
  ) { }

  ngOnInit(): void {
    this.setOfferLetter();
    this.candidateName = this.activeUserInfo?.getActiveUserInfo()?.fullName;
    this.setCandidateDocumentsInfo();
  }

  setCandidateDocumentsInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingDocuments(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.documentsResult = data?.result;
          this.documentPreview(this.documentsResult[0]);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  documentPreview(doc: CandidateOnboardingDocumentsResult): void {
    this.isLoading = true;
    this.documentsService.getDocumentFile(doc?.documentId).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          this.handBookURL = fileURL;
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  showHandbBook(): void{
    this.showBookDiv = true;
    this.showOfferDiv = false;
    this.headerText = 'Candidate Hand Book';
  }

  showOfferLetter(): void{
    this.showBookDiv = false;
    this.showOfferDiv = true;
    this.headerText = 'Candidate Offer Letter';
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
            this.offerLetterURL = fileURL;
            this.isLoading = false;
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

}
