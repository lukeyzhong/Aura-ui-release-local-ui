import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PageConfig } from '../../../../../aura/search/interface/table.interface';
import {
  ADPResults,
  DetailsConfig,
} from '../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
@Component({
  selector: 'app-dashboard-mytask-adp',
  templateUrl: './dashboard-mytask-adp.component.html',
  styleUrls: ['./dashboard-mytask-adp.component.scss'],
})
export class DashboardMytaskAdpComponent implements OnInit {
  adpTableDetails!: ADPResults[];
  total = 0;
  pageNum = 1;
  pageSize = 10;
  searchKey = 'searchterm';
  searchString = '';
  yearKey = 'year';
  searchYear = '';
  enableSearch = true;
  adpYear = new FormControl([]);
  currDate!: Date;
  year: number[] = [];
  currYear = '';

  adpTablePanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'employeeCode',
      'fullName',
      'hireDate',
      'failedDate',
      'actions',
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
        headerDisplay: 'Hire Date',
        key: 'hireDate',
      },
      {
        headerDisplay: 'ADP Integration Failed Date',
        key: 'failedDate',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(private hrDashboardService: HrDashboardService, private router: Router) { }

  ngOnInit(): void {
    this.currDate = new Date();
    this.currYear = this.currDate.getFullYear().toString();
    this.searchYear = this.currYear;
    for (let i = 0; i <= 4; i++) {
      this.year.push(this.currDate?.getUTCFullYear() - i);
    }
    this.adpYear.setValue(this.currDate?.getUTCFullYear());
    this.getADPPendingRecords();
  }

  adpYearSelection(): void {
    this.searchYear = this.adpYear.value;
    this.adpTablePanelConfig.isLoading = true;
    this.hrDashboardService
      .getADPFailedRecords(
        this.searchString,
        this.searchYear,
        this.pageNum,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.adpTableDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          this.adpResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  performSearch(search: string): void {
    let searchValue = search;
    if (search.length >= 2 || search.length === 0) {
      if (searchValue.length > 0) {
        this.searchString = searchValue;
      } else {
        this.searchString = '';
        searchValue = '';
      }
      this.adpTablePanelConfig.isLoading = true;
      this.hrDashboardService
        .getADPFailedRecords(
          this.searchString,
          this.searchYear,
          this.pageNum,
          this.pageSize
        )
        .subscribe(
          (data) => {
            this.adpTableDetails = data?.result?.results;
            this.total = data?.result?.virtualCount;
            this.adpResultParser(data?.result?.results);
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  getADPPendingRecords(): void {
    this.hrDashboardService
      .getADPFailedRecords(
        this.searchString,
        this.searchYear,
        this.pageNum,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.adpTableDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          if (this.total === 0) {
            this.enableSearch = false;
          }
          this.adpResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getNextRecords(event: PageConfig): void {
    this.hrDashboardService
      .getADPFailedRecords(
        this.searchString,
        this.searchYear,
        event.pageIndex,
        event.pageSize
      )
      .subscribe(
        (data) => {
          this.adpTableDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          this.adpResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  adpResultParser(adpResults: ADPResults[]): void {
    this.adpTablePanelConfig.isLoading = false;
    this.adpTablePanelConfig.totalRows = this.total;
    this.adpTablePanelConfig.tableData = adpResults?.map((item, index) => {
      return {
        ...item,
      };
    });
  }

  refreshADPPendingList(refreshList: boolean): void {
    if (refreshList) {
      this.getADPPendingRecords();
    }
  }

  getADPPendingCases(format: string): void {
    this.hrDashboardService
      .getADPPendingCasesExportToExcel(
        this.searchKey,
        this.searchString,
        this.yearKey,
        this.searchYear,
        format
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, 'ADP Pending Cases' + '.' + format);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  download(format: string): void {
    this.getADPPendingCases(format);
  }

  goToDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
  }

}
