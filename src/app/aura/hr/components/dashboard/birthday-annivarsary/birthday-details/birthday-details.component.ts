import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AnniversaryBirthdayData, AnniversaryBirthdayDetails } from '../../../../../hr/interface/dashboard/hr-dashboard.interface';
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
  selector: 'app-birthday-details',
  templateUrl: './birthday-details.component.html',
  styleUrls: ['./birthday-details.component.scss'],
  providers: [DatePipe],
})
export class BirthdayDetailsComponent implements OnInit {
  birthdayData: AnniversaryBirthdayData[] = [];
  birthdayMonthsData: AnniversaryBirthdayData[] = [];
  birthdayMonthsWise: AnniversaryBirthdayData[] = [];
  birthdayDataForExcel: AnniversaryBirthdayData[] = [];
  // tslint:disable-next-line: no-any
  birthdayMonthsWiseFiltered: any[] = [];
  nextWeekBirthdayDates: AnniversaryBirthdayDetails[] = [];
  todayBirthday: AnniversaryBirthdayDetails[] = [];
  currentDate!: Date;
  isLoadSpinner = false;
  fetchAll = true;
  index = 0;
  idx = 0;
  sno = 0;
  isMovingForward = true;
  isMovingBackward = true;
  isTodayBirthdayBackward = true;
  isTodayBirthdayForward = true;
  selectedMonths: string[] = [];
  enableSearch = true;
  downloadType = 'datagrid';
  dataGridType = 'Birthdays';
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
    'dateOfBirth',
    'startDate',
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

  constructor(private hrDashboardService: HrDashboardService,
              private csvUtilityService: CsvUtilityService,
              // tslint:disable-next-line: no-any
              private dialogRef: MatDialogRef<any>,
              // tslint:disable-next-line: no-any
              @Inject(MAT_DIALOG_DATA) data: any,
              private datePipe: DatePipe,
              private documentsService: DocumentsService
  ) { }

  ngOnInit(): void {
    this.nextMonths = [];
    this.currentDate = new Date();
    for (let k = 0; k < 12; k++){
     this.monthList.push(Months[k]);
   }
    this.months.push(this.currentDate.getMonth() + 1);
    if ((this.currentDate.getMonth() + 1) < 12) {
      this.nextMonths.push(this.currentDate.getMonth() + 1);
      this.nextMonths.push(this.currentDate.getMonth() + 2);
    }
    else{
      this.nextMonths.push(this.currentDate.getMonth() + 1);
      this.nextMonths.push(this.currentDate.getMonth() - 10);
    }
    this.defaultMonth.push(Months[this.currentDate.getMonth()]);
    this.monthControl.setValue(this.defaultMonth as string[]);
    if (this.index === 0){
      this.isMovingBackward = false;
    }
    if (this.idx === 0){
      this.isTodayBirthdayBackward = false;
    }
    this.setBirthdaysTopSection();
    this.setBirthdaysTableSection();
  }

  movingBackward(): void{
    this.isMovingForward = true;
    this.index = this.index - 1;
    if (this.index === 0){
      this.isMovingBackward = false;
     }
  }

  movingForkward(): void{
    this.isMovingBackward = true;
    this.index = this.index + 1;
    if (this.index === this.nextWeekBirthdayDates.length - 5){
     this.isMovingForward = false;
    }
  }

  todayBirthdayBackward(): void{
    this.isTodayBirthdayForward = true;
    this.idx = this.idx - 1;
    if (this.idx === 0){
      this.isTodayBirthdayBackward = false;
     }
  }

  todayBirthdayForward(): void{
    this.isTodayBirthdayBackward = true;
    this.idx = this.idx + 1;
    if (this.idx === this.todayBirthday.length - 5){
     this.isTodayBirthdayForward = false;
    }
  }

