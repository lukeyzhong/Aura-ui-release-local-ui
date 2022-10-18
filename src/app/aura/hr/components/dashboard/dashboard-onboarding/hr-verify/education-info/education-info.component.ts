import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { CandidateOnboardingEducationInformationResult } from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DocumentInformation } from '../../../../../../../shared/interface/document-info.interface';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { PreviewDocumentComponent } from '../../../../../../../shared/components/preview-document/preview-document.component';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-education-info',
  templateUrl: './education-info.component.html',
  styleUrls: ['./education-info.component.scss'],
})
export class EducationInfoComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  @Input() countKeysEducationInfo!: number;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  fileExtO = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  educationInformationResult!: CandidateOnboardingEducationInformationResult;
  mapCountry = new Map<number, string>();
  commentForm!: FormGroup;
  comment = '';
  commentKey = '';
  // tslint:disable-next-line: no-any
  commentValue!: any;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();
  showUpdateButton = false;
  stateName = '';
  keysSectionWise: string[] = [];
  countKeysSectionWise = 0;
  // tslint:disable-next-line: no-any
  stemFlagInfoList!: any;
  @ViewChild(MatMenuTrigger) commentMenusTrigger!: MatMenuTrigger;
  @Output() checkCommentLength = new EventEmitter();

  constructor(
    private matNotificationService: MatNotificationService,
    private fb: FormBuilder,
    private dialogConfirm: MatDialog,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private dialog: MatDialog,
    private dialogRefPreview: MatDialogRef<PreviewDocumentComponent>,
    private lookupService: LookupService,
    private documentsService: DocumentsService,
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
    this.getCountryLookup();
    this.getEducationInfo();
  }

  getCountryLookup(): void {
    this.lookupService.getCountryCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapCountry.set(country?.lookupCode, country?.description);
      }
    });
  }

  getEducationInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEducationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.educationInformationResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onChangeStemFlag(event: MatCheckboxChange, educationInfoId: string): void {
    this.stemFlagInfoList =
    {
      EducationInfoId: educationInfoId,
      StemFlag: event.checked
    };
    this.candidateOnboardingWorkflowService.updateHRVerifyEducationStemFlag(this.stemFlagInfoList).subscribe(
      (data) => {
        if (data?.errorCode === 0) {
          this.matNotificationService.success(':: Stem flag updated succesfully');
        } else {
          this.matNotificationService.warn(':: Error: ' + data?.errorMessage);
        }
      },
      (err) => {
        this.matNotificationService.showSnackBarMessage(
          'Oops! Request has failed',
          'error'
        );
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
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));
            this.checkCommentLength.emit(Object?.keys(this.hrComments)?.length);
          }
          // get the comment for specific section : start
          this.keysSectionWise = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('educationInformation')) {
                this.keysSectionWise.push(key);
              }
            }
          }
          this.countKeysEducationInfo = this.keysSectionWise.length;
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
              if (key.toString().includes('educationInformation')) {
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

  previewDocument(doc: DocumentInformation): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRefPreview = this.dialog.open(
      PreviewDocumentComponent,
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
