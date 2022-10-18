import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { EmployeePurchaseOrderResult } from '../../../../interface/employee-profile/employee-profile-contracts.interface';
import { EmployeeProfileApiService } from '../../../../service/employee/employee-profile-api.service';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';

@Component({
  selector: 'app-employee-contracts-tab',
  templateUrl: './employee-contracts-tab.component.html',
  styleUrls: ['./employee-contracts-tab.component.scss'],
})
export class EmployeeContractsTabComponent implements OnInit, OnChanges {
  // GET PO's
  employeePOResult!: EmployeePurchaseOrderResult[];

  // tslint:disable-next-line: no-any
  filteredPOList: any = [];

  @Input() employeeId = '';
  @Input() personId = '';
  @Input() personName = '';
  isLoading = false;

  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

  toggleMoreLess: boolean[] = [];
  btnMoreLessText: string[] = [];
  contractsMoreOrLess: boolean[] = [];
  btnMoreLessContractsText: string[] = [];

  constructor(
    private employeeProfileApiService: EmployeeProfileApiService,
    private dialogRef: MatDialogRef<PreviewDocumentComponent>,
    private dialog: MatDialog,
    private documentsService: DocumentsService
  ) {}

  ngOnChanges(change: SimpleChanges): void {
    if (
      (change?.personId && change?.personId?.currentValue) ||
      (change?.employeeId && change?.employeeId?.currentValue)
    ) {
      if (change?.personId && change?.personId?.currentValue) {
        this.personId = change?.personId?.currentValue;
      }
      if (change?.employeeId && change?.employeeId?.currentValue) {
        this.employeeId = change?.employeeId?.currentValue;
      }
      this.setPurchaseOrderByEmployeeId(
        this.employeeId,
        change?.personName?.currentValue
      );
    }
  }

  ngOnInit(): void {}

  setPurchaseOrderByEmployeeId(employeeId: string, personName: string): void {
    this.isLoading = true;
    this.employeeProfileApiService
      .getPurchaseOrderByEmployeeId(employeeId)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.employeePOResult = data?.result;
          this.personName = personName;

          if (this.employeePOResult) {
            const groupByClientNameList = new Set(
              this.employeePOResult?.map(
                (item: EmployeePurchaseOrderResult) => item?.clientName
              )
            );
            this.filteredPOList = [];
            groupByClientNameList?.forEach((g) =>
              this.filteredPOList?.push({
                key: g,
                poList: this.employeePOResult?.filter(
                  (i: EmployeePurchaseOrderResult) => i?.clientName === g
                ),
              })
            );
          }

          for (let i = 0; i < this.employeePOResult?.length; i++) {
            this.btnMoreLessText[i] = 'More';
            this.toggleMoreLess[i] = true;
          }
          for (let i = 0; i < this.filteredPOList?.length; i++) {
            this.btnMoreLessContractsText[i] = 'More';
            this.contractsMoreOrLess[i] = true;
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }
  downloadDocument(doc: DocumentInformation): void {
    if (doc) {
      this.documentsService.getDocumentFile(doc?.documentId).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'image/* | application/pdf' });
          const fileURL = URL.createObjectURL(file);
          let fileName = '';
          if (
            this.fileExt?.includes('.' + doc?.displayName?.split('.')[1]) ||
            doc?.displayName?.split('.')[1] === 'pdf'
          ) {
            fileName = doc?.displayName;
          } else {
            fileName = doc?.displayName + doc?.fileExtension;
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
      personId: this.personId,
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(PreviewDocumentComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setPurchaseOrderByEmployeeId(this.employeeId, this.personName);
      }
    });
  }

  showMoreLess(i: number): void {
    this.btnMoreLessText[i] =
      this.btnMoreLessText[i] === 'More' ? 'Less' : 'More';
  }
  showMoreLessContracts(i: number): void {
    this.btnMoreLessContractsText[i] =
      this.btnMoreLessContractsText[i] === 'More' ? 'Less' : 'More';
  }
}
