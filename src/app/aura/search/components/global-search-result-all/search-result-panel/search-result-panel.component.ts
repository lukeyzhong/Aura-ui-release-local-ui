import { EventEmitter, Output } from '@angular/core';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import {
  SearchResultCandidates,
  SearchResultEmployees,
  SearchResultJobs,
  SearchResultOrganizations,
} from 'src/app/shared/interface/search.interface';
import { SearchResultPanelTitle } from '../../../enum/search.enum';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';

@Component({
  selector: 'app-search-result-panel',
  templateUrl: './search-result-panel.component.html',
  styleUrls: ['./search-result-panel.component.scss'],
})
export class SearchResultPanelComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  advanceSearchForm!: FormGroup;
  name = '';
  email = '';
  phone = '';
  status = 0;
  jobcode = '';
  jobtitle = '';
  department = '';
  jobstart = '';
  domain = '';
  ein = '';
  visible = true;
  selectable = true;
  removable = true;
  stat: string[] = [];
  depart: string[] = [];
  statusDesc = '';
  departmentName = '';
  advancedFiltersLength!: number;
  resetSort = false;
  mapStatus = new Map<number, string>();
  mapDept = new Map<string, string>();
  previousSearchValue = '';

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSelectFilterValues = new EventEmitter<{
    advancedFilters: FormArray;
    title: string;
    status: number;
    department: string;
  }>();
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onCloseMatChipsValues = new EventEmitter<{
    advancedFilters: FormArray;
    title: string;
    status: number;
    department: string;
  }>();

  disableSort = ['Employee Code', 'Phone', 'Code', 'Job Code'];
  sortColumn = '';

  @Input() tableData!:
    | SearchResultEmployees[]
    | SearchResultCandidates[]
    | SearchResultJobs[]
    | SearchResultOrganizations[]
    | null;
  @Input() title!: SearchResultPanelTitle;
  @Input() isLoading = false;
  // tslint:disable-next-line: no-any
  @Input() columns: any;
  // tslint:disable-next-line: no-any
  @Input() displayedColumns: any;
  @Input() expanded!: boolean;
  @Input() type!: string | undefined;
  @Input() totalRows = 0;
  @Input() searchText = '';

  @Output() paginatorClicked = new EventEmitter();
  @Output() sortClicked = new EventEmitter();

  resultsLength = 0;

  pageSizeOptions = [10, 20, 30, 40, 50];
  displayResults = '';
  searchKey = '';
  tempColumn = '';
  sortDirection = 1;

  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private lookupCodeService: LookupService
  ) {}

  ngOnInit(): void {
    this.advanceSearchForm = this.fb.group({
      name: [''],
      email: [''],
      phone: [''],
      status: [''],
      jobcode: [''],
      jobtitle: [''],
      department: [''],
      jobstart: [''],
      domain: [''],
      ein: [''],
      advancedFilters: this.fb.array([]),
    });

    if (this.title === 'Employees') {
      // tslint:disable-next-line: deprecation
      this.lookupCodeService.getEmployeeStatusCode().subscribe((data) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data?.result?.length; i++) {
          this.mapStatus.set(
            data?.result[i]?.lookupCode,
            data?.result[i]?.description
          );
        }
      });
    }

    if (this.title === 'Candidates') {
      this.lookupCodeService.getCandidateStatusCode().subscribe((data) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data?.result?.length; i++) {
          this.mapStatus.set(
            data?.result[i]?.lookupCode,
            data?.result[i]?.description
          );
        }
      });
    }

    if (this.title === 'Jobs') {
      this.lookupCodeService.getJobsStatusCode().subscribe((data) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data?.result?.length; i++) {
          this.mapStatus.set(
            data?.result[i]?.lookupCode,
            data?.result[i]?.description
          );
        }
      });

      this.lookupCodeService.getDepartmentLookup().subscribe((data) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data?.result?.length; i++) {
          this.mapDept.set(
            data?.result[i]?.departmentId,
            data?.result[i]?.departmentName
          );
        }
      });
    }

    if (this.title === 'Organizations') {
      this.lookupCodeService.getOrganizationStatusCode().subscribe((data) => {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < data?.result?.length; i++) {
          this.mapStatus.set(
            data?.result[i]?.lookupCode,
            data?.result[i]?.description
          );
        }
      });
    }
    this.previousSearchValue = this.searchText;
  }

  ngOnChanges(change: SimpleChanges): void {
    this.isLoading = true;
    if (change?.tableData && change?.tableData?.currentValue) {
      this.updateTable(change?.tableData?.currentValue);
    }
    if (change?.totalRows && change?.totalRows?.currentValue) {
      this.paginator?.firstPage();
      this.resetSort = true;
      this.sortColumn = '';
      this.sortDirection = 1;
    }
    if (this.previousSearchValue !== this.searchText) {
      const advancedFilters = this.advanceSearchForm?.get(
        'advancedFilters'
      ) as FormArray;
      advancedFilters?.clear();
      this.advancedFiltersLength = 0;
      this.advanceSearchForm?.reset();
    }
    this.previousSearchValue = this.searchText;
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

  // tslint:disable-next-line: no-any
  select(row: any, e: any): void {
    if (!e.target?.className?.includes('search-name')) {
      return;
    }
    const value = row;
    const path = ['/aura/search'];
    let id;
    let searchText;

    if (value && value?.id && value?.candidateCode) {
      path.push('candidate');
      id = value?.id;
      searchText = value?.firstName + ' ' + value?.lastName;
    } else if (value && value?.id) {
      path.push('employee');
      id = value.id;
      searchText = value?.firstName + ' ' + value?.lastName;
    }

    this.router.navigate(path, {
      queryParams: { id, searchText },
    });
  }

  getStatusColor(status: string): string {
    let color = '';
    switch (status) {
      case 'Active':
        color = '#50E109';
        break;
      case 'Resigned':
        color = '#FFC107';
        break;
      case 'Terminated':
        color = '#DC3545';
        break;
    }
    return color;
  }

  // tslint:disable-next-line: no-any
  updateTable(tableData: any): void {
    this.isLoading = false;
    this.resultsLength = this.totalRows;
    this.displayResults = `${this.totalRows} Results`;
    switch (this.title) {
      case SearchResultPanelTitle.EMPLOYEES:
        this.searchKey = 'employeeName';
        break;
      case SearchResultPanelTitle.CANDIDATES:
        this.searchKey = 'candidateName';
        break;
      case SearchResultPanelTitle.JOBS:
        this.searchKey = 'jobCode';
        break;
      case SearchResultPanelTitle.ORGANIZATIONS:
        this.searchKey = 'name';
        break;
    }
    this.dataSource = new MatTableDataSource(tableData);
  }

  pageChanged(event: PageEvent): void {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;

    const currentPage = {
      pageIndex: pageIndex + 1,
      pageSize,
      title: this.title,
    };
    this.isLoading = true;
    this.paginatorClicked.emit(currentPage);
  }

  onSearch(): void {
    this.resetFilterValues();
    if (this.advanceSearchForm?.get('name')?.value) {
      this.name = this.advanceSearchForm?.get('name')?.value;
    }
    if (this.advanceSearchForm?.get('email')?.value) {
      this.email = this.advanceSearchForm?.get('email')?.value;
    }
    if (this.advanceSearchForm?.get('phone')?.value) {
      this.phone = this.advanceSearchForm?.get('phone')?.value;
    }
    if (this.advanceSearchForm?.get('status')?.value) {
      this.status = this.advanceSearchForm?.get('status')?.value;
      for (const entry of this.mapStatus?.entries()) {
        if (entry[0] === this.status) {
          this.statusDesc = entry[1];
        }
      }
    }
    if (this.advanceSearchForm?.get('jobcode')?.value) {
      this.jobcode = this.advanceSearchForm?.get('jobcode')?.value;
    }
    if (this.advanceSearchForm?.get('jobtitle')?.value) {
      this.jobtitle = this.advanceSearchForm?.get('jobtitle')?.value;
    }
    if (this.advanceSearchForm?.get('department')?.value) {
      this.department = this.advanceSearchForm?.get('department')?.value;
      for (const entry of this.mapDept?.entries()) {
        if (entry[0] === this.department) {
          this.departmentName = entry[1];
        }
      }
    }
    if (this.advanceSearchForm?.get('jobstart')?.value) {
      this.jobstart = this.advanceSearchForm?.get('jobstart')?.value;
    }
    if (this.advanceSearchForm?.get('domain')?.value) {
      this.domain = this.advanceSearchForm?.get('domain')?.value;
    }
    if (this.advanceSearchForm?.get('ein')?.value) {
      this.ein = this.advanceSearchForm?.get('ein')?.value;
    }
    this.isLoading = true;
    const advancedFilters = this.advanceSearchForm?.get(
      'advancedFilters'
    ) as FormArray;
    advancedFilters.clear();
    if (this.name !== '') {
      advancedFilters.push(this.fb.control('Na' + this.name?.trim()));
    }
    if (this.email !== '') {
      advancedFilters.push(this.fb.control('Em' + this.email?.trim()));
    }
    if (this.phone !== '') {
      advancedFilters.push(this.fb.control('Ph' + this.phone?.trim()));
    }
    if (this.statusDesc !== '') {
      advancedFilters.push(this.fb.control('St' + this.statusDesc?.trim()));
    }
    if (this.jobcode !== '') {
      advancedFilters.push(this.fb.control('Jo' + this.jobcode?.trim()));
    }
    if (this.jobtitle !== '') {
      advancedFilters.push(this.fb.control('Jt' + this.jobtitle?.trim()));
    }
    if (this.departmentName !== '') {
      advancedFilters.push(this.fb.control('De' + this.departmentName?.trim()));
    }
    if (this.jobstart !== '') {
      this.jobstart = this.changeDateFormat(this.jobstart);
      advancedFilters.push(this.fb.control('Js' + this.jobstart?.trim()));
    }
    if (this.domain !== '') {
      advancedFilters.push(this.fb.control('Do' + this.domain?.trim()));
    }
    if (this.ein !== '') {
      advancedFilters.push(this.fb.control('Ei' + this.ein?.trim()));
    }
    this.advancedFiltersLength = advancedFilters.length;
    this.onSelectFilterValues.emit({
      // tslint:disable-next-line: object-literal-shorthand
      advancedFilters: advancedFilters,
      title: this.title,
      status: this.status,
      department: this.department,
    });
  }

  // tslint:disable-next-line: no-any
  changeDateFormat(inputDate: string): any {
    if (inputDate) {
      const splitDate = inputDate?.split('-');
      const year = splitDate[0];
      const month = splitDate[1];
      const day = splitDate[2];
      return month + '/' + day + '/' + year;
    }
  }

  resetFilterValues(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.status = 0;
    this.jobcode = '';
    this.jobtitle = '';
    this.department = '';
    this.jobstart = '';
    this.domain = '';
    this.ein = '';
    this.departmentName = '';
    this.statusDesc = '';
  }

  remove(index: number): void {
    const advancedFilters = this.advanceSearchForm.get(
      'advancedFilters'
    ) as FormArray;

    if (index >= 0) {
      advancedFilters.removeAt(index);
    }
    this.advancedFiltersLength = advancedFilters.length;
    this.isLoading = true;

    this.onCloseMatChipsValues.emit({
      advancedFilters,
      title: this.title,
      status: this.status,
      department: this.department,
    });
    if (this.advancedFiltersLength === 0) {
      this.advanceSearchForm.reset();
    }
  }

  closeAllChips(): void {
    const advancedFilters = this.advanceSearchForm.get(
      'advancedFilters'
    ) as FormArray;
    advancedFilters.clear();
    this.advancedFiltersLength = 0;
    this.isLoading = true;

    this.onCloseMatChipsValues.emit({
      advancedFilters,
      title: this.title,
      status: this.status,
      department: this.department,
    });
    this.advanceSearchForm.reset();
  }

  // tslint:disable-next-line: typedef
  get formData() {
    return this.advanceSearchForm?.get('advancedFilters') as FormArray;
  }

  sortData(colName: string): void {
    this.isLoading = true;
    this.sortColumn = colName;

    // ascending order
    if (this.sortDirection === 2) {
      this.sortDirection = 1;
      this.tempColumn = '';
    }
    // descending order
    else if (colName === this.tempColumn) {
      this.sortDirection = 2;
    }
    this.tempColumn = colName;

    const currentPage = {
      pageIndex: 1,
      pageSize: this.paginator.pageSize,
      colName,
      sortDirection: this.sortDirection,
      title: this.title,
    };
    this.sortClicked.emit(currentPage);
  }
}
