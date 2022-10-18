import {
  Component,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  PayrollCalendarList,
  PayrollCalendarResult,
  PayRollConfig,
  PayrollMapByPayDate,
} from '../../../../interface/dashboard/payroll-calendar.interface';
import { CsvUtilityService } from '../../../../../../shared/service/utility/csv-utility.service';
import { PayrollData } from '../../../../interface/dashboard/hr-dashboard.interface';
import { DatePipe } from '@angular/common';
import { HrDashboardService } from '../../../../service/dashboard/hr-dashboard.service';
import {
  MatCalendar,
  MatCalendarCellClassFunction,
} from '@angular/material/datepicker';
import { Days } from '../../../../../hr/enum/days.enum';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { Months } from 'src/app/aura/hr/enum/months.enum';

@Component({
  selector: 'app-payroll-calendar-dialog',
  templateUrl: './payroll-calendar-dialog.component.html',
  styleUrls: ['./payroll-calendar-dialog.component.scss'],
})
export class PayrollCalendarDialogComponent implements OnInit {
  payrollCalendarResult!: PayrollCalendarResult[];
  payrollCalendarList: PayrollCalendarList[] = [];

  isLoading = false;
  // GET PAYROLLCALENDAR RESULT
  payrollData: PayrollData[] = [];
  selectedDate!: Date | null;

  currentDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    today: new Date().getDay(),
  };
  todaysDate = '';
  payrollMapByPayDate: PayrollMapByPayDate = {};
  @ViewChild('calendarView') calendarViewGroup!: MatTabGroup;
  yearView!: number;

  payMonth = '';
  payDate!: number;
  payDay = '';
  subDate = '';
  splCls = '';

  @ViewChild('month', { static: false })
  // tslint:disable-next-line: no-any
  month!: MatCalendar<any>;
  lastMonthOfTheYear = '';
  firstMonthOfTheYear = '';

  constructor(
    private datePipe: DatePipe,
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private renderer: Renderer2,
    private documentsService: DocumentsService
  ) {}

  ngOnInit(): void {
    this.todaysDate = String(this.datePipe.transform(new Date(), 'yyyy-MM-dd'));
    this.setPayRollCalendarByYear(this.currentDate.year);
  }

  setPayRollCalendarByYear(year: number): void {
    this.isLoading = true;
    this.hrDashboardService.getPayRollCalendarByYear(year).subscribe(
      (data) => {
        this.isLoading = false;
        this.payrollCalendarResult = data?.result;

        this.payrollMapByPayDate = this.generatePayrollMapByPayDate(
          data?.result
        );
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
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
      const curDateString = String(
        this.datePipe.transform(new Date(cellDate), 'yyyy-MM-dd')
      );

      const targetAriaLabel = new Date(cellDate)?.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const dayName = Days[new Date(cellDate).getDay()]
        .substring(0, 3)
        .toUpperCase();

      if (
        this.payrollMapByPayDate[curDateString]?.startDate !== undefined &&
        this.payrollMapByPayDate[curDateString]?.endDate !== undefined
      ) {
        setTimeout(() => {
          const element = document.querySelector(
            `.payrolldate mat-calendar [aria-label="${targetAriaLabel}"]`
          );

          const spldate: HTMLParagraphElement =
            this.renderer.createElement('div');

          const payDateText = String(
            this.datePipe.transform(
              new Date(this.payrollMapByPayDate[curDateString]?.payDate),
              'dd'
            )
          );

          const fromDateText = String(
            this.datePipe.transform(
              new Date(this.payrollMapByPayDate[curDateString]?.startDate),
              'MMM dd'
            )
          );

          const toDateText = String(
            this.datePipe.transform(
              new Date(this.payrollMapByPayDate[curDateString]?.endDate),
              'MMM dd'
            )
          );

          const submText = String(
            this.datePipe.transform(
              new Date(
                this.payrollMapByPayDate[curDateString]?.lastDayToSubmit
              ),
              'MMM dd yyyy'
            )
          );

          const payDateObj: PayrollCalendarList = {
            payDateText,
            fromDateText,
            toDateText,
            submText,
          };

          this.payrollCalendarList.push(payDateObj);

          spldate.classList.add('spl-date');
          spldate.classList.add('my-date');
          element?.appendChild(spldate);
        }, 100);

        return ' my-date';
      } else {
        setTimeout(() => {
          const element = document.querySelector(
            `.payrolldate mat-calendar [aria-label="${targetAriaLabel}"]`
          );
          const spldate: HTMLParagraphElement =
            this.renderer.createElement('div');

          // spldate.innerHTML = `<span> ${dayName} </span>`;

          spldate.classList.add('spl-date');
          element?.appendChild(spldate);
        }, 100);
        return 'all-date';
      }
    }
    return '';
  };

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  download(format: string): void {
    this.documentsService
      .payrollCalendarDownloadToExcelOrCSV(format, this.currentDate.year)
      .subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, `PayrollCalendar${this.currentDate.year}.${format}`);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.yearView = tabChangeEvent.index;
  }

  // Mat-calendar month navigation click event handling
  @HostListener('click', ['$event'])
  // tslint:disable-next-line: no-any
  onClick(event: any): void {
    if (
      event.target.ariaLabel &&
      event.target.ariaLabel.includes('Previous month')
    ) {
      this.payrollCalendarList = [];
      const activeDate = new Date(this.month.activeDate);

      this.firstMonthOfTheYear = Months[activeDate.getMonth()];
      const btnPrevHide = document.querySelector(
        '.mat-calendar-previous-button'
      );
      if (this.firstMonthOfTheYear === 'January') {
        btnPrevHide?.classList?.add('previousHide');
        btnPrevHide?.classList?.remove('nextHide');
      } else {
        this.firstMonthOfTheYear = '';
        btnPrevHide?.classList?.remove('previousHide');
      }
      const btnNxtHide = document.querySelector('.mat-calendar-next-button');
      btnNxtHide?.classList?.remove('nextHide');
    } else if (
      event.target.ariaLabel &&
      event.target.ariaLabel.includes('Next month')
    ) {
      this.payrollCalendarList = [];
      const activeDate = new Date(this.month.activeDate);

      this.lastMonthOfTheYear = Months[activeDate.getMonth()];
      const btnNxtHide = document.querySelector('.mat-calendar-next-button');
      if (this.lastMonthOfTheYear === 'December') {
        btnNxtHide?.classList?.add('nextHide');
        btnNxtHide?.classList?.remove('previousHide');
      } else {
        this.lastMonthOfTheYear = '';
        btnNxtHide?.classList?.remove('nextHide');
      }
      const btnPrevHide = document.querySelector(
        '.mat-calendar-previous-button'
      );
      btnPrevHide?.classList?.remove('previousHide');
    }
  }

  switchMonth(newDate: Date): void {
    this.payrollCalendarList = [];
    console.log(newDate);
    this.month._goToDateInView(newDate, 'month');
    this.calendarViewGroup.selectedIndex = 0;
  }
}
