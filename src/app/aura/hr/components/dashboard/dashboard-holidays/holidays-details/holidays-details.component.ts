import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import { Holidays } from '../../../../../../aura/hr/enum/holidays.enum';
import { CsvUtilityService } from '../../../../../../shared/service/utility/csv-utility.service';
import { HolidaysData } from '../../../../../hr/interface/dashboard/hr-dashboard.interface';

@Component({
  selector: 'app-holidays-details',
  templateUrl: './holidays-details.component.html',
  styleUrls: ['./holidays-details.component.scss'],
})
export class HolidaysDetailsComponent implements OnInit {
  holidayPopupData!: HolidaysData;
  holidaysData!: HolidaysData[];
  name = '';
  imageName = '';
  month = '';
  date!: number;
  day = '';
  index = 0;
  currentYear = '';
  currentDate!: Date;
  isLoadSpinner = false;
  isMovingForward = true;
  isMovingBackward = true;
  displayedColumns: string[] = [
    'S.No',
    'Date',
    'Holiday',
    'Day',
];
// tslint:disable-next-line: no-any
dataSource!: MatTableDataSource<any>;
// tslint:disable-next-line: no-any
tableData: any;

  constructor( private csvUtilityService: CsvUtilityService,
              // tslint:disable-next-line: no-any
               private dialogRef: MatDialogRef<any>,
               private hrDashboardService: HrDashboardService,
              // tslint:disable-next-line: no-any
               @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.holidaysData = data?.obj?.holidaysData;
    this.name = data?.obj?.name;
    this.month = data?.obj?.month;
    this.date = data?.obj?.date;
    this.day = data?.obj?.day;
    this.index = data?.obj?.index;
  }

  ngOnInit(): void {
    this.currentDate = new Date();
    this.currentYear = this.currentDate.getFullYear().toString();
    switch (this.name){
      case Holidays.NewYearDay:
        this.imageName = 'new-year.png';
        break;
      case Holidays.MemorialDay:
        this.imageName = 'Memorial-day.png';
        break;
      case Holidays.IndependenceDay:
        this.imageName = 'Independence.png';
        break;
      case Holidays.LaborDay:
        this.imageName = 'Labor-Day.png';
        break;
      case Holidays.Diwali:
        this.imageName = 'new-year.png';
        break;
      case Holidays.ThanksgivingDay:
        this.imageName = 'Thanks-Giving.png';
        break;
      case Holidays.BlackFriday:
        this.imageName = 'water.svg';
        break;
      case Holidays.ChristmasEve:
        this.imageName = 'Christmas.png';
        break;
      case Holidays.MartinLutherKing:
        this.imageName = 'Martin-Luther-King.png';
        break;
      default:
        this.imageName = 'water.svg';
    }

    this.isLoadSpinner = true;

    if (this.index === this.holidaysData?.length - 1){
      this.isMovingForward = false;
    }
    if (this.index === 0){
      this.isMovingBackward = false;
    }
    this.tableData = this.holidaysData;
    this.dataSource = new MatTableDataSource(this.tableData);
    this.isLoadSpinner = false;
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
    switch (this.name){
      case Holidays.NewYearDay:
        this.imageName = 'new-year.png';
        break;
      case Holidays.MemorialDay:
        this.imageName = 'Memorial-day.png';
        break;
      case Holidays.IndependenceDay:
        this.imageName = 'Independence.png';
        break;
      case Holidays.LaborDay:
        this.imageName = 'Labor-Day.png';
        break;
      case Holidays.Diwali:
        this.imageName = 'new-year.png';
        break;
      case Holidays.ThanksgivingDay:
        this.imageName = 'Thanks-Giving.png';
        break;
      case Holidays.BlackFriday:
        this.imageName = 'water.svg';
        break;
      case Holidays.ChristmasEve:
        this.imageName = 'Christmas.png';
        break;
      case Holidays.MartinLutherKing:
        this.imageName = 'Martin-Luther-King.png';
        break;
      default:
        this.imageName = 'water.svg';
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
    switch (this.name){
      case Holidays.NewYearDay:
        this.imageName = 'new-year.png';
        break;
      case Holidays.MemorialDay:
        this.imageName = 'Memorial-day.png';
        break;
      case Holidays.IndependenceDay:
        this.imageName = 'Independence.png';
        break;
      case Holidays.LaborDay:
        this.imageName = 'Labor-Day.png';
        break;
      case Holidays.Diwali:
        this.imageName = 'new-year.png';
        break;
      case Holidays.ThanksgivingDay:
        this.imageName = 'Thanks-Giving.png';
        break;
      case Holidays.BlackFriday:
        this.imageName = 'water.svg';
        break;
      case Holidays.ChristmasEve:
        this.imageName = 'Christmas.png';
        break;
      case Holidays.MartinLutherKing:
        this.imageName = 'Martin-Luther-King.png';
        break;
      default:
        this.imageName = 'water.svg';
    }
  }

  // tslint:disable-next-line: typedef
  public get Holidays() {
    return Holidays;
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  exportToCSV(format: string): void {
    this.hrDashboardService.exportHolidaysData(format, this.currentYear).subscribe(
      (data) => {
        const file = new Blob([data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const fileURL = URL.createObjectURL(file);
        saveAs(fileURL, 'Holiday List' + '.' + format);
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  download(format: string): void {
    this.exportToCSV(format);
  }


}
