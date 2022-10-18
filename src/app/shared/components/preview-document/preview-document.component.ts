import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DocumentsService } from '../../service/documents/documents.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-preview-document',
  templateUrl: './preview-document.component.html',
  styleUrls: ['./preview-document.component.scss'],
})
export class PreviewDocumentComponent implements OnInit {
  displayName = '';
  // tslint:disable-next-line: no-any
  currentDoc!: any;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  docURL = '';
  imageExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  isImage = false;
  isNotImage = false;
  isLoading = false;
  isPdf = false;
  errorMessage = '';
  id = '';
  formType = '';
  typeOfDoc = '';

  constructor(
    private documentsService: DocumentsService,
    private dialogRef: MatDialogRef<PreviewDocumentComponent>,
    private domSanitizer: DomSanitizer,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.currentDoc = data?.obj?.currentDoc;
    this.docURL = data?.obj?.fileURL;
    this.formType = data?.obj?.formType;
    this.isLoading = data?.obj?.isLoading;
    this.errorMessage = data?.obj?.errorMessage;

    // Preview HR-Verify State Tax
    this.typeOfDoc = data?.obj?.type;

    if (this.docURL === undefined) {
      let docType = 0;
      if (this.currentDoc) {
        if (this.currentDoc.documentId) {
          this.id = this.currentDoc.documentId;
          this.displayName = this.currentDoc.displayName;
          docType = 0;
        } else if (this.currentDoc.webFormTypeId) {
          this.id = this.currentDoc.webFormTypeId;
          this.displayName = this.currentDoc.webformName;
          docType = 40;
        } else if (this.currentDoc.templateId) {
          this.id = this.currentDoc.templateId;
          this.displayName = this.currentDoc.templateName;
          docType = 41;
        } else if (this.currentDoc.resourceValue) {
          this.id = this.currentDoc.resourceValue;
          this.displayName = this.currentDoc.displayName;
          docType = this.currentDoc.resourceTypeCode;
        } else if (this.currentDoc.resourceValue) {
          this.id = this.currentDoc.resourceValue;
          this.displayName = this.currentDoc.displayName;
          docType = this.currentDoc.resourceTypeCode;
        }
        this.isLoading = true;
        this.documentsService.getDocumentFile(this.id, docType).subscribe(
          // tslint:disable-next-line: no-shadowed-variable
          (data) => {
            if (data.byteLength === 94) {
              this.errorMessage =
                'Requested data not loaded. Please try again.';
              this.isLoading = false;
            } else {
              this.errorMessage = '';
              const file = new Blob([data], {
                type: 'image/* | application/pdf',
              });

              const fileURL = URL.createObjectURL(file);
              this.isImage =
                this.imageExt.includes(
                  this.currentDoc.fileExtension as string
                ) === true
                  ? true
                  : false;

              if (this.isImage) {
                const url = this.domSanitizer.bypassSecurityTrustUrl(
                  fileURL
                ) as string;
                this.docURL = url;
              } else if (this.currentDoc.fileExtension === '.pdf') {
                this.isPdf = true;
                this.docURL = fileURL;
              } else {
                this.isPdf = true;
                this.docURL = fileURL;
              }
              this.isLoading = false;
            }
          },
          (err) => {
            console.warn(err);
            this.isLoading = false;
          }
        );
      } else if (this.currentDoc === null) {
        this.errorMessage = 'Requested data not loaded. Please try again.';
        this.isLoading = false;
      }
    } else {
      this.isPdf = true;
      this.isLoading = false;
      this.displayName = data?.obj?.displayName;
    }
  }

  ngOnInit(): void {}

  closePreview(): void {
    this.dialogRef.close('cancel');
  }

  downloadStateTaxWithHolding(
    resourceValue: string,
    resourceTypeCode: number
  ): void {
    if (resourceValue) {
      this.documentsService
        .downloadDocumentFile(resourceValue, resourceTypeCode)
        .subscribe(
          (data) => {
            const file = new Blob([data], {
              type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            const fileURL = URL.createObjectURL(file);
            saveAs(fileURL, 'State Tax WithHolding');
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }
}
