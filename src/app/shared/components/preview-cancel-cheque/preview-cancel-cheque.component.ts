import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { DocumentsService } from '../../service/documents/documents.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-preview-cancel-cheque',
  templateUrl: './preview-cancel-cheque.component.html',
  styleUrls: ['./preview-cancel-cheque.component.scss']
})
export class PreviewCancelChequeComponent implements OnInit {
  displayName = '';
  currentDocId: string;
  currentDocName!: string;
  currentFileExt!: string;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  docURL = '';
  imageExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  isImage = false;
  isNotImage = false;
  isLoading = false;
  isPdf = false;
  errorMessage = '';
  id = '';

  degreeVal = 0;
  zoomVal = 1.0;
  pdfRotation = 0;
  pdfZoom = 1.0;
  zoomValueOnUI = 0;

  constructor(
    private documentsService: DocumentsService,
    private dialogRef: MatDialogRef<PreviewCancelChequeComponent>,
    private domSanitizer: DomSanitizer,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.currentDocId = data?.obj?.currentDocId;
    this.currentDocName = data?.obj?.currentDocName;
    this.currentFileExt = data?.obj?.currentFileExt;
    let docType = 0;
    if (this.currentDocId) {
      if (this.currentDocId) {
        this.id = this.currentDocId;
        this.displayName = this.currentDocName;
        docType = 0;
      }
      this.isLoading = true;
      this.documentsService.getDocumentFile(this.id, docType).subscribe(rec => {
        if (rec.byteLength === 94) {
          this.errorMessage = 'Requested data not loaded. Please try again.';
          this.isLoading = false;
        } else {
          this.errorMessage = '';
          const file = new Blob([rec], {
            type: 'image/* | application/pdf',
          });

          const fileURL = URL.createObjectURL(file);
          this.isImage =
            this.imageExt.includes(
              this.currentFileExt as string
            ) === true
              ? true
              : false;

          if (this.isImage) {
            const url = this.domSanitizer.bypassSecurityTrustUrl(
              fileURL
            ) as string;
            this.docURL = url;
          } else if (this.currentFileExt === '.pdf') {
            this.isPdf = true;
            this.docURL = fileURL;
          } else {
            this.isPdf = true;
            this.docURL = fileURL;
          }
          this.isLoading = false;
        }
      },
        // tslint:disable-next-line: no-any
        (err: any) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
    }
  }

  ngOnInit(): void {
  }

  rotateZoom(val: string): void{
    if (val === 'rotate'){
    this.degreeVal = this.degreeVal + 90;
    if (this.degreeVal === 360){
      this.degreeVal = 0;
    }
    this.pdfRotation = this.pdfRotation + 90;
    }

    if (val === 'zoomin'){
      this.zoomVal = this.zoomVal + 0.5;
      this.pdfZoom = this.pdfZoom + 0.5;
      this.zoomValueOnUI = this.zoomValueOnUI + 10;
    }

    if (val === 'zoomout'){
      this.zoomVal = this.zoomVal - 0.5;
      this.pdfZoom = this.pdfZoom - 0.5;
      this.zoomValueOnUI = this.zoomValueOnUI - 10;
    }

    const element = document?.getElementById('imgDiv');
    if (element) {
    element.style.transform = `scale(${this.zoomVal}) rotate(${this.degreeVal}deg)`;
    }
  }

  closePreview(): void {
    this.dialogRef.close('cancel');
  }
}
