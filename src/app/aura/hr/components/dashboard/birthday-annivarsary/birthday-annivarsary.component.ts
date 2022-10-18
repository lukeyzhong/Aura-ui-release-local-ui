import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Months } from '../../../enum/months.enum';
import { AnniversaryBirthdayData } from '../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { AnniversaryDetailsComponent } from './anniversary-details/anniversary-details.component';
import { BirthdayDetailsComponent } from './birthday-details/birthday-details.component';

@Component({
  selector: 'app-birthday-annivarsary',
  templateUrl: './birthday-annivarsary.component.html',
  styleUrls: ['./birthday-annivarsary.component.scss']
})
export class BirthdayAnnivarsaryComponent implements OnInit {
  birthdayData: AnniversaryBirthdayData[] = [];
  birthdayDate: string[] = [];
  birthdayMonth: string[] = [];
  anniversaryData: AnniversaryBirthdayData[] = [];
  anniversaryDate: string[] = [];
  anniversaryMonth: string[] = [];
  currentDate!: Date;
  fetchAll = false;
  isLoadSpinner = false;
  tabIndex = 0;

  constructor(private hrDashboardService: HrDashboardService,
              private dialog: MatDialog,
              // tslint:disable-next-line: no-any
              private dialogRef: MatDialogRef<any>) { }

  ngOnInit(): void {
   this.currentDate = new Date();
   this.setDashboardBirthdayData();
   this.setDashboardAnniversaryData();
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.tabIndex = tabChangeEvent.index;
  }

  setDashboardBirthdayData(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService.getBirthdayData(this.fetchAll, '', []).subscribe(
        (data) => {
          this.birthdayData = data?.result;
          for (const birthday of this.birthdayData){
          // tslint:disable-next-line: no-non-null-assertion
          const dateOfBirth = new Date(birthday.dateOfBirth!);
          if (this.currentDate.getMonth() === dateOfBirth.getMonth())
          {
          const dayDiff = dateOfBirth.getDate() - this.currentDate.getDate();
          if (dayDiff === 0){
          this.birthdayDate.push('Today');
          this.birthdayMonth.push('');
          }
          else if (dayDiff === 1){
            this.birthdayDate.push('Tomorrow');
            this.birthdayMonth.push('');
            }
          else{
          this.birthdayDate.push(dateOfBirth.getDate().toString());
          this.birthdayMonth.push(Months[dateOfBirth.getMonth()]);
            }
          }
          else{
          this.birthdayDate.push(dateOfBirth.getDate().toString());
          this.birthdayMonth.push(Months[dateOfBirth.getMonth()]);
          }
        }
          this.isLoadSpinner = false;
        },
          (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  setDashboardAnniversaryData(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService.getAnniversaryData(this.fetchAll, '', []).subscribe(
        (data) => {
          this.anniversaryData = data?.result;
          for (const anniversary of this.anniversaryData){
          const startDate = new Date(anniversary.startDate);
          if (this.currentDate.getMonth() === startDate.getMonth())
          {
          const dayDiff = startDate.getDate() - this.currentDate.getDate();
          if (dayDiff === 0){
          this.anniversaryDate.push('Today');
          this.anniversaryMonth.push('');
          }
          else if (dayDiff === 1){
            this.anniversaryDate.push('Tomorrow');
            this.anniversaryMonth.push('');
            }
          else{
          this.anniversaryDate.push(startDate.getDate().toString());
          this.anniversaryMonth.push(Months[startDate.getMonth()]);
            }
          }
          else{
          this.anniversaryDate.push(startDate.getDate().toString());
          this.anniversaryMonth.push(Months[startDate.getMonth()]);
          }
        }
          this.isLoadSpinner = false;
        },
          (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  holidayAnniversaryDetails(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '95%';
    if (this.tabIndex === 0){
      this.dialogRef = this.dialog.open(
        AnniversaryDetailsComponent,
        dialogConfig
      );
  }
    if (this.tabIndex === 1){
      this.dialogRef = this.dialog.open(
        BirthdayDetailsComponent,
        dialogConfig
      );
  }
  }

}
