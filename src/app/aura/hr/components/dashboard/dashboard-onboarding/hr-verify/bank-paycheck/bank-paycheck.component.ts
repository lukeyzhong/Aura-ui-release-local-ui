import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { BankPaycheckInfo } from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { PreviewCancelChequeComponent } from '../../../../../../../shared/components/preview-cancel-cheque/preview-cancel-cheque.component';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';
import { DocumentInformation } from '../../../../../../../shared/interface/document-info.interface';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-bank-paycheck',
  templateUrl: './bank-paycheck.component.html',
  styleUrls: ['./bank-paycheck.component.scss'],
})
export class BankPaycheckComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  @Input() countKeysBanksPaychecksInfo!: number;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  fileExtO = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  bankPaycheckInfo!: BankPaycheckInfo[];
  commentForm!: FormGroup;
  comment = '';
  commentKey = '';
  // tslint:disable-next-line: no-any
  commentValue!: any;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();
  showUpdateButton = false;
  keysSectionWise: string[] = [];
  countKeysSectionWise = 0;
  @ViewChild(MatMenuTrigger) commentMenusTrigger!: MatMenuTrigger;
  @Output() checkCommentLength = new EventEmitter();

  constructor(
    private matNotificationService: MatNotificationService,
    private fb: FormBuilder,
    private dialogConfirm: MatDialog,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private dialog: MatDialog,
    private documentsService: DocumentsService,
    private dialogRefPreview: MatDialogRef<PreviewCancelChequeComponent>
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
    this.getBanksAndPaychecksDetails();
  }

  getBanksAndPaychecksDetails(): void {
    this.candidateOnboardingWorkflowService
      .getBanksAndPaychecks(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.bankPaycheckInfo = data?.result?.bankInfo;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.hrComments = JSON.parse(data?.result);
          if (this.hrComments) {
            this.checkCommentLength.emit(Object?.keys(this.hrComments)?.length);
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));
          }
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
              if (key.toString().includes('banksPaychecks')) {
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
    this.dialogRefPreview = this.dialog.open(
      PreviewCancelChequeComponent,
      dialogConfig
    );
  }

  downloadDocument(doc: DocumentInformation): void {
    if (doc) {
      // tslint:disable-next-line: no-non-null-assertion
      this.documentsService.getDocumentFile(doc?.documentId!).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'image/* | application/pdf' });
          const fileURL = URL.createObjectURL(file);
          let fileName = '';
          if (
            this.fileExtO.includes('.' + doc.displayName.split('.')[1]) ||
            doc.displayName.split('.')[1] === 'pdf'
          ) {
            fileName = doc.displayName;
          } else {
            fileName = doc.displayName + doc.fileExtension;
          }
          saveAs(fileURL, fileName);
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }
}