  setBirthdaysTopSection(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService.getBirthdayData(this.fetchAll, '', this.nextMonths).subscribe(
        (data) => {
          this.birthdayData = data?.result;
          // tslint:disable-next-line: no-non-null-assertion
          const now = moment(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')!);
            // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.birthdayData.length; i++){
            const birthday = moment(this.birthdayData[i]?.dateOfBirth?.split('T')[0]).year(now.year());
            const daysRemaining = birthday.diff(now, 'days');
            if ((daysRemaining >= 1) && (daysRemaining <= 7)) {
               this.nextWeekBirthdayDates.push({
                name: this.birthdayData[i]?.firstName,
                lname: this.birthdayData[i]?.lastName,
                date: daysRemaining === 1 ? 'Tomorrow' : birthday.date().toString(),
                month: daysRemaining === 1 ? ' ' : Months[birthday.month()],
                image: this.birthdayData[i]?.displayPictureBase64,
              });
            }
            if (daysRemaining === 0) {
            this.todayBirthday.push({
              name: this.birthdayData[i]?.firstName,
              lname: this.birthdayData[i]?.lastName,
              date: daysRemaining === 0 ? 'Today' : birthday.date().toString(),
              month: daysRemaining === 0 ? ' ' : Months[birthday.month()],
              image: this.birthdayData[i]?.displayPictureBase64,
            });
            }
          }
          if (this.nextWeekBirthdayDates.length <= 5){
              this.isMovingForward = false;
          }
          if (this.todayBirthday.length <= 5){
              this.isTodayBirthdayForward = false;
          }
          this.isLoadSpinner = false;
        },
          (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        });
  }

