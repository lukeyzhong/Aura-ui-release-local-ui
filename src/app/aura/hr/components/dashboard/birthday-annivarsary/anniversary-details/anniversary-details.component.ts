import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AnniversaryBirthdayData,
  AnniversaryBirthdayDetails,
} from '../../../../../hr/interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../../../hr/service/dashboard/hr-dashboard.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { Months } from '../../../../enum/months.enum';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { CsvUtilityService } from '../../../../../../shared/service/utility/csv-utility.service';
import { DownloadToExcelOrCSV } from 'src/app/shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';

@Component({
  selector: 'app-anniversary-details',
  templateUrl: './anniversary-details.component.html',
  styleUrls: ['./anniversary-details.component.scss'],
  providers: [DatePipe],
})
export class AnniversaryDetailsComponent implements OnInit {
  anniversaryData: AnniversaryBirthdayData[] = [];
  anniversaryMonthsData: AnniversaryBirthdayData[] = [];
  anniversaryMonthsWise: AnniversaryBirthdayData[] = [];
  anniversaryDataForExcel: AnniversaryBirthdayData[] = [];
  // tslint:disable-next-line: no-any
  anniversaryMonthsWiseFiltered: any[] = [];
  nextWeekAnniversaryDates: AnniversaryBirthdayDetails[] = [];
  todayAnniversary: AnniversaryBirthdayDetails[] = [];
  currentDate!: Date;
  isLoadSpinner = false;
  fetchAll = true;
  index = 0;
  idx = 0;
  sno = 0;
  isMovingForward = true;
  isMovingBackward = true;
  isTodayAnvBackward = true;
  isTodayAnvForward = true;
  selectedMonths: string[] = [];
  enableSearch = true;
  downloadType = 'datagrid';
  dataGridType = 'Anniversaries';
  searchKey = 'searchterm';
  search = '';
  monthsKey = 'months';
  monthsValue = '';
  months: number[] = [];
  nextMonths: number[] = [];

  displayedColumns: string[] = [
    's.no',
    'employeeCode',
    'firstName',
    'lastName',
    'alias',
    'email',
    'phone',
    'totalHoursWorked',
    'startDate',
    'yearsCompleted',
  ];
  // tslint:disable-next-line: no-any
  excelTableData: any;
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  // tslint:disable-next-line: no-any
  tableData: any;
  monthControl = new FormControl([]);
  monthList: string[] = [];
  defaultMonth: string[] = [];

  constructor(
    private hrDashboardService: HrDashboardService,
    private csvUtilityService: CsvUtilityService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    private datePipe: DatePipe,
    private documentsService: DocumentsService
  ) {}

  ngOnInit(): void {
    this.nextMonths = [];
    this.currentDate = new Date();
    for (let k = 0; k < 12; k++) {
      this.monthList.push(Months[k]);
    }
    this.months.push(this.currentDate.getMonth() + 1);
    if (this.currentDate.getMonth() + 1 < 12) {
      this.nextMonths.push(this.currentDate.getMonth() + 1);
      this.nextMonths.push(this.currentDate.getMonth() + 2);
    } else {
      this.nextMonths.push(this.currentDate.getMonth() + 1);
      this.nextMonths.push(this.currentDate.getMonth() - 10);
    }
    this.defaultMonth.push(Months[this.currentDate.getMonth()]);
    this.monthControl.setValue(this.defaultMonth as string[]);
    if (this.index === 0) {
      this.isMovingBackward = false;
    }
    if (this.idx === 0) {
      this.isTodayAnvBackward = false;
    }
    this.setAnniversariesTopSection();
    this.setAnniversariesTableSection();
  }

  movingBackward(): void {
    this.isMovingForward = true;
    this.index = this.index - 1;
    if (this.index === 0) {
      this.isMovingBackward = false;
    }
  }

  movingForkward(): void {
    this.isMovingBackward = true;
    this.index = this.index + 1;
    if (this.index === this.nextWeekAnniversaryDates.length - 5) {
      this.isMovingForward = false;
    }
  }

  todayAnniversaryBackward(): void {
    this.isTodayAnvForward = true;
    this.idx = this.idx - 1;
    if (this.idx === 0) {
      this.isTodayAnvBackward = false;
    }
  }

  todayAnniversaryForward(): void {
    this.isTodayAnvBackward = true;
    this.idx = this.idx + 1;
    if (this.idx === this.todayAnniversary.length - 5) {
      this.isTodayAnvForward = false;
    }
  }

