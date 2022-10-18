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
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { USCISResults } from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { CaseResultsComponent } from '../../dashboard-onboarding/hr-verify/hr-verify-work-eligibility-i9/case-results/case-results.component';
import { UscisUpdateComponent } from '../uscis-update/uscis-update.component';

@Component({
  selector: 'app-uscis-table-details',
  templateUrl: './uscis-table-details.component.html',
  styleUrls: ['./uscis-table-details.component.scss'],
})
export class UscisTableDetailsComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() tableData!: USCISResults[] | null;
  @Input() isLoading = false;
  // tslint:disable-next-line: no-any
  @Input() columns: any;
  // tslint:disable-next-line: no-any
  @Input() displayedColumns: any;
  @Input() totalRows = 0;
  refreshList = true;
  @Output() uscisUpdateSuccess = new EventEmitter();
  @Output() paginatorClicked = new EventEmitter();
  resultsLength = 0;
  pageSizeOptions = [10, 20, 30, 40, 50];
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  // tslint:disable-next-line: no-any
  constructor( private dialog: MatDialog, private dialogRef: MatDialogRef<any>) {}

  ngOnInit(): void {
  }

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

  editRecord(row: USCISResults): void {
    if (row?.employeeOnboardingId) {
      const dialogConfig = new MatDialogConfig();
      // tslint:disable-next-line: no-any
      const obj: any = {
        employeeOnboardingId: row?.employeeOnboardingId,
        uscisCaseNumber: row?.uscisCaseNumber,
        submittedOn: row?.submittedOn,
        empCode: row?.employeeCode,
        fullName: row?.fullName,
        hireDate: row?.hireDate
      };
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
      dialogConfig.width = '30%';
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialog.open(
        UscisUpdateComponent,
        dialogConfig
      );
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result === 'success') {
          this.uscisUpdateSuccess.emit(this.refreshList);
        }
      });
    }
  }

  viewRecord(row: USCISResults): void {
    if (row?.employeeOnboardingId) {
      const dialogConfig = new MatDialogConfig();
      // tslint:disable-next-line: no-any
      const obj: any = {
        empOnboardingId: row?.employeeOnboardingId,
      };
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
      dialogConfig.width = '30%';
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialog.open(
        CaseResultsComponent,
        dialogConfig
      );
    }
  }

}

