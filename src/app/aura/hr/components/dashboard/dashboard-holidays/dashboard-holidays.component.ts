import { Component, OnInit } from '@angular/core';
import { Days } from '../../../enum/days.enum';
import { Months } from '../../../enum/months.enum';
import { HolidaysData, HolidaysPopupData, HolidaysResultData } from '../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { HolidaysDetailsComponent } from './holidays-details/holidays-details.component';

@Component({
  selector: 'app-dashboard-holidays',
  templateUrl: './dashboard-holidays.component.html',
  styleUrls: ['./dashboard-holidays.component.scss'],
  providers: [DatePipe],
})
export class DashboardHolidaysComponent implements OnInit {
  holidaysResultData!: HolidaysResultData[];
  holidaysData: HolidaysData[] = [];
  currDate!: number;
  currentYear = '';
  currentMonth!: number;
  currentDate!: Date;
  fullCurrentDate = '';
  index = 0;
  name = '';
  month = '';
  date!: number;
  day = '';
  isLoadSpinner = false;
  isMovingForward = true;
  isMovingBackward = true;

  constructor(private hrDashboardService: HrDashboardService,
              private datePipe: DatePipe,
              private dialog: MatDialog,
               // tslint:disable-next-line: no-any
              private dialogRef: MatDialogRef<any>) {
   }

  ngOnInit(): void {
    this.currentDate = new Date();
     // tslint:disable-next-line: no-non-null-assertion
    this.fullCurrentDate = this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')!;
    this.setDashboardHolidaysData();
  }

  setDashboardHolidaysData(): void {
    this.isLoadSpinner = true;
    this.currentYear = this.currentDate.getFullYear().toString();
    this.currentMonth = this.currentDate.getMonth();
    this.currDate = this.currentDate.getDate();
    this.hrDashboardService.getHRDashboardHolidaysData(this.currentYear).subscribe(
        (data) => {
          this.holidaysResultData = data?.result;
          // tslint:disable-next-line: prefer-for-of
          for (let k = 0; k < this.holidaysResultData.length; k++) {
           const fullDate = this.holidaysResultData[k]?.date?.split('T')[0];
           const getHolidayName = this.holidaysResultData[k]?.name;
           const date = new Date(this.holidaysResultData[k]?.date);
           const getMonth = Months[date.getMonth()];
           const getDate = date.getDate();
           const getDay = Days[date.getDay()];
           this.holidaysData = Object.assign([{}], this.holidaysData);
           this.holidaysData[k] = {
            id: k,
            name: getHolidayName,
            month: getMonth,
            date: getDate,
            day: getDay,
            fDate: fullDate,
          };
        }
          // tslint:disable-next-line: prefer-for-of
          for (let m = 0; m < this.holidaysData?.length; m++){
          if (this.holidaysData[m].fDate >= this.fullCurrentDate){
            // tslint:disable-next-line: no-non-null-assertion
            this.index = this.holidaysData[m].id!;
            break;
          }
        }

          if (this.index === this.holidaysData?.length - 1){
          this.isMovingForward = false;
        }
          if (this.index === 0){
          this.isMovingBackward = false;
        }
          this.name = this.holidaysData[this.index]?.name;
          this.month = this.holidaysData[this.index]?.month;
          this.date = this.holidaysData[this.index]?.date;
          this.day = this.holidaysData[this.index]?.day;
          this.isLoadSpinner = false;
        },
        (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  movingBackward(): void{
    this.isMovingForward = true;
    this.index = this.index - 1;
    this.name = this.holidaysData[this.index]?.name;
    this.month = this.holidaysData[this.index]?.month;
    this.date = this.holidaysData[this.index]?.date;
    this.day = this.holidaysData[this.index]?.day;
    if (this.index === 0){
      this.isMovingBackward = false;
     }
  }

  movingForkward(): void{
    this.isMovingBackward = true;
    this.index = this.index + 1;
    this.name = this.holidaysData[this.index]?.name;
    this.month = this.holidaysData[this.index]?.month;
    this.date = this.holidaysData[this.index]?.date;
    this.day = this.holidaysData[this.index]?.day;
    if (this.index === this.holidaysData?.length - 1){
     this.isMovingForward = false;
    }
  }

  holidayDetails(): void {
    const dialogConfig = new MatDialogConfig();
    const obj: HolidaysPopupData = {
     holidaysData: this.holidaysData,
     name: this.name,
     month: this.month,
     date: this.date,
     day: this.day,
     index: this.index,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '50%';
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      HolidaysDetailsComponent,
      dialogConfig
    );
  }

}