  setAnniversariesTopSection(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService
      .getAnniversaryData(this.fetchAll, '', this.nextMonths)
      .subscribe(
        (data) => {
          this.anniversaryData = data?.result;
          const now = moment(
            // tslint:disable-next-line: no-non-null-assertion
            this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')!
          );
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.anniversaryData.length; i++) {
            const anniversaryDay = moment(
              this.anniversaryData[i]?.startDate?.split('T')[0]
            ).year(now.year());
            const daysRemaining = anniversaryDay.diff(now, 'days');
            if (daysRemaining >= 1 && daysRemaining <= 7) {
              this.nextWeekAnniversaryDates.push({
                name: this.anniversaryData[i]?.firstName,
                lname: this.anniversaryData[i]?.lastName,
                date:
                  daysRemaining === 1
                    ? 'Tomorrow'
                    : anniversaryDay.date().toString(),
                month:
                  daysRemaining === 1 ? ' ' : Months[anniversaryDay.month()],
                years: this.anniversaryData[i]?.yearsCompleted,
                image: this.anniversaryData[i]?.displayPictureBase64,
              });
            }
            if (daysRemaining === 0) {
              this.todayAnniversary.push({
                name: this.anniversaryData[i]?.firstName,
                lname: this.anniversaryData[i]?.lastName,
                date:
                  daysRemaining === 0
                    ? 'Today'
                    : anniversaryDay.date().toString(),
                month:
                  daysRemaining === 0 ? ' ' : Months[anniversaryDay.month()],
                years: this.anniversaryData[i]?.yearsCompleted,
                image: this.anniversaryData[i]?.displayPictureBase64,
              });
            }
          }
          if (this.nextWeekAnniversaryDates.length <= 5) {
            this.isMovingForward = false;
          }
          if (this.todayAnniversary.length <= 5) {
            this.isTodayAnvForward = false;
          }
          this.isLoadSpinner = false;
        },
        (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  setAnniversariesTableSection(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService
      .getAnniversaryData(this.fetchAll, this.search, this.months)
      .subscribe(
        (data) => {
          if (data?.errorCode === 0) {
            this.anniversaryMonthsData = data?.result;
            const now = moment(
              // tslint:disable-next-line: no-non-null-assertion
              this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')!
            );
            this.anniversaryMonthsWise = [];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < this.anniversaryMonthsData.length; i++) {
              const anniversaryDay = moment(
                this.anniversaryMonthsData[i]?.startDate?.split('T')[0]
              ).year(now.year());
              this.anniversaryMonthsWise.push({
                month: Months[anniversaryDay.month()],
                displayPictureBase64:
                  this.anniversaryMonthsData[i]?.displayPictureBase64,
                employeeCode: this.anniversaryMonthsData[i]?.employeeCode,
                firstName: this.anniversaryMonthsData[i]?.firstName,
                lastName: this.anniversaryMonthsData[i]?.lastName,
                alias: this.anniversaryMonthsData[i]?.alias,
                email: this.anniversaryMonthsData[i]?.email,
                phone: this.anniversaryMonthsData[i]?.phone,
                totalHoursWorked:
                  this.anniversaryMonthsData[i]?.totalHoursWorked,
                startDate: this.anniversaryMonthsData[i]?.startDate,
                yearsCompleted: this.anniversaryMonthsData[i]?.yearsCompleted,
              });
            }
            this.anniversaryMonthsWiseFiltered = [];
            for (const month of this.months) {
              this.sno = 0;
              this.anniversaryMonthsWiseFiltered.push({
                month: Months[month - 1],
                isGroupBy: true,
              });
              // tslint:disable-next-line: prefer-for-of
              for (let j = 0; j < this.anniversaryMonthsWise.length; j++) {
                if (this.anniversaryMonthsWise[j].month === Months[month - 1]) {
                  this.sno = this.sno + 1;
                  this.anniversaryMonthsWiseFiltered.push({
                    sno: this.sno,
                    displayPictureBase64:
                      this.anniversaryMonthsWise[j]?.displayPictureBase64,
                    employeeCode: this.anniversaryMonthsWise[j]?.employeeCode,
                    firstName: this.anniversaryMonthsWise[j]?.firstName,
                    lastName: this.anniversaryMonthsWise[j]?.lastName,
                    alias: this.anniversaryMonthsWise[j]?.alias,
                    email: this.anniversaryMonthsWise[j]?.email,
                    phone: this.anniversaryMonthsWise[j]?.phone,
                    totalHoursWorked:
                      this.anniversaryMonthsWise[j]?.totalHoursWorked,
                    // tslint:disable-next-line: no-non-null-assertion
                    startDate: this.datePipe.transform(
                      this.anniversaryMonthsWise[j]?.startDate,
                      'MM-dd-yyyy'
                    )!,
                    yearsCompleted:
                      this.anniversaryMonthsWise[j]?.yearsCompleted,
                  });
                }
              }
            }
            this.tableData = this.anniversaryMonthsWiseFiltered;
            this.dataSource = new MatTableDataSource(this.tableData);
            if (this.anniversaryMonthsWiseFiltered.length === 0) {
              this.enableSearch = false;
            } else {
              this.enableSearch = true;
            }
            this.isLoadSpinner = false;
          } else {
            this.isLoadSpinner = false;
          }
        },
        (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  exportToCSV(): void {
    this.anniversaryDataForExcel = [];
    const columnsDisplayed = [
      'Month',
      'Emp Code',
      'First Name',
      'Last Name',
      'Alias Name',
      'Email',
      'Cell Phone',
      'Hours Completed',
      'Date Of Joining',
      'Years Completed',
    ];

    for (const monthName of this.months) {
      for (const rec of this.anniversaryMonthsWise) {
        if (rec?.month === Months[monthName - 1].toString()) {
          this.anniversaryDataForExcel.push({
            month: rec?.month,
            displayPictureBase64: rec?.displayPictureBase64,
            employeeCode: rec?.employeeCode,
            firstName: rec?.firstName,
            lastName: rec?.lastName,
            alias: rec?.alias,
            email: rec?.email,
            phone: rec?.phone,
            totalHoursWorked: rec?.totalHoursWorked,
            startDate: rec?.startDate,
            yearsCompleted: rec?.yearsCompleted,
          });
        }
      }
    }
    this.excelTableData = this.anniversaryDataForExcel.map((item, index) => {
      return {
        Month: item.month,
        'Emp Code': item.employeeCode,
        'First Name': item.firstName,
        'Last Name': item.lastName,
        'Alias Name': item.alias,
        Email: item.email,
        'Cell Phone': item.phone,
        'Hours Completed': item.totalHoursWorked,
        'Date Of Joining': item.startDate,
        'Years Completed': item.yearsCompleted,
      };
    });

    this.csvUtilityService.exportToCSV(
      this.excelTableData,
      columnsDisplayed,
      'Anniversary List'
    );
  }

  performSearch(search: string): void {
    this.search = search;
    if (search.length >= 2 || search.length === 0) {
      this.setAnniversariesTableSection();
    }
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  // tslint:disable-next-line: no-any
  isGroup(index: number, item: any): boolean {
    return item.isGroupBy;
  }

  onMonthSelection(): void {
    this.selectedMonths = this.monthControl.value.slice() as string[];
    this.months = [];
    // tslint:disable-next-line: prefer-for-of
    for (let m = 0; m < this.selectedMonths.length; m++) {
      this.months.push(
        Object.values(Months).indexOf(this.selectedMonths[m]) + 1
      );
    }
    this.setAnniversariesTableSection();
  }

  onMonthRemoved(month: string): void {
    this.selectedMonths = this.monthControl.value.slice() as string[];
    this.removeFirst(this.selectedMonths, month);
    this.monthControl.setValue(this.selectedMonths);
    this.months = [];
    // tslint:disable-next-line: prefer-for-of
    for (let m = 0; m < this.selectedMonths.length; m++) {
      this.months.push(
        Object.values(Months).indexOf(this.selectedMonths[m]) + 1
      );
    }
    this.setAnniversariesTableSection();
  }

  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  download(format: string): void {
    this.downloadAnniversaryExcelOrCSV(format);
  }

  downloadAnniversaryExcelOrCSV(format: string): void {
    this.hrDashboardService
      .downloadBirthdayAnniversaryToExcelOrCSV(
        this.dataGridType,
        format,
        this.searchKey,
        this.search,
        this.monthsKey,
        this.months?.toString()
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, this.dataGridType + '.' + format);
        },
        (err) => {
          console.warn(err);
        }
      );
  }
}
