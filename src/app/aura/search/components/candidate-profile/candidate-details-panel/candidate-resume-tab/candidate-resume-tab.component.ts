import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { DocumentsService } from 'src/app/shared/service/documents/documents.service';
import { ResumeFullviewComponent } from './resume-fullview/resume-fullview.component';

@Component({
  selector: 'app-candidate-resume-tab',
  templateUrl: './candidate-resume-tab.component.html',
  styleUrls: ['./candidate-resume-tab.component.scss'],
})
export class CandidateResumeTabComponent implements OnInit, OnChanges {
  @Input() personId = '';
  @Input() personName = '';
  @Input() resumeDocumentId = '';
  @Input() displayName = '';
  docURL = '';
  isResumeExist!: boolean;
  isLoading = false;
  errorMessage = '';

  constructor(
    private documentsService: DocumentsService,
    private dialog: MatDialog,
    private dialogReffullView: MatDialogRef<ResumeFullviewComponent>
  ) {}

  ngOnInit(): void {}

  ngOnChanges(change: SimpleChanges): void {
    if (
      (change.personId && change.personId.currentValue) ||
      (change.personName && change.personName.currentValue)
    ) {
      this.resumeDocumentId = change.resumeDocumentId?.currentValue;
      this.displayName = change.displayName?.currentValue;
      this.getCandidateResumeByDocId(this.resumeDocumentId);
    }
  }

  getCandidateResumeByDocId(resumeId: string): void {
    if (resumeId) {
      this.isLoading = true;
      this.documentsService.getDocumentFile(resumeId).subscribe(
        (data) => {
          if (data.byteLength === 94) {
            this.errorMessage = 'Requested data not loaded. Please try again.';
            this.isResumeExist = false;
            this.docURL = '';
            this.isLoading = false;
          } else {
            this.errorMessage = '';
            const file = new Blob([data], {
              type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const fileURL = URL.createObjectURL(file);
            this.docURL = fileURL;
            this.isResumeExist = true;
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

  downloadDocument(): void {
    if (this.resumeDocumentId) {
      this.documentsService
        .downloadDocumentFile(this.resumeDocumentId)
        .subscribe(
          (data) => {
            const file = new Blob([data], {
              type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const fileURL = URL.createObjectURL(file);
            let fileName = '';
            if (this.displayName.split('.')[1] === 'pdf') {
              fileName = this.displayName.split('.')[0];
            } else {
              fileName = this.displayName;
            }
            saveAs(fileURL, fileName);
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  resumeFullView(): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      isdocURL: this.docURL,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.maxWidth = '100vw';
    (dialogConfig.maxHeight = '100vh'),
      (dialogConfig.height = '100%'),
      (dialogConfig.width = '100%'),
      (dialogConfig.data = {
        obj,
      });
    this.dialogReffullView = this.dialog.open(
      ResumeFullviewComponent,
      dialogConfig
    );
  }
}