  setBirthdaysTableSection(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService.getBirthdayData(this.fetchAll, this.search, this.months).subscribe(
        (data) => {
        if (data?.errorCode === 0){
          this.birthdayMonthsData = data?.result;
          // tslint:disable-next-line: no-non-null-assertion
          const now = moment(this.datePipe.transform(this.currentDate, 'yyyy-MM-dd')!);
          this.birthdayMonthsWise = [];
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.birthdayMonthsData.length; i++){
            const birthday = moment(this.birthdayMonthsData[i]?.dateOfBirth?.split('T')[0]).year(now.year());
            this.birthdayMonthsWise.push(
              {
                month: Months[birthday.month()],
                displayPictureBase64: this.birthdayMonthsData[i]?.displayPictureBase64,
                employeeCode: this.birthdayMonthsData[i]?.employeeCode,
                firstName: this.birthdayMonthsData[i]?.firstName,
                lastName: this.birthdayMonthsData[i]?.lastName,
                alias: this.birthdayMonthsData[i]?.alias,
                email: this.birthdayMonthsData[i]?.email,
                phone: this.birthdayMonthsData[i]?.phone,
                dateOfBirth: this.birthdayMonthsData[i]?.dateOfBirth,
                startDate: this.birthdayMonthsData[i]?.startDate,
              }
            );
          }
          this.birthdayMonthsWiseFiltered = [];
          for (const month of this.months){
            this.sno = 0;
            this.birthdayMonthsWiseFiltered.push({month: Months[month - 1], isGroupBy: true});
            // tslint:disable-next-line: prefer-for-of
            for (let j = 0; j < this.birthdayMonthsWise.length; j++){
            if (this.birthdayMonthsWise[j].month === Months[month - 1]){
              this.sno = this.sno + 1;
              this.birthdayMonthsWiseFiltered.push(
              {
                sno: this.sno,
                displayPictureBase64: this.birthdayMonthsWise[j]?.displayPictureBase64,
                employeeCode: this.birthdayMonthsWise[j]?.employeeCode,
                firstName: this.birthdayMonthsWise[j]?.firstName,
                lastName: this.birthdayMonthsWise[j]?.lastName,
                alias: this.birthdayMonthsWise[j]?.alias,
                email: this.birthdayMonthsWise[j]?.email,
                phone: this.birthdayMonthsWise[j]?.phone,
                // tslint:disable-next-line: no-non-null-assertion
                dateOfBirth: this.datePipe.transform(this.birthdayMonthsWise[j]?.dateOfBirth, 'MM-dd-yyyy')!,
                // tslint:disable-next-line: no-non-null-assertion
                startDate: this.datePipe.transform(this.birthdayMonthsWise[j]?.startDate, 'MM-dd-yyyy')!
                });
            }
          }
        }
          this.tableData = this.birthdayMonthsWiseFiltered;
          this.dataSource = new MatTableDataSource(this.tableData);
          if (this.birthdayMonthsWiseFiltered.length === 0){
            this.enableSearch = false;
          }
          else{
            this.enableSearch = true;
          }
          this.isLoadSpinner = false;
        }
        else{
          this.isLoadSpinner = false;
        }
        },
          (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        });
  }

  exportToCSV(): void {
    this.birthdayDataForExcel = [];
    const columnsDisplayed = [
      'Month',
      'Emp Code',
      'First Name',
      'Last Name',
      'Alias Name',
      'Email',
      'Cell Phone',
      'Date Of Birth',
      'Date Of Joining'
    ];

    for (const monthName of this.months) {
      for (const rec of this.birthdayMonthsWise) {
        if (rec?.month === Months[monthName - 1].toString()) {
        this.birthdayDataForExcel.push({
          month: rec?.month,
          displayPictureBase64: rec?.displayPictureBase64,
          employeeCode: rec?.employeeCode,
          firstName: rec?.firstName,
          lastName: rec?.lastName,
          alias: rec?.alias,
          email: rec?.email,
          phone: rec?.phone,
          dateOfBirth: rec?.dateOfBirth,
          startDate: rec?.startDate
        });
      }
    }
    }
    this.excelTableData = this.birthdayDataForExcel.map((item, index) => {
      return {
        Month: item.month,
        'Emp Code': item.employeeCode,
        'First Name': item.firstName,
        'Last Name': item.lastName,
        'Alias Name': item.alias,
         Email: item.email,
        'Cell Phone': item.phone,
        'Date Of Birth': item.dateOfBirth,
        'Date Of Joining': item.startDate,
      };
    });

    this.csvUtilityService.exportToCSV(
      this.excelTableData,
      columnsDisplayed,
      'Birthday List'
    );
  }

  performSearch(search: string): void{
    this.search = search;
    if (search.length >= 2 || search.length === 0) {
      this.setBirthdaysTableSection();
    }
  }


  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  // tslint:disable-next-line: no-any
  isGroup(index: number, item: any): boolean{
    return item.isGroupBy;
  }

  onMonthSelection(): void{
    this.selectedMonths = this.monthControl.value.slice() as string[];
    this.months = [];
    // tslint:disable-next-line: prefer-for-of
    for (let m = 0; m < this.selectedMonths.length; m++) {
      this.months.push(Object.values(Months).indexOf(this.selectedMonths[m]) + 1);
    }
    this.setBirthdaysTableSection();
  }

  onMonthRemoved(month: string): void {
    this.selectedMonths = this.monthControl.value.slice() as string[];
    this.removeFirst(this.selectedMonths, month);
    this.monthControl.setValue(this.selectedMonths);
    this.months = [];
    // tslint:disable-next-line: prefer-for-of
    for (let m = 0; m < this.selectedMonths.length; m++) {
      this.months.push(Object.values(Months).indexOf(this.selectedMonths[m]) + 1);
    }
    this.setBirthdaysTableSection();
  }

  private removeFirst<T>(array: T[], toRemove: T): void {
    const index = array.indexOf(toRemove);
    if (index !== -1) {
      array.splice(index, 1);
    }
  }

  download(format: string): void {
    this.downloadBirthdaysExcelOrCSV(format);
  }

  downloadBirthdaysExcelOrCSV(format: string): void {
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
