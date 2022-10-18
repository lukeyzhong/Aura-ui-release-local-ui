import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DocumentInformation } from '../../../../../../../shared/interface/document-info.interface';
import { EmployeeProfileApiService } from '../../../../../../../aura/search/service/employee/employee-profile-api.service';
import { EVerifyInfoResult } from '../../../../../../../aura/search/interface/employee-profile/employee-profile-api.interface';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { CaseResultsComponent } from '../../../../../../../aura/hr/components/dashboard/dashboard-onboarding/hr-verify/hr-verify-work-eligibility-i9/case-results/case-results.component';
import { PreviewDocumentComponent } from '../../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';

@Component({
  selector: 'app-i9-everify',
  templateUrl: './i9-everify.component.html',
  styleUrls: ['./i9-everify.component.scss'],
})
export class I9EverifyComponent implements OnInit, OnChanges {
  @Input() personName = '';
  @Input() employeeId = '';
  showEVerify = false;
  isLoading = false;
  resourceTypeCode = 7;
  documentPurposeTypes = '16,30';
  i9Result!: DocumentInformation[];
  eVerifyResult!: EVerifyInfoResult;
  // tslint:disable-next-line: no-any
  filteredI9Result: any = [];
  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  constructor(
    private employeeProfileApiService: EmployeeProfileApiService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private dialogRefPreview: MatDialogRef<PreviewDocumentComponent>,
    private documentsService: DocumentsService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(change: SimpleChanges): void {
    if (change.employeeId && change.employeeId.currentValue) {
      this.getI9DetailsByEmployeeId(change.employeeId.currentValue);
      this.getEVerifyInfoByEmployeeId(change.employeeId.currentValue);
      this.employeeId = change?.employeeId?.currentValue;
    }
    if (change.personName && change.personName.currentValue) {
      this.personName = change?.personName?.currentValue;
    }
  }

  getI9DetailsByEmployeeId(employeeId: string): void {
    this.isLoading = true;
    this.employeeProfileApiService
      .getDocumentsByPurposeIds(
        this.resourceTypeCode.toString(),
        employeeId,
        this.documentPurposeTypes
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.i9Result = data?.result;
          if (this.i9Result) {
            const groupByDocumentPurposeType = new Set(
              this.i9Result.map(
                (item: DocumentInformation) => item.documentPurposeCode
              )
            );
            this.filteredI9Result = [];
            groupByDocumentPurposeType.forEach((g) =>
              this.filteredI9Result.push({
                key: g,
                i9DocList: this.i9Result.filter(
                  (i: DocumentInformation) => i.documentPurposeCode === g
                ),
              })
            );
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getEVerifyInfoByEmployeeId(employeeId: string): void {
    this.isLoading = true;
    this.employeeProfileApiService
      .getEVerifyInfoByEmployeeId(employeeId)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.eVerifyResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  viewCaseResult(): void {
    if (this.eVerifyResult?.employeeOnboardingId) {
      const dialogConfig = new MatDialogConfig();
      // tslint:disable-next-line: no-any
      const obj: any = {
        empOnboardingId: this.eVerifyResult?.employeeOnboardingId,
      };
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
      dialogConfig.width = '30%';
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialog.open(CaseResultsComponent, dialogConfig);
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

  eVerifyDetails(): void {
    this.showEVerify = !this.showEVerify;
  }
}
