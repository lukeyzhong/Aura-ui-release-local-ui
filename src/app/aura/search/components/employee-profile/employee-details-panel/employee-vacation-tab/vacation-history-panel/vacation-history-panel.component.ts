import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { EmployeeVacations } from '../../../../../../search/interface/employee-profile/employee-profile-vacation.interface';

@Component({
  selector: 'app-vacation-history-panel',
  templateUrl: './vacation-history-panel.component.html',
  styleUrls: ['./vacation-history-panel.component.scss']
})
export class VacationHistoryPanelComponent implements OnInit, OnChanges {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Input() tableData!: EmployeeVacations[] | null;
  @Input() isLoading = false;
  // tslint:disable-next-line: no-any
  @Input() columns: any;
  // tslint:disable-next-line: no-any
  @Input() displayedColumns: any;
  @Input() totalRows = 0;

  @Output() paginatorClicked = new EventEmitter();

  resultsLength = 0;

  pageSizeOptions = [10, 20, 30, 40, 50];
  displayResults = '';

  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  constructor() {}

  ngOnInit(): void {
  }

  ngOnChanges(change: SimpleChanges): void {
    this.isLoading = true;
    if (change.tableData && change.tableData.currentValue) {
      this.updateTable(change.tableData.currentValue);
    }
    if (change.totalRows && change.totalRows.currentValue) {
      this.paginator?.firstPage();
    }
  }

  // tslint:disable-next-line: no-any
  isFloat(input: any): number | boolean {
    if (typeof input !== 'number' && input !== null) {
      if (
        isFinite(Date.parse(input.toString())) &&
        !isFinite(input.toString())
      ) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return input % 1 !== 0;
    }
  }

  getStatusColor(status: string): string {
    let color = '';
    switch (status) {
      case 'Approved':
        color = '#51BA31';
        break;
      case 'Submitted':
        color = '#CC910C';
        break;
      case 'Rejected':
        color = '#D94856';
        break;
      case 'Cancelled':
        color = '#D94856';
        break;
    }
    return color;
  }

  // tslint:disable-next-line: no-any
  updateTable(tableData: any): void {
    this.isLoading = false;
    this.resultsLength = this.totalRows;
    this.displayResults = `${this.totalRows} Results`;
    this.dataSource = new MatTableDataSource(tableData);
  }

  pageChanged(event: PageEvent): void {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;

    const currentPage = {
      pageIndex: pageIndex + 1,
      pageSize,
    };
    this.isLoading = true;
    this.paginatorClicked.emit(currentPage);
  }

}
