import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import { GetTaskResults } from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActiveUserInfoService } from '../../../../../../core/service/active-user-info.service';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  providers: [DatePipe],
})
export class TaskDetailsComponent implements OnInit {
  taskData: GetTaskResults[] = [];
  isLoadSpinner = false;
  searchTerm = '';
  userId!: string;
  fromDate: string | null = '';
  toDate: string | null = '';
  dateFilter!: FormGroup;
  taskFromDate: string | null = '';
  taskToDate: string | null | Date = '';
  currentDate!: Date;
  sortColumn = 'DueOn';
  sortDirection = 'Descending';
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  // tslint:disable-next-line: no-any
  tableData: any;
  currDate!: string;

  displayedColumns: string[] = [
    'taskCode',
    'taskTitle',
    'assignedTo',
    'assignedBy',
    'createdOn',
    'dueOn',
    'status',
  ];
  // tslint:disable-next-line: no-any
  constructor(private dialogRef: MatDialogRef<any>, private hrDashboardService: HrDashboardService,
              private datepipe: DatePipe, private dateFilterBuilder: FormBuilder, private activeUserInfo: ActiveUserInfoService) { }

  ngOnInit(): void {
    const curDate = new Date();
    // tslint:disable-next-line: no-non-null-assertion
    this.currDate = this.datepipe.transform(curDate, 'yyyy-MM-dd')!;
    this.userId = this.activeUserInfo?.getActiveUserInfo()?.userId;
    this.dateFilter = this.dateFilterBuilder.group(
      {
        taskFromDate: [this.currentDate],
        taskToDate: [''],
      },
      { validator: this.validateProjectDates }
    );
    this.getTaskDetails();
  }

  getTaskDetails(): void {
    this.isLoadSpinner = true;
    // tslint:disable-next-line: no-non-null-assertion
    this.hrDashboardService.getDashboardTasksDetails(this.searchTerm, this.fromDate!, this.toDate!,
      this.sortColumn, this.sortDirection).subscribe((data) => {
        this.taskData = data?.result?.results;
        this.tableData = this.taskData;
        this.dataSource = new MatTableDataSource(this.tableData);
        this.isLoadSpinner = false;
      },
        (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  // tslint:disable-next-line: no-any
  validateProjectDates(group: FormGroup): any {
    if (
      group.controls.taskToDate.value &&
      group.controls.taskToDate.value < group.controls.taskFromDate.value
    ) {
      return { notValid: true };
    }
    return null;
  }

  updateTaskChart(type: string): void {
    switch (type) {
      case 'start':
        {
          if (this.dateFilter.controls.taskFromDate.value === null) {
            this.toDate = '';
            this.fromDate = '';
            this.dateFilter.controls.taskToDate.setValue('');
          } else {
            const searchDate = this.datepipe.transform(
              this.dateFilter.controls.taskFromDate.value,
              'yyyy-MM-dd'
            );
            this.fromDate = searchDate;
            this.toDate =
              this.toDate === null || this.toDate === ''
                ? ''
                : this.datepipe.transform(this.toDate, 'yyyy-MM-dd');
          }
        }
        break;
      case 'end':
        {
          this.currentDate = new Date();
          if (this.dateFilter.controls.taskFromDate.value === null) {
            this.dateFilter.controls.taskFromDate.setValue(this.currentDate);
            this.fromDate = String(
              this.datepipe.transform(this.currentDate, 'yyyy-MM-dd')
            );
          }
          const searchDate = this.datepipe.transform(
            this.dateFilter.controls.taskToDate.value,
            'yyyy-MM-dd'
          );
          this.toDate =
            searchDate === null || searchDate === '' ? '' : searchDate;
        }
        break;
    }

    this.getTaskDetails();
  }

  resetDates(): void {
    this.dateFilter.controls.taskFromDate.reset();
    this.dateFilter.controls.taskToDate.reset();
    this.fromDate = '';
    this.toDate = '';
    this.getTaskDetails();
  }

  performSearch(search: string): void {
    this.searchTerm = search;
    if (search.length >= 2 || search.length === 0) {
      this.getTaskDetails();
    }
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  // tslint:disable-next-line: no-any
  goToTasksUrl(task: any): void {
    if (task?.assignedToId === this.userId || task?.assignedToId === null) {
      window.open(task?.url, '_self');
    }
  }

}
