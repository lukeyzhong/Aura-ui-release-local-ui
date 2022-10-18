import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  PayrollCalendarResult,
  PayrollMapByPayDate,
} from '../../../interface/dashboard/payroll-calendar.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { DatePipe } from '@angular/common';
import { PayrollCalendarDialogComponent } from './payroll-calendar-dialog/payroll-calendar-dialog.component';
import { Months } from '../../../enum/months.enum';
import { Days } from '../../../enum/days.enum';
import { PayrollData } from '../../../interface/dashboard/hr-dashboard.interface';

@Component({
  selector: 'app-payroll-calendar',
  templateUrl: './payroll-calendar.component.html',
  styleUrls: ['./payroll-calendar.component.scss'],
})
export class PayrollCalendarComponent implements OnInit {
  isLoading = false;
  // GET PAYROLLCALENDAR RESULT
  payrollCalendarResult!: PayrollCalendarResult[];
  payrollData: PayrollData[] = [];
  selectedDate!: Date | null;
  currentMonthPayRollCalendar: PayrollCalendarResult[] = [];
  payRollDates: number[] = [];
  currentDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    today: new Date().getDay(),
  };
  todaysDate = '';
  payrollMapByPayDate: PayrollMapByPayDate = {};
  index = 0;
  isNext = true;
  isPrevious = true;

  payMonth = '';
  payDate!: number;
  payDay = '';
  subDate = '';

  constructor(
    private datePipe: DatePipe,
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    (this.todaysDate = String(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd')
    )),
      this.setPayRollCalendarByYear(this.currentDate.year);
  }

  setPayRollCalendarByYear(year: number): void {
    this.isLoading = true;

    this.hrDashboardService.getPayRollCalendarByYear(year).subscribe(
      (data) => {
        this.isLoading = false;
        this.payrollCalendarResult = data?.result;
        // tslint:disable-next-line: prefer-for-of
        for (let k = 0; k < this.payrollCalendarResult.length; k++) {
          const subDate =
            this.payrollCalendarResult[k]?.lastDayToSubmit?.split('T')[0];

          const date = new Date(this.payrollCalendarResult[k]?.payDate);
          const payMonth = Months[date.getMonth()];
          const payDate = date.getDate();
          const payDay = Days[date.getDay()];
          this.payrollData = Object.assign([{}], this.payrollData);
          this.payrollData[k] = {
            id: k,
            payMonth,
            payDate,
            payDay,
            subDate,
          };
        }
        // tslint:disable-next-line: prefer-for-of
        for (let m = 0; m < this.payrollData?.length; m++) {
          if (this.payrollData[m].subDate >= this.todaysDate) {
            this.index = Number(this.payrollData[m].id);
            break;
          }
        }

        if (this.index === this.payrollData?.length - 1) {
          this.isNext = false;
        }
        if (this.index === 0) {
          this.isPrevious = false;
        }

        this.setPayDate(this.index);
      },
      (err) => {
        this.isLoading = false;
        console.warn(err);
      }
    );
  }

  setPayDate(index: number): void {
    this.payMonth = this.payrollData[index]?.payMonth;
    this.payDate = this.payrollData[index]?.payDate;
    this.payDay = this.payrollData[index]?.payDay;
    this.subDate = this.payrollData[index]?.subDate;
  }

  previous(): void {
    this.isNext = true;
    this.index = this.index - 1;

    this.setPayDate(this.index);

    if (this.index === 0) {
      this.isPrevious = false;
    }
  }

  next(): void {
    this.isPrevious = true;
    this.index = this.index + 1;

    this.setPayDate(this.index);

    if (this.index === this.payrollData?.length - 1) {
      this.isNext = false;
    }
  }

  openPayRollDialog(): void {
    const dialogConfig = new MatDialogConfig();

    const obj = {
      payRollData: this.payrollCalendarResult,
      year: this.currentDate.year,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.panelClass = 'payroll-clndr';
    dialogConfig.width = '70%';

    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(PayrollCalendarDialogComponent, {
      panelClass: 'dialog-container-custom',
    });
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setPayRollCalendarByYear(this.currentDate.year);
      }
    });
  }
}
