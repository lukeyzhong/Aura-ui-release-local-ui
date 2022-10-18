import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TimesheetStatusCode } from '../../../enum/timesheet.enum';
import {
  EmployeeTimesheetResults,
  PageConfig,
  TimesheetTable,
} from '../../../interface/employee-dashboard.interface';
import { EmployeeDashboardService } from '../../../service/dashboard/employee-dashboard.service';

@Component({
  selector: 'app-time-sheets',
  templateUrl: './time-sheets.component.html',
  styleUrls: ['./time-sheets.component.scss'],
})
export class TimeSheetsComponent implements OnInit, OnChanges {
  @Input() employeeId = '';
  empTimesheetDetails!: EmployeeTimesheetResults[];
  total = 0;
  pageNum = 1;
  pageSize = 10;
  empId = '';
  timeSheetCode = 3;
  tabIndex = 0;
  submittedStatus!: number;
  rejectedStatus!: number;
  approvedStatus!: number;
  inprogressStatus!: number;

  // Submitted Timesheet
  submittedTimesheetPanelConfig: TimesheetTable = {
    isLoading: true,
    displayedColumns: [
      'startDate',
      'endDate',
      'timeSheetStatus',
      'submittedOn',
    ],
    columns: [
      {
        headerDisplay: 'Start Date',
        key: 'startDate',
      },
      {
        headerDisplay: 'End Date',
        key: 'endDate',
      },
      {
        headerDisplay: 'Status',
        key: 'timeSheetStatus',
      },
      {
        headerDisplay: 'Submitted On',
        key: 'submittedOn',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Rejected Timesheet
  rejectedTimesheetPanelConfig: TimesheetTable = {
    isLoading: true,
    displayedColumns: ['startDate', 'endDate', 'timeSheetStatus', 'rejectedOn'],
    columns: [
      {
        headerDisplay: 'Start Date',
        key: 'startDate',
      },
      {
        headerDisplay: 'End Date',
        key: 'endDate',
      },
      {
        headerDisplay: 'Status',
        key: 'timeSheetStatus',
      },
      {
        headerDisplay: 'Rejected On',
        key: 'rejectedOn',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Approved Timesheet
  approvedTimesheetPanelConfig: TimesheetTable = {
    isLoading: true,
    displayedColumns: ['startDate', 'endDate', 'timeSheetStatus', 'approvedOn'],
    columns: [
      {
        headerDisplay: 'Start Date',
        key: 'startDate',
      },
      {
        headerDisplay: 'End Date',
        key: 'endDate',
      },
      {
        headerDisplay: 'Status',
        key: 'timeSheetStatus',
      },
      {
        headerDisplay: 'Approved On',
        key: 'approvedOn',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Inprogress Timesheet
  inprogressTimesheetPanelConfig: TimesheetTable = {
    isLoading: true,
    displayedColumns: ['startDate', 'endDate', 'timeSheetStatus'],
    columns: [
      {
        headerDisplay: 'Start Date',
        key: 'startDate',
      },
      {
        headerDisplay: 'End Date',
        key: 'endDate',
      },
      {
        headerDisplay: 'Status',
        key: 'timeSheetStatus',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(private employeeDashboardService: EmployeeDashboardService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.employeeId && changes?.employeeId?.currentValue) {
      this.empId = changes.employeeId?.currentValue;
      this.getTimesheetByEmployeeIdAndStatus(
        this.empId,
        TimesheetStatusCode.submittedStatus
      );
      // this.getTimesheetByEmployeeIdAndStatus(
      //     this.empId,
      //     TimesheetStatusCode.rejectedStatus
      //   );
      // this.getTimesheetByEmployeeIdAndStatus(
      //     this.empId,
      //     TimesheetStatusCode.approvedStatus
      //   );
      // this.getTimesheetByEmployeeIdAndStatus(
      //     this.empId,
      //     TimesheetStatusCode.inprogressStatus
      //   );
    }
  }

  getTimesheetByEmployeeIdAndStatus(
    eId: string,
    timesheetCodeValue: number
  ): void {
    this.employeeDashboardService
      .getEmployeeTimesheetByEmployeeIdAndStatus(
        eId,
        timesheetCodeValue,
        this.pageNum,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.empTimesheetDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          if (this.empId === '00000000-0000-0000-0000-000000000000') {
            this.empTimesheetDetails = [];
            this.total = 0;
          }
          if (timesheetCodeValue === TimesheetStatusCode.submittedStatus) {
            this.submittedTimesheetResultParser(this.empTimesheetDetails);
          } else if (
            timesheetCodeValue === TimesheetStatusCode.rejectedStatus
          ) {
            this.rejectedTimesheetResultParser(this.empTimesheetDetails);
          } else if (
            timesheetCodeValue === TimesheetStatusCode.approvedStatus
          ) {
            this.approvedTimesheetResultParser(this.empTimesheetDetails);
          } else if (
            timesheetCodeValue === TimesheetStatusCode.inprogressStatus
          ) {
            this.inprogressTimesheetResultParser(this.empTimesheetDetails);
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  submittedTimesheetResultParser(
    empTimesheetResult: EmployeeTimesheetResults[]
  ): void {
    this.submittedTimesheetPanelConfig.isLoading = false;
    this.submittedTimesheetPanelConfig.totalRows = this.total;
    this.submittedTimesheetPanelConfig.tableData = empTimesheetResult?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  rejectedTimesheetResultParser(
    empTimesheetResult: EmployeeTimesheetResults[]
  ): void {
    this.rejectedTimesheetPanelConfig.isLoading = false;
    this.rejectedTimesheetPanelConfig.totalRows = this.total;
    this.rejectedTimesheetPanelConfig.tableData = empTimesheetResult?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  approvedTimesheetResultParser(
    empTimesheetResult: EmployeeTimesheetResults[]
  ): void {
    this.approvedTimesheetPanelConfig.isLoading = false;
    this.approvedTimesheetPanelConfig.totalRows = this.total;
    this.approvedTimesheetPanelConfig.tableData = empTimesheetResult?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  inprogressTimesheetResultParser(
    empTimesheetResult: EmployeeTimesheetResults[]
  ): void {
    this.inprogressTimesheetPanelConfig.isLoading = false;
    this.inprogressTimesheetPanelConfig.totalRows = this.total;
    this.inprogressTimesheetPanelConfig.tableData = empTimesheetResult?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  getNextRecords(event: PageConfig): void {
    this.employeeDashboardService
      .getEmployeeTimesheetByEmployeeIdAndStatus(
        this.empId,
        this.timeSheetCode,
        event.pageIndex,
        event.pageSize
      )
      .subscribe(
        (data) => {
          this.empTimesheetDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          if (this.timeSheetCode === TimesheetStatusCode.submittedStatus) {
            this.submittedTimesheetResultParser(data?.result?.results);
          } else if (
            this.timeSheetCode === TimesheetStatusCode.rejectedStatus
          ) {
            this.rejectedTimesheetResultParser(data?.result?.results);
          } else if (
            this.timeSheetCode === TimesheetStatusCode.approvedStatus
          ) {
            this.approvedTimesheetResultParser(data?.result?.results);
          } else if (
            this.timeSheetCode === TimesheetStatusCode.inprogressStatus
          ) {
            this.inprogressTimesheetResultParser(data?.result?.results);
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabIndex = tabChangeEvent.index;
    switch (this.tabIndex) {
      case 0:
        this.timeSheetCode = TimesheetStatusCode.submittedStatus;
        this.getTimesheetByEmployeeIdAndStatus(
          this.empId,
          TimesheetStatusCode.submittedStatus
        );
        break;
      case 1:
        this.timeSheetCode = TimesheetStatusCode.rejectedStatus;
        this.getTimesheetByEmployeeIdAndStatus(
          this.empId,
          TimesheetStatusCode.rejectedStatus
        );
        break;
      case 2:
        this.timeSheetCode = TimesheetStatusCode.approvedStatus;
        this.getTimesheetByEmployeeIdAndStatus(
          this.empId,
          TimesheetStatusCode.approvedStatus
        );
        break;
      case 3:
        this.timeSheetCode = TimesheetStatusCode.inprogressStatus;
        this.getTimesheetByEmployeeIdAndStatus(
          this.empId,
          TimesheetStatusCode.inprogressStatus
        );
        break;
    }
  }
}
