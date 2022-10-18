import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { DocumentInformation } from '../interface/document-info.interface';

export abstract class DocumentUploadInfo {
  headerTitle = '';
  issueMaxDate = '';
  issueMinDate = '';
  expiryMinDate = '';
  expiryMaxDate = '';
  endMinDate = '';
  endMaxDate = '';
  minDate = '';
  actionType = '';
  isLoading = false;
  isNewDocument!: boolean;
  personId = '';
  files: File[] = [];
  docAddId: string[] = [];
  docAddDisplayName: string[] = [];
  docAddFileDescription: string[] = [];
  docAddFile: File[] = [];
  docUpdateId: string[] = [];
  docUpdateDisplayName: string[] = [];
  docUpdateFileDescription: string[] = [];
  docDeleteId: string[] = [];
  errorMsg = '';
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  totalFiles = 0;
  newFileAddedCount = 0;
  fileExt = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'pdf'];
  ext = ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp'];

  constructor(
    // tslint:disable-next-line: no-any
    protected dialogRef: MatDialogRef<any>,
    protected dialogConfirm: MatDialog,
    protected fb: FormBuilder
  ) {}

  setDocumentProperty(documents: DocumentInformation[]): FormArray {
    const formArray = new FormArray([]);
    documents?.forEach((d) => {
      formArray.push(
        this.fb.group({
          documentId: d.documentId,
          displayName: [d.displayName.split('.')[0], Validators.maxLength(100)],
          fileDescription: [
            d.fileDescription === 'null' ? '' : d.fileDescription,
            Validators.maxLength(500),
          ],
          fileExtension: d.fileExtension,
        })
      );
    });
    return formArray;
  }

  setMinAndMaxIssueAndExpiryDate(): void {
    const issueCurrentDate = new Date();
    this.issueMaxDate = new Date().toISOString().slice(0, 10);
    const past10Years = issueCurrentDate.getFullYear() - 10;
    issueCurrentDate.setFullYear(past10Years);
    this.issueMinDate = issueCurrentDate.toISOString().slice(0, 10);

    const minCurrentDate = new Date();
    const past40Years = minCurrentDate.getFullYear() - 40;
    minCurrentDate.setFullYear(past40Years);
    this.minDate = minCurrentDate.toISOString().slice(0, 10);

    this.endMinDate = this.issueMinDate;
    this.endMaxDate = this.issueMaxDate;

    const expiryCurrentMaxDate = new Date();
    const next15Years = expiryCurrentMaxDate.getFullYear() + 15;
    expiryCurrentMaxDate.setFullYear(next15Years);
    this.expiryMaxDate = expiryCurrentMaxDate.toISOString().slice(0, 10);

    const expiryCurrentMinDate = new Date();
    const next10Years = issueCurrentDate.getFullYear() + 10;
    expiryCurrentMinDate.setFullYear(next10Years);
    this.expiryMinDate = expiryCurrentMinDate.toISOString().slice(0, 10);
  }

  addDocPropertyFormGroup(): FormGroup {
    return this.fb.group({
      documentId: [''],
      displayName: ['', Validators.maxLength(100)],
      fileDescription: ['', Validators.maxLength(500)],
      fileExtension: [''],
    });
  }

  addDocProperty(file: File): FormGroup {
    return this.fb.group({
      documentId: [''],
      displayName: [file.name.split('.')[0], Validators.maxLength(100)],
      fileDescription: ['', Validators.maxLength(500)],
      fileExtension: ['.' + file.name.split('.')[1]],
    });
  }
  setDocProperty(files: File[]): FormArray {
    const formArray = new FormArray([]);
    for (const file of files) {
      formArray.push(
        this.fb.group({
          documentId: '',
          displayName: [file.name.split('.')[0], Validators.maxLength(100)],
          fileDescription: ['', Validators.maxLength(500)],
          fileExtension: ['.' + file.name.split('.')[1]],
        })
      );
    }
    return formArray;
  }

  onCancel(e: Event, formName: FormGroup = new FormGroup({})): void {
    if (formName.pristine && formName.status === 'INVALID') {
      this.dialogRef.close('cancel');
    } else {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to leave without saving?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef.close('cancel');
        }
      });
      e.preventDefault();
    }
  }
}
