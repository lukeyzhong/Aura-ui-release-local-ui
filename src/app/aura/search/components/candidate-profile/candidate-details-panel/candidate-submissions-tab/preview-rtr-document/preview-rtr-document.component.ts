import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';

@Component({
  selector: 'app-preview-rtr-document',
  templateUrl: './preview-rtr-document.component.html',
  styleUrls: ['./preview-rtr-document.component.scss'],
})
export class PreviewRTRDocumentComponent implements OnInit {
  docURL = '';
  isLoading = false;
  isRTRDocExist!: boolean;
  currentDocId = '';
  displayName = '';
  errorMessage = '';
  constructor(
    private documentsService: DocumentsService,
    private dialogRef: MatDialogRef<PreviewRTRDocumentComponent>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.currentDocId = data?.obj?.docId;
    this.displayName = data?.obj?.displayName.split('.')[0];

    if (this.currentDocId) {
      this.isLoading = true;
      this.documentsService.getDocumentFile(this.currentDocId).subscribe(
        // tslint:disable-next-line: no-shadowed-variable
        (data) => {
          if (data.byteLength === 94) {
            this.errorMessage = 'Requested data not loaded. Please try again.';
            this.isRTRDocExist = false;
            this.docURL = '';
            this.isLoading = false;
          } else {
            this.errorMessage = '';
            const file = new Blob([data], {
              type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const fileURL = URL.createObjectURL(file);
            this.docURL = fileURL;
            this.isRTRDocExist = true;
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

  ngOnInit(): void {}

  closePreview(): void {
    this.dialogRef.close('cancel');
  }
}
