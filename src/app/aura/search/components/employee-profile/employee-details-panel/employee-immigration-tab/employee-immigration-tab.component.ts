import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  EmployeeImmigrationResult,
  ImmigrationAddPopupRecord,
  ImmigrationEditPopupRecord,
} from '../../../../interface/employee-profile/employee-profile-immigration.interface';
import { EmployeeProfileApiService } from '../../../../service/employee/employee-profile-api.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { AddEditImmigrationComponent } from './add-edit-immigration/add-edit-immigration.component';
import { DatePipe } from '@angular/common';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { saveAs } from 'file-saver';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';

@Component({
  selector: 'app-employee-immigration-tab',
  templateUrl: './employee-immigration-tab.component.html',
  styleUrls: ['./employee-immigration-tab.component.scss'],
  providers: [DatePipe],
})
export class EmployeeImmigrationTabComponent implements OnInit, OnChanges {
  @Input() personId = '';
  @Input() personName = '';
  immigrationResult!: EmployeeImmigrationResult[];
  // tslint:disable-next-line: no-any
  filteredImmigrationResult: any = [];
  isLoading = false;
  date = new Date();
  currentDate!: string;
  perId!: string;
  toggleMoreLess: boolean[] = [];
  btnMoreLessText: string[] = [];
  togglePreviousMoreOrLess: boolean[] = [];
  btnPreviousMoreLessText: string[] = [];
  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  constructor(
    private employeeProfileApiService: EmployeeProfileApiService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private documentsService: DocumentsService,
    private dialogRef: MatDialogRef<AddEditImmigrationComponent>,
    private dialogRefPreview: MatDialogRef<PreviewDocumentComponent>
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: no-non-null-assertion
    this.currentDate = this.datePipe.transform(this.date, 'yyyy-MM-dd')!;
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change.personId && change.personId.currentValue) {
      this.setImmigrationTabByPersonId(change.personId.currentValue);
      this.perId = change.personId.currentValue;
    }
  }

  setImmigrationTabByPersonId(personId: string): void {
    this.isLoading = true;
    this.employeeProfileApiService.getImmigrationByPersonId(personId).subscribe(
      (data) => {
        this.isLoading = false;
        this.immigrationResult = data?.result;
        if (this.immigrationResult) {
          const groupByWorkAuthorizationType = new Set(
            this.immigrationResult.map(
              (item: EmployeeImmigrationResult) => item.workAuthorizationType
            )
          );
          this.filteredImmigrationResult = [];
          groupByWorkAuthorizationType.forEach((g) =>
            this.filteredImmigrationResult.push({
              key: g,
              immigrationList: this.immigrationResult.filter(
                (i: EmployeeImmigrationResult) => i.workAuthorizationType === g
              ),
            })
          );
        }

        for (let i = 0; i < this.immigrationResult?.length; i++) {
          this.btnMoreLessText[i] = 'More';
          this.toggleMoreLess[i] = true;
          this.btnPreviousMoreLessText[i] = 'More';
          this.togglePreviousMoreOrLess[i] = true;
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  addImmigrationRecord(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: ImmigrationAddPopupRecord = {
      action: actionType,
      personId: this.perId,
      immigrationData: this.immigrationResult,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditImmigrationComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setImmigrationTabByPersonId(this.personId);
      }
    });
  }

  editImmigrationRecord(
    actionType: string,
    empImmigrationResult: EmployeeImmigrationResult
  ): void {
    const dialogConfig = new MatDialogConfig();
    const obj: ImmigrationEditPopupRecord = {
      action: actionType,
      personId: this.perId,
      immigrationData: empImmigrationResult,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditImmigrationComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setImmigrationTabByPersonId(this.personId);
      }
    });
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
            this.fileExt.includes('.' + doc.displayName.split('.')[1]) ||
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

  showMoreLess(i: number): void {
    this.btnMoreLessText[i] =
      this.btnMoreLessText[i] === 'More' ? 'Less' : 'More';
  }

  showMoreLessPrevious(i: number): void {
    this.btnPreviousMoreLessText[i] =
      this.btnPreviousMoreLessText[i] === 'More' ? 'Less' : 'More';
  }
}
