import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { PageConfig, EmployeePTOSummaryResult, EmployeeVacationHistoryResult,
EmployeeVacations, VacationTable, EmployeeTimesheetDetails } from '../../../../../search/interface/employee-profile/employee-profile-vacation.interface';
import { EmployeeProfileApiService } from '../../../../service/employee/employee-profile-api.service';
import { ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employee-vacation-tab',
  templateUrl: './employee-vacation-tab.component.html',
  styleUrls: ['./employee-vacation-tab.component.scss']
})
export class EmployeeVacationTabComponent implements OnInit, OnChanges {
  @Input() employeeId = '';
  @Input() personId = '';
  empPTOSummary!: EmployeePTOSummaryResult;
  vacationHistoryResult!: EmployeeVacationHistoryResult;
  employeeTimesheetDetails!: EmployeeTimesheetDetails[];
  totalRows = 0;
  total = 0;
  pageNum = 1;
  pageSize = 10;
  errorCode!: number;
  isLoading = false;
  isLoadSpinner = false;
  empId = '';
  startDateRange!: string;
  endDateRange!: string;
  dateRange = '';
  strdate = '';
  enddate = '';
  btnClose = false;
  daylist: string[] = [];
  dateList: string[] = [];
  firstday!: Date;
  lastday!: Date;
  days: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  public doughnutChartLabels: Label[] = ['Available', 'Consumed', 'Pending for Approvals'];
  public doughnutChartData: SingleDataSet = [0, 0, 0];

  public chartColors = [
    {
      backgroundColor: ['#51BA31', '#d1d1d1', '#CC910C']
    }];
  public chartOptions = {
      cutoutPercentage: 80,
      innerTitle : 'Hrs Available',
      plugins: {
        datalabels: {
          display: false
          },
      },
    };
  public doughnutChartType: ChartType = 'doughnut';

