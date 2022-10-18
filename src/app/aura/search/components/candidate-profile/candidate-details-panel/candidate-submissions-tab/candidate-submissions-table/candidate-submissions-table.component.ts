import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentsService } from '../../../../../../../shared/service/documents/documents.service';
import { CandidateSubmissionResults } from '../../../../../../search/interface/candidate-profile/candidate-submission-interface';
import { ColumnsDetailsComponent } from '../columns-details/columns-details.component';
import { PreviewRTRDocumentComponent } from '../preview-rtr-document/preview-rtr-document.component';

@Component({
  selector: 'app-candidate-submissions-table',
  templateUrl: './candidate-submissions-table.component.html',
  styleUrls: ['./candidate-submissions-table.component.scss'],
})
export class CandidateSubmissionsTableComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() tableData!: CandidateSubmissionResults[] | null;
  @Input() isLoading = false;
  // tslint:disable-next-line: no-any
  @Input() columns: any;
  // tslint:disable-next-line: no-any
  @Input() displayedColumns: any;
  @Input() totalRows = 0;
  @Output() paginatorClicked = new EventEmitter();
  resultsLength = 0;
  searchKey: string[] = [];
  pageSizeOptions = [10, 20, 30, 40, 50];
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;

  constructor(
    private documentsService: DocumentsService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ColumnsDetailsComponent>,
    private dialogRefPreview: MatDialogRef<PreviewRTRDocumentComponent>
  ) {}

  ngOnInit(): void {}

  ngOnChanges(change: SimpleChanges): void {
    this.isLoading = true;
    if (change.tableData && change.tableData.currentValue) {
      this.updateTable(change.tableData.currentValue);
    }
    if (change.totalRows && change.totalRows.currentValue) {
      this.paginator?.firstPage();
    }
  }

  // tslint:disable-next-line: no-any
  isFloat(input: any): number | boolean {
    if (typeof input !== 'number' && input !== null) {
      if (
        isFinite(Date.parse(input.toString())) &&
        !isFinite(input.toString())
      ) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return input % 1 !== 0;
    }
  }

  // tslint:disable-next-line: no-any
  updateTable(tableData: any): void {
    this.isLoading = false;
    this.resultsLength = this.totalRows;
    this.dataSource = new MatTableDataSource(tableData);
    this.searchKey.push('jobTitle');
    this.searchKey.push('vendorName');
    this.searchKey.push('endClientName');
  }

  pageChanged(event: PageEvent): void {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;

    const currentPage = {
      pageIndex: pageIndex + 1,
      pageSize,
    };
    this.isLoading = true;
    this.paginatorClicked.emit(currentPage);
  }

  // tslint:disable-next-line: no-any
  select(row: CandidateSubmissionResults, e: any): void {
    if (
      !e.target.className.includes('jobTitle') &&
      !e.target.className.includes('vendorName') &&
      !e.target.className.includes('endClientName')
    ) {
      return;
    }
    if (e.target.className.includes('jobTitle')) {
      const dialogConfig = new MatDialogConfig();
      // tslint:disable-next-line: no-any
      const obj: any = {
        headerText: 'Job Description',
        description: row.jobDescription,
      };
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialog.open(ColumnsDetailsComponent, dialogConfig);
    }
    if (e.target.className.includes('vendorName')) {
    }
    if (e.target.className.includes('endClientName')) {
    }
  }

  previewDocument(row: CandidateSubmissionResults): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      docId: row.rtrDocumentId,
      displayName: row.rtrDocumentName,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRefPreview = this.dialog.open(
      PreviewRTRDocumentComponent,
      dialogConfig
    );
  }

  downloadDocument(row: CandidateSubmissionResults): void {
    if (row.rtrDocumentId) {
      this.documentsService.downloadDocumentFile(row.rtrDocumentId).subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/pdf | application/msword | application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          });
          const fileURL = URL.createObjectURL(file);
          let fileName = '';
          if (row.rtrDocumentFileExtension === '.pdf') {
            fileName = row.rtrDocumentName?.split('.')[0];
          } else {
            fileName = row.rtrDocumentName;
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
