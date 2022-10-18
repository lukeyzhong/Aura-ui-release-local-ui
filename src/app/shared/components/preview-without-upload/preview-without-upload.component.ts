import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview-without-upload',
  templateUrl: './preview-without-upload.component.html',
  styleUrls: ['./preview-without-upload.component.scss']
})
export class PreviewWithoutUploadComponent implements OnInit {
  displayName = '';
  currentDoc!: File;
  // tslint:disable-next-line: no-any
  docURL!: any;
  imageExt = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'];
  isImage = false;
  isLoading = false;
  isPdf = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<PreviewWithoutUploadComponent>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.currentDoc = data?.obj?.docFile;
    this.displayName = data?.obj?.docFile?.name;
    if (this.displayName.split('.')[1] === 'pdf'){
      this.isPdf = true;
    }
    else{
      this.isImage = this.imageExt.includes(this.displayName.split('.')[1]) === true ? true : false;
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    if (this.displayName.split('.')[1] === 'pdf'){
      const fileURL = URL.createObjectURL(this.currentDoc);
      this.docURL = fileURL;
    }
    else{
      const reader = new FileReader();
      reader.readAsDataURL(this.currentDoc);
      reader.onload = (EVENT) => {
      this.docURL = reader?.result;
    };
    }
    this.isLoading = false;
  }

  closePreview(): void {
    this.dialogRef.close('cancel');
  }

}
