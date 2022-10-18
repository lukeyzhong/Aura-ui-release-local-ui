import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import {
  CandidateOnboardingDocumentsResult,
  SaveSignAndGenerateDocumentsResult,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { DigitalSignatureComponent } from '../../../../../../shared/components/digital-signature/digital-signature.component';
import { ActiveUserInfoService } from '../../../../../../core/service/active-user-info.service';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { Router } from '@angular/router';
import { Output } from '@angular/core';
import { GlobalVariables } from '../../../../../../shared/enums/global-variables.enum';

@Component({
  selector: 'app-candidate-onboarding-documents-tab',
  templateUrl: './candidate-onboarding-documents-tab.component.html',
  styleUrls: ['./candidate-onboarding-documents-tab.component.scss'],
})
export class CandidateOnboardingDocumentsTabComponent
  implements OnInit, OnChanges
{
  @Input() employeeOnboardingId = '';
  @Input() refreshDocs = false;
  documentsResult!: CandidateOnboardingDocumentsResult[];
  @Input() stepper!: MatStepper;
  @Input() compName!: string;
  @Output() enableSideBarNav = new EventEmitter();
  isLoading = false;
  docURL = '';
  templateName = '';
  activeDocument!: CandidateOnboardingDocumentsResult;
  saveSignDocumentsResult!: SaveSignAndGenerateDocumentsResult;
  candSignFile!: File;
  candSignId!: string;
  isSignSaved!: boolean;
  userId!: string;
  errorMsg = '';
  document!: CandidateOnboardingDocumentsResult;
  currentDocIndex = 0;
  docsSeen: number[] = [];
  disableNextBtn = false;
  disableSignBtn = false;
  noSign = false;
  documentId!: string;

  constructor(
    private router: Router,
    private activeUserInfo: ActiveUserInfoService,
    private documentsService: DocumentsService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.refreshDocs && changes?.refreshDocs?.currentValue === true) {
      this.setCandidateDocumentsInfo();
    }
  }

  ngOnInit(): void {
    this.userId = this.activeUserInfo?.getActiveUserInfo()?.userId;
    this.saveSignDocumentsResult = {
      resourceTypeCode: 0,
      resourceValue: '',
      docResourceTypeCode: 0,
      docResourceValue: '',
      docDisplayName: '',
      docFileDescription: '',
      docPurposeCode: 0,
      signatureName: '',
      inputParamsKey1: '',
      inputParamsKey2: '',
      inputParamsValue1: '',
      inputParamsValue2: '',
    };
    this.setCandidateDocumentsInfo();
  }

  setCandidateDocumentsInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingDocuments(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.documentsResult = data?.result;
            this.showDocument(0);
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onPrevious(): void {
    this.stepper.selectedIndex = 4;
  }
  saveDocumentsAndContinue(): void {
    this.stepper.next();
  }

  documentPreview(doc: CandidateOnboardingDocumentsResult, i: number): void {
    this.currentDocIndex = i;
    this.activeDocument = doc;
    this.templateName = doc?.templateName;
    this.isLoading = true;

    if (doc?.signed) {
      this.noSign = false;
      this.documentsService.getDocumentFile(doc?.documentId).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          this.docURL = fileURL;
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
    } else if (doc?.signed === false) {
      this.noSign = true;
      this.documentsService.getDocumentFile(doc?.templateId, 41).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          this.docURL = fileURL;
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
    }
  }

  downloadDocument(): void {
    if (this.docURL) {
      saveAs(this.docURL, `${this.templateName}.pdf`);
      this.matNotificationService.success(':: Download completed successfully');
    }
  }

  launchDocument(): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      fileURL: this.docURL,
      displayName: this.templateName,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(PreviewDocumentComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
      }
    });
  }

  openSignatureDialog(): void {
    const dialogConfig = new MatDialogConfig();

    const obj = {
      employeeOnboardingId: this.employeeOnboardingId,
      formType: 'Documents',
      signType: 'Employee',
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(DigitalSignatureComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((res) => {
      if (res?.status === 'success') {
        if (res?.signType === 'Employee') {
          this.candSignId = res?.docId;
          this.isSignSaved = res?.isSignSaved;
          this.candSignFile = res?.file;
          if (res?.docId === undefined && res?.isSignSaved) {
            this.saveSignatureAndGetNewSignId('Employee', this.candSignFile);
          }
          this.saveSignAndGenerateDocument();
        }
      }
    });
  }
  saveSignatureAndGetNewSignId(signType: string, signfile: File): void {
    this.candidateOnboardingWorkflowService
      .saveSignature(this.userId, signfile)
      .subscribe(
        (data) => {
          switch (signType) {
            case 'Employee':
              this.candSignId = data?.result;
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

  saveSignAndGenerateDocument(): void {
    this.isLoading = true;
    this.saveSignDocumentsResult.resourceTypeCode = 41;
    this.saveSignDocumentsResult.resourceValue =
      this.activeDocument?.templateId;
    this.saveSignDocumentsResult.inputParamsKey1 = 'EmployeeOnboardingId';
    this.saveSignDocumentsResult.inputParamsValue1 = this.employeeOnboardingId;
    this.saveSignDocumentsResult.docResourceTypeCode = 39;
    this.saveSignDocumentsResult.docResourceValue = this.employeeOnboardingId;
    this.saveSignDocumentsResult.docDisplayName = `Signed-${this.activeDocument?.templateName}`;
    this.saveSignDocumentsResult.docFileDescription = `Signed-${this.activeDocument?.templateName}`;
    this.saveSignDocumentsResult.docPurposeCode =
      this.activeDocument?.documentPurposeCode;

    if (this.candSignId === undefined) {
      this.saveSignDocumentsResult.signatureName = 'CSignDoc';
      this.saveSignDocumentsResult.signature = this.candSignFile;
      this.saveSignDocumentsResult.inputParamsKey2 = 'DocumentId';
      this.saveSignDocumentsResult.inputParamsValue2 =
        GlobalVariables.DefaultGUID;
    } else {
      this.saveSignDocumentsResult.inputParamsKey2 = 'DocumentId';
      this.saveSignDocumentsResult.inputParamsValue2 = this.candSignId;
    }

    this.candidateOnboardingWorkflowService
      .saveSignAndGenerateDocuments(this.saveSignDocumentsResult)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            `:: Candidate Signature added successfully to ${this.activeDocument?.templateName} file`
          );

          this.documentId = data?.result?.documentId;
          this.docURL = `data:application/pdf;base64,${data?.result?.documentBytes}`;

          this.noSign = false;
          this.isLoading = false;
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to generate successfully'
          );
          console.warn(error);
          this.isLoading = false;
        }
      );
  }

  previewNextDocument(): void {
    this.docsSeen.push(this.currentDocIndex);
    ++this.currentDocIndex;
    this.showDocument(this.currentDocIndex);

    if (this.documentsResult?.length === this.currentDocIndex) {
      --this.currentDocIndex;
      this.disableNextBtn = true;
      this.matNotificationService.success(':: No more documents to view !');
    }
  }
  previewPreviousDocument(): void {
    if (this.documentsResult?.length === this.currentDocIndex) {
      --this.currentDocIndex;
    }
    --this.currentDocIndex;
    this.showDocument(this.currentDocIndex);
    this.disableNextBtn = false;
  }
  showDocument(currentDocIndex: number): void {
    for (let i = 0; i < this.documentsResult?.length; i++) {
      if (currentDocIndex === i) {
        this.activeDocument = this.documentsResult[i];
        break;
      }
    }
    if (this.activeDocument?.documentPurposeCode === 18) {
      this.disableSignBtn = true;
    } else {
      this.disableSignBtn = false;
    }
    this.documentPreview(this.activeDocument, this.currentDocIndex);
  }

  continueToPreviewTab(): void {
    this.enableSideBarNav.emit('active');
    this.stepper.next();
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }
}
