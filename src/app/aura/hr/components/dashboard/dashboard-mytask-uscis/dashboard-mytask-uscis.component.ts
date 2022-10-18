import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { PageConfig } from '../../../../../aura/search/interface/table.interface';
import {
  DetailsConfig,
  USCISResults,
} from '../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';

@Component({
  selector: 'app-dashboard-mytask-uscis',
  templateUrl: './dashboard-mytask-uscis.component.html',
  styleUrls: ['./dashboard-mytask-uscis.component.scss'],
})
export class DashboardMytaskUscisComponent implements OnInit {
  uscisTableDetails!: USCISResults[];
  total = 0;
  pendingTotal = 0;
  closedTotal = 0;
  pageNum = 1;
  pageSize = 10;
  searchKey = 'searchterm';
  searchPending = '';
  searchClosed = '';
  yearKey = 'year';
  yearPending = '';
  yearClosed = '';
  enableSearch = true;
  closedYear = new FormControl([]);
  pendingYear = new FormControl([]);
  currDate!: Date;
  year: number[] = [];
  currYear = '';
  tabIndex = 0;

  // Pending USCIS
  uscisPendingTablePanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'employeeCode',
      'fullName',
      'uscisCaseNumber',
      'hireDate',
      'status',
      'submittedOn',
      'actionEdit',
    ],
    columns: [
      {
        headerDisplay: 'Employee OnboardingId',
        key: 'employeeOnboardingId',
      },
      {
        headerDisplay: 'Employee Code',
        key: 'employeeCode',
      },
      {
        headerDisplay: 'Full Name',
        key: 'fullName',
      },
      {
        headerDisplay: 'Case Number',
        key: 'uscisCaseNumber',
      },
      {
        headerDisplay: 'Hire Date',
        key: 'hireDate',
      },
      {
        headerDisplay: 'Status',
        key: 'status',
      },
      {
        headerDisplay: 'Submitted On',
        key: 'submittedOn',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Closed USCIS
  uscisClosedTablePanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'employeeCode',
      'fullName',
      'uscisCaseNumber',
      'hireDate',
      'eligibilityStatement',
      'documentExpiryDate',
      'submittedOn',
      'actionView',
    ],
    columns: [
      {
        headerDisplay: 'Employee OnboardingId',
        key: 'employeeOnboardingId',
      },
      {
        headerDisplay: 'Employee Code',
        key: 'employeeCode',
      },
      {
        headerDisplay: 'Full Name',
        key: 'fullName',
      },
      {
        headerDisplay: 'Case Number',
        key: 'uscisCaseNumber',
      },
      {
        headerDisplay: 'Hire Date',
        key: 'hireDate',
      },
      {
        headerDisplay: 'Case Results',
        key: 'eligibilityStatement',
      },
      {
        headerDisplay: 'Document Expiry Date',
        key: 'documentExpiryDate',
      },
      {
        headerDisplay: 'Submitted On',
        key: 'submittedOn',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(private hrDashboardService: HrDashboardService, private router: Router) {}

  ngOnInit(): void {
    this.currDate = new Date();
    this.currYear = this.currDate.getFullYear().toString();
    this.yearPending = this.currYear;
    this.yearClosed = this.currYear;
    for (let i = 0; i <= 4; i++) {
      this.year.push(this.currDate?.getUTCFullYear() - i);
    }
    this.pendingYear.setValue(this.currDate?.getUTCFullYear());
    this.closedYear.setValue(this.currDate?.getUTCFullYear());
    this.getUSCISPendingRecords();
    this.getUSCISClosedRecords();
  }

  getUSCISPendingRecords(): void {
    this.hrDashboardService
      .getUSCISPendingCases(
        this.searchPending,
        this.yearPending,
        this.pageNum,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.uscisTableDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          this.pendingTotal = data?.result?.virtualCount;
          if (this.total === 0) {
            this.enableSearch = false;
          }
          this.uscisPendingResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getUSCISClosedRecords(): void {
    this.hrDashboardService
      .getUSCISClosedCases(
        this.searchClosed,
        this.yearClosed,
        this.pageNum,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.uscisTableDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          this.closedTotal = data?.result?.virtualCount;
          if (this.total === 0) {
            this.enableSearch = false;
          }
          this.uscisClosedResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  pendingYearSelection(): void {
    this.yearPending = this.pendingYear.value;
    this.uscisPendingTablePanelConfig.isLoading = true;
    this.getUSCISPendingRecords();
  }

  closedYearSelection(): void {
    this.yearClosed = this.closedYear.value;
    this.uscisClosedTablePanelConfig.isLoading = true;
    this.getUSCISClosedRecords();
  }

  uscisPendingResultParser(uscisResults: USCISResults[]): void {
    this.uscisPendingTablePanelConfig.isLoading = false;
    this.uscisPendingTablePanelConfig.totalRows = this.total;
    this.uscisPendingTablePanelConfig.tableData = uscisResults?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  uscisClosedResultParser(uscisResults: USCISResults[]): void {
    this.uscisClosedTablePanelConfig.isLoading = false;
    this.uscisClosedTablePanelConfig.totalRows = this.total;
    this.uscisClosedTablePanelConfig.tableData = uscisResults?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  performUSCISPendingSearch(sPending: string): void {
    if (sPending.length >= 2 || sPending.length === 0) {
      if (sPending.length > 0) {
        this.searchPending = sPending;
      } else {
        this.searchPending = '';
      }
      this.uscisPendingTablePanelConfig.isLoading = true;
      this.getUSCISPendingRecords();
    }
  }

  performUSCISClosedSearch(sClosed: string): void {
    if (sClosed.length >= 2 || sClosed.length === 0) {
      if (sClosed.length > 0) {
        this.searchClosed = sClosed;
      } else {
        this.searchClosed = '';
      }
      this.uscisClosedTablePanelConfig.isLoading = true;
      this.getUSCISClosedRecords();
    }
  }

  getNextPendingRecords(event: PageConfig): void {
      this.hrDashboardService
        .getUSCISPendingCases(
          this.searchPending,
          this.yearPending,
          event.pageIndex,
          event.pageSize
        )
        .subscribe(
          (data) => {
            this.uscisTableDetails = data?.result?.results;
            this.total = data?.result?.virtualCount;
            this.uscisPendingResultParser(data?.result?.results);
          },
          (err) => {
            console.warn(err);
          }
        );
  }

  getNextClosedRecords(event: PageConfig): void {
      this.hrDashboardService
        .getUSCISClosedCases(
          this.searchClosed,
          this.yearClosed,
          event.pageIndex,
          event.pageSize
        )
        .subscribe(
          (data) => {
            this.uscisTableDetails = data?.result?.results;
            this.total = data?.result?.virtualCount;
            this.uscisClosedResultParser(data?.result?.results);
          },
          (err) => {
            console.warn(err);
          }
        );
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabIndex = tabChangeEvent.index;
  }

  refreshUSCISPendingList(refreshList: boolean): void {
    if (refreshList){
      this.getUSCISPendingRecords();
      this.getUSCISClosedRecords();
    }
  }

  getUSCISPendingCases(format: string): void{
    // tslint:disable-next-line: max-line-length
    this.hrDashboardService.getUSCISPendingCasesExportToExcel(this.searchKey, this.searchPending, this.yearKey, this.yearPending, format).subscribe(
      (data) => {
        const file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);
        saveAs(fileURL, 'USCIS Pending Cases' + '.' + format);
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  getUSCISClosedCases(format: string): void{
    // tslint:disable-next-line: max-line-length
    this.hrDashboardService.getUSCISClosedCasesExportToExcel(this.searchKey, this.searchClosed, this.yearKey, this.yearClosed, format).subscribe(
      (data) => {
        const file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileURL = URL.createObjectURL(file);
        saveAs(fileURL, 'USCIS Closed Cases' + '.' + format);
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  downloadPendingCases(format: string): void {
    this.getUSCISPendingCases(format);
  }

  downloadClosedCases(format: string): void {
    this.getUSCISClosedCases(format);
  }

  goToDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
  }
}