  employeesVacationHistoryPanelConfig: VacationTable = {
    isLoading: true,
    displayedColumns: [
      'fromDate',
      'toDate',
      'hours',
      'leaveType',
      'status',
      'approvedBy',
      'appliedDate',
      'approvedDate',
      'comments',
      'actions'
    ],
    columns: [
      {
        headerDisplay: 'From Date',
        key: 'fromDate',
      },
      {
        headerDisplay: 'To',
        key: 'toDate',
      },
      {
        headerDisplay: 'Hours',
        key: 'hours',
      },
      {
        headerDisplay: 'Leave Type',
        key: 'leaveType',
      },
      {
        headerDisplay: 'Status',
        key: 'status',
      },
      {
        headerDisplay: 'Approved By',
        key: 'approvedBy',
      },
      {
        headerDisplay: 'Applied On',
        key: 'appliedDate',
      },
      {
        headerDisplay: 'Approved On',
        key: 'approvedDate',
      },
      {
        headerDisplay: 'Comments',
        key: 'comments',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

constructor(private employeeProfileApiService: EmployeeProfileApiService,
            public datepipe: DatePipe) { }

ngOnInit(): void {
}

ngOnChanges(change: SimpleChanges): void {
    if (change.personId && change.personId.currentValue) {
      this.empId = change.employeeId?.currentValue;
      const curr = new Date();
      const day = curr.getDay();
      this.firstday = new Date(curr.getTime() - 60 * 60 * 24 * day * 1000);
      this.lastday = new Date(this.firstday.getTime() + 60 * 60 * 24 * 6 * 1000);
      this.getStartEndDateOfWeek(this.firstday, this.lastday);
      this.btnClose = false;
      this.setVacationTabByEmpId(
        change.employeeId?.currentValue
      );
    }
  }

  // tslint:disable-next-line: no-any
onChangeEvent(event: any): void{
  const curr = new Date(event.target.value);
  const day = curr.getDay();
  this.firstday = new Date(curr.getTime() - 60 * 60 * 24 * day * 1000);
  this.lastday = new Date(this.firstday.getTime() + 60 * 60 * 24 * 6 * 1000);
  this.getStartEndDateOfWeek(this.firstday, this.lastday);
  this.btnClose = true;
  this.employeeTimesheetDetails = [];
  this.isLoading = true;
  this.employeeProfileApiService.getTimesheetEmpId(this.empId, this.strdate, this.enddate).subscribe(
    (data) => {
      if (data?.result){
       this.employeeTimesheetDetails = data?.result?.result;
      }
      this.errorCode = data?.errorCode;
      this.isLoading = false;
    },
    (err) => {
      console.warn(err);
      this.isLoading = false;
    }
  );
}

displayCloseBtn(): void{
 const curr = new Date();
 const day = curr.getDay();
 this.firstday = new Date(curr.getTime() - 60 * 60 * 24 * day * 1000);
 this.lastday = new Date(this.firstday.getTime() + 60 * 60 * 24 * 6 * 1000);
 this.getStartEndDateOfWeek(this.firstday, this.lastday);
 this.btnClose = false;
 this.employeeTimesheetDetails = [];
 this.isLoading = true;
 this.employeeProfileApiService.getTimesheetEmpId(this.empId, this.strdate, this.enddate).subscribe(
  (data) => {
    if (data?.result){
    this.employeeTimesheetDetails = data?.result?.result;
  }
    this.errorCode = data?.errorCode;
    this.isLoading = false;
  },
  (err) => {
    console.warn(err);
    this.isLoading = false;
  }
);
}

setVacationTabByEmpId(empId: string): void {
  this.isLoadSpinner = true;
  this.employeeProfileApiService.getPTOSummaryEmpId(empId).subscribe(
      (data) => {
        this.empPTOSummary = data?.result;
        this.doughnutChartData = [this.empPTOSummary?.availableHours,
          this.empPTOSummary?.consumedHours,
          this.empPTOSummary?.approvalPendingHours];
        this.isLoadSpinner = false;
      },
      (err) => {
        this.isLoadSpinner = false;
        console.warn(err);
      }
    );

  this.employeeProfileApiService.getVacationHistoryEmpId(empId, this.pageNum, this.pageSize).subscribe(
      (data) => {
        this.vacationHistoryResult = data?.result;
        this.total = data?.result?.virtualCount;
        this.employeesVacationHistoryResultParser(data?.result?.results);
      },
      (err) => {
        console.warn(err);
      }
    );
  this.employeeTimesheetDetails = [];
  this.isLoading = true;
  this.employeeProfileApiService.getTimesheetEmpId(empId, this.strdate, this.enddate).subscribe(
      (data) => {
        if (data?.result){
        this.employeeTimesheetDetails = data?.result?.result;
      }
        this.errorCode = data?.errorCode;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        console.warn(err);
      }
    );
  }

employeesVacationHistoryResultParser(empVacations: EmployeeVacations[]): void {
      this.employeesVacationHistoryPanelConfig.isLoading = false;
      this.employeesVacationHistoryPanelConfig.totalRows = this.total;
      this.employeesVacationHistoryPanelConfig.tableData = empVacations?.map(
        (item, index) => {
          return {
            ...item,
          };
        }
      );
  }

getNextRecords(event: PageConfig): void {
    this.employeeProfileApiService.getVacationHistoryEmpId(this.empId, event.pageIndex, event.pageSize)
        .subscribe(
          (data) => {
            this.vacationHistoryResult = data?.result;
            this.total = data?.result?.virtualCount;
            this.employeesVacationHistoryResultParser(data?.result?.results);
          },
          (err) => {
            console.warn(err);
          }
        );
  }

  getStartEndDateOfWeek(firstday: Date, lastday: Date): void{
    const fdt = new Date(firstday);
    this.strdate = JSON.stringify(fdt);
    this.strdate = this.strdate.slice(1, 11);
    const ldt = new Date(lastday);
    this.enddate = JSON.stringify(ldt);
    this.enddate = this.enddate.slice(1, 11);
    // tslint:disable-next-line: no-non-null-assertion
    this.startDateRange = this.datepipe?.transform(this.strdate, 'dd MMM yyyy')!;
    // tslint:disable-next-line: no-non-null-assertion
    this.endDateRange = this.datepipe?.transform(this.enddate, 'dd MMM yyyy')!;
    this.dateRange = this.startDateRange + ' - ' + this.endDateRange;
    if (this.dateRange){
      this.btnClose = true;
    }
    this.daylist = this.getDatesList(new Date(this.strdate), new Date(this.enddate));
  }

  movingBackward(): void{
    this.firstday = new Date(this.firstday.getTime() - 60 * 60 * 24 * 7 * 1000);
    this.lastday = new Date(this.lastday.getTime() - 60 * 60 * 24 * 7 * 1000);
    this.getStartEndDateOfWeek(this.firstday, this.lastday);
    this.employeeTimesheetDetails = [];
    this.isLoading = true;
    this.employeeProfileApiService.getTimesheetEmpId(this.empId, this.strdate, this.enddate).subscribe(
      (data) => {
        if (data?.result){
        this.employeeTimesheetDetails = data?.result?.result;
      }
        this.errorCode = data?.errorCode;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        console.warn(err);
      }
    );
  }

  movingForward(): void{
    this.firstday = new Date(this.firstday.getTime() + 60 * 60 * 24 * 7 * 1000);
    this.lastday = new Date(this.lastday.getTime() + 60 * 60 * 24 * 7 * 1000);
    this.getStartEndDateOfWeek(this.firstday, this.lastday);
    this.employeeTimesheetDetails = [];
    this.isLoading = true;
    this.employeeProfileApiService.getTimesheetEmpId(this.empId, this.strdate, this.enddate).subscribe(
      (data) => {
        if (data?.result){
        this.employeeTimesheetDetails = data?.result?.result;
      }
        this.errorCode = data?.errorCode;
        this.isLoading = false;
      },
      (err) => {
        this.isLoading = false;
        console.warn(err);
      }
    );
  }

  getDatesList(start: Date, end: Date): string[] {
    this.dateList = [];
    for ( const dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)){
        // tslint:disable-next-line: no-non-null-assertion
        this.dateList.push(this.datepipe.transform(new Date(dt), 'dd MMM')?.toUpperCase()!);
    }
    return this.dateList;
}

}
