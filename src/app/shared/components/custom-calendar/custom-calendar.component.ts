import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import {
  PayrollCalendarInfo,
  PayrollCalendarResult,
  PayrollMapByPayDate,
} from '../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { Months } from '../../../aura/hr/enum/months.enum';

@Component({
  selector: 'app-custom-calendar',
  templateUrl: './custom-calendar.component.html',
  styleUrls: ['./custom-calendar.component.scss'],
})
export class CustomCalendarComponent implements OnInit, OnChanges {
  isLoading = false;
  // GET PAYROLLCALENDAR RESULT
  @Input() payrollCalendarResult!: PayrollCalendarResult[];
  @Output() monthChanged = new EventEmitter();

  selectedDate!: Date | null;
  currentMonthPayRollCalendar: PayrollCalendarResult[] = [];
  payRollDates: number[] = [];
  currentDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };
  payrollCalendarInfo: PayrollCalendarInfo[] = [];
  payrollMapByPayDate: PayrollMapByPayDate = {};
  startAt!: Date;

  constructor(private datepipe: DatePipe) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.payrollCalendarResult &&
      changes?.payrollCalendarResult?.currentValue
    ) {
      this.setPayRollCalendarByYear(
        this.currentDate.year,
        changes.payrollCalendarResult?.currentValue
      );
    }
  }

  ngOnInit(): void {}

  setPayRollCalendarByYear(
    year: number,
    payrollCalendar: PayrollCalendarResult[]
  ): void {
    for (let i = 0; i < 12; i++) {
      const payRollInfo: PayrollCalendarInfo = {
        monthStartDate: new Date(year, i, 1),
      };
      this.payrollCalendarInfo.push(payRollInfo);
    }

    this.payrollMapByPayDate =
      this.generatePayrollMapByPayDate(payrollCalendar);
  }

  generatePayrollMapByPayDate(
    payrollresult: PayrollCalendarResult[]
  ): PayrollMapByPayDate {
    return payrollresult.reduce((acc, cur) => {
      acc[cur.payDate.substr(0, 10)] = cur;
      return acc;
    }, {} as PayrollMapByPayDate);
  }

  hanldeDateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    // Only highlight dates inside the month view.
    if (view === 'month') {
      if (new Date(cellDate).getMonth() === new Date().getMonth()) {
      }
      const curDateString = String(
        this.datepipe.transform(new Date(new Date(cellDate)), 'yyyy-MM-dd')
      );

      if (this.payrollMapByPayDate[curDateString]) {
        const targetAriaLabel = new Date(cellDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        setTimeout(() => {
          const element = document.querySelector(
            `.year-clndr__grid mat-calendar [aria-label="${targetAriaLabel}"]`
          );

          if (new Date(cellDate).getMonth() === new Date().getMonth()) {
            element?.classList.add('current-month');
          }

          const lastDate = `From: ${String(
            this.datepipe.transform(
              new Date(this.payrollMapByPayDate[curDateString]?.startDate),
              'dd MMM yyyy'
            )
          )} \n - To: ${String(
            this.datepipe.transform(
              new Date(this.payrollMapByPayDate[curDateString]?.endDate),
              'dd MMM yyyy'
            )
          )} \nSubmission Date: \n ${String(
            this.datepipe.transform(
              new Date(
                this.payrollMapByPayDate[curDateString]?.lastDayToSubmit
              ),
              'dd MMM yyyy'
            )
          )}`;

          element?.setAttribute('aria-label', lastDate);
        }, 100);
        return 'pay-date';
      }
    }

    return '';
  };

  // tslint:disable-next-line: no-any
  public get Months(): any {
    return Months;
  }

  switchToMonth(monthName: string, i: number): void {
    console.log(monthName.substring(0, 3).toUpperCase());
    console.log(new Date(this.currentDate.year, i, 1));
    this.monthChanged.emit(new Date(this.currentDate.year, i, 1));
  }
}
