import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { CandidateOnboardingInformationResult } from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import {
  AllOnboardingDocumentsInfoResult,
  CompensationInformationResult,
  EmploymentInformationResult,
} from '../../../../../../aura/hr/interface/dashboard/candidate-onboarding.interface';
import { ActiveUserInfoService } from '../../../../../../core/service/active-user-info.service';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';

@Component({
  selector: 'app-onboarding-information',
  templateUrl: './onboarding-information.component.html',
  styleUrls: ['./onboarding-information.component.scss'],
})
export class OnboardingInformationComponent implements OnInit {
  @Input() employeeOnboardingId = '';
  candidateOnboardingInformationResult!: CandidateOnboardingInformationResult;
  employmentInfo!: EmploymentInformationResult;
  compensationInfo!: CompensationInformationResult;
  documentInfo!: AllOnboardingDocumentsInfoResult[];
  candidateName!: string;
  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  docURL = '';
  totalEarnings = 0;
  isLoading = false;
  profilePictureDocumentId!: string;
  personId!: string;
  @Output() sendPersonId = new EventEmitter();
  defaultOne = 0;
  onBoardingOpenState = false;

  constructor(
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private activeUserInfo: ActiveUserInfoService,
    private documentsService: DocumentsService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog,
  ) {}

  ngOnInit(): void {
    this.candidateName = this.activeUserInfo?.getActiveUserInfo()?.fullName;
    this.setOnboardingInformation();
  }
  setOnboardingInformation(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingInfoByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.candidateOnboardingInformationResult = data?.result;
          this.employmentInfo =
            this.candidateOnboardingInformationResult?.employmentInfo;

          this.candidateOnboardingWorkflowService.sendEmpType(
            this.employmentInfo?.employmentType
          );

          this.compensationInfo =
            this.candidateOnboardingInformationResult?.compensationInfo;
          this.documentInfo =
            this.candidateOnboardingInformationResult?.documentInfo;
          this.profilePictureDocumentId =
            data?.result?.profilePictureDocumentId;
          this.personId = data?.result?.personId;
          this.totalEarnings =
            this.compensationInfo?.additionalEarnings?.length;

          const profileInfoObj = {
            personId: this.personId,
            profileDocId: this.profilePictureDocumentId,
          };
          this.sendPersonId.emit(profileInfoObj);
          this.candidateOnboardingWorkflowService.setSalaryInfo(this.compensationInfo?.amount);
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  // tslint:disable-next-line: no-any
  previewDocument(doc: any): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
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
        this.dialogRef.close('cancel');
        this.onBoardingOpenState = true;
      }
    });
  }

  previewOfferLetter(): void {
    this.candidateOnboardingWorkflowService
      .getOfferLetterDocument(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data.byteLength === 94) {
          } else {
            const file = new Blob([data], {
              type: 'image/* | application/pdf',
            });

            const fileURL = URL.createObjectURL(file);
            this.docURL = fileURL;
            const isLoading = true;
            const dialogConfig = new MatDialogConfig();
            const obj = {
              isLoading,
              fileURL,
              displayName: 'Offer Letter',
            };
            dialogConfig.disableClose = true;
            dialogConfig.autoFocus = false;
            dialogConfig.data = {
              obj,
            };
            this.dialogRef = this.dialogConfirm.open(
              PreviewDocumentComponent,
              dialogConfig
            );
            this.dialogRef.afterClosed().subscribe((result: string) => {
              if (result === 'success') {
                this.dialogRef.close('cancel');
              }
            });
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  downloadDocument(doc?: AllOnboardingDocumentsInfoResult): void {
    if (doc) {
      this.documentsService.getDocumentFile(doc.templateId, 41).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'image/* | application/pdf' });
          const fileURL = URL.createObjectURL(file);

          saveAs(fileURL, doc.templateName + '.pdf');
        },
        (err) => {
          console.warn(err);
        }
      );
    } else {
      this.candidateOnboardingWorkflowService
        .getOfferLetterDocument(this.employeeOnboardingId)
        .subscribe(
          (data) => {
            if (data.byteLength === 94) {
            } else {
              const file = new Blob([data], {
                type: 'image/* | application/pdf',
              });

              const fileURL = URL.createObjectURL(file);
              this.docURL = fileURL;
              saveAs(this.docURL, 'Offerletter.pdf');
            }
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  collapseOnboardingInfo(): void {
    this.onBoardingOpenState = false;
  }
}
