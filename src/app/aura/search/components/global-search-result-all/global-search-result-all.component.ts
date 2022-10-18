import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CandidateSearchList,
  EmployeeSearchList,
  GlobalSearchResult,
  JobSearchList,
  OrganizationSearchList,
} from 'src/app/shared/interface/search.interface';
import { GlobalSearchApiService } from 'src/app/shared/service/search/global-search-api.service';
import { SearchResultPanelTitle, SearchType } from '../../enum/search.enum';
import { CurrentPage, TableConfig } from '../../interface/table.interface';
import { FilterValues } from '../../interface/advanced-filter.interface';

@Component({
  selector: 'app-global-search-result-all',
  templateUrl: './global-search-result-all.component.html',
  styleUrls: ['./global-search-result-all.component.scss'],
})
export class GlobalSearchResultAllComponent implements OnInit {
  expanded = true;
  searchText!: string;
  total = 0;
  totalRows = 0;
  pageSize!: number;
  isProfilePicRequired!: boolean;
  pageNum!: number;
  resourceValue!: number;
  isAdvancedSearch!: boolean;
  name = '';
  email = '';
  phone = '';
  status = 0;
  stat = '';
  jobcode = '';
  jobtitle = '';
  department = '';
  jobstart = '';
  domain = '';
  ein = '';
  chipValues = [];
  chipValue!: string;
  filterValues = [];
  filterValue!: string;
  i = 0;
  advancedFiltersLength = 0;

  panelName!: string;
  searchResult!: GlobalSearchResult;

  // Employees Search Result Configurations
  employeesPanelConfig: TableConfig = {
    title: SearchResultPanelTitle.EMPLOYEES,
    type: SearchType.Employee,
    isLoading: true,
    displayedColumns: [
      'employeeName',
      'aliasName',
      'employeeCode',
      'email',
      'phone',
      'employeeStatus',
      'location',
      'reportingTo',
      'department',
    ],
    columns: [
      {
        headerDisplay: 'FirstName',
        key: 'firstName',
      },
      {
        headerDisplay: 'LastName',
        key: 'lastName',
      },
      {
        headerDisplay: 'Employee Name',
        key: 'employeeName',
      },
      {
        headerDisplay: 'Alias',
        key: 'aliasName',
      },
      {
        headerDisplay: 'Employee Code',
        key: 'employeeCode',
      },
      {
        headerDisplay: 'Email',
        key: 'email',
      },
      {
        headerDisplay: 'Phone',
        key: 'phone',
      },
      {
        headerDisplay: 'Status',
        key: 'employeeStatus',
      },
      {
        headerDisplay: 'City',
        key: 'city',
      },
      {
        headerDisplay: 'State',
        key: 'state',
      },
      {
        headerDisplay: 'Location',
        key: 'location',
      },
      {
        headerDisplay: 'Reporting To',
        key: 'reportingTo',
      },
      {
        headerDisplay: 'Department',
        key: 'department',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Candidates Search Result Configurations
  candidatesPanelConfig: TableConfig = {
    title: SearchResultPanelTitle.CANDIDATES,
    type: SearchType.Candidate,
    isLoading: true,
    displayedColumns: [
      'candidateName',
      'candidateCode',
      'email',
      'phone',
      'candidateStatus',
    ],
    columns: [
      {
        headerDisplay: 'FirstName',
        key: 'firstName',
      },
      {
        headerDisplay: 'LastName',
        key: 'lastName',
      },
      {
        headerDisplay: 'Candidate Name',
        key: 'candidateName',
      },
      {
        headerDisplay: 'Code',
        key: 'candidateCode',
      },
      {
        headerDisplay: 'Email',
        key: 'email',
      },
      {
        headerDisplay: 'Phone',
        key: 'phone',
      },
      {
        headerDisplay: 'Status',
        key: 'candidateStatus',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Jobs Search Result Configurations
  jobsPanelConfig: TableConfig = {
    title: SearchResultPanelTitle.JOBS,
    type: SearchType.Job,
    isLoading: true,
    displayedColumns: [
      'jobCode',
      'title',
      'jobRecruitmentStart',
      'jobStartDate',
      'status',
      'department',
      'subDepartment',
      'employmentType',
    ],
    columns: [
      {
        headerDisplay: 'Job Code',
        key: 'jobCode',
      },
      {
        headerDisplay: 'Title',
        key: 'title',
      },
      {
        headerDisplay: 'Recruitment Start Date',
        key: 'jobRecruitmentStart',
      },
      {
        headerDisplay: 'Job Start Date',
        key: 'jobStartDate',
      },
      {
        headerDisplay: 'Status',
        key: 'status',
      },
      {
        headerDisplay: 'Department',
        key: 'department',
      },
      {
        headerDisplay: 'Sub Department',
        key: 'subDepartment',
      },
      {
        headerDisplay: 'Type',
        key: 'employmentType',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  // Organizations Search Result Configurations
  organizationsPanelConfig: TableConfig = {
    title: SearchResultPanelTitle.ORGANIZATIONS,
    type: SearchType.Organization,
    isLoading: true,
    displayedColumns: ['name', 'domain', 'ein', 'status', 'noOfConsultants'],
    columns: [
      {
        headerDisplay: 'Name',
        key: 'name',
      },
      {
        headerDisplay: 'Domain',
        key: 'domain',
      },
      {
        headerDisplay: 'EIN',
        key: 'ein',
      },
      {
        headerDisplay: 'Status',
        key: 'status',
      },
      {
        headerDisplay: 'No. Of Consultants',
        key: 'noOfConsultants',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(
    private route: ActivatedRoute,
    private globalSearchApiService: GlobalSearchApiService
  ) { }

  ngOnInit(): void {
    const apiResult = this.globalSearchApiService.currentSearchResult;

    this.route.queryParams.subscribe(
      (params = { searchText: '', panelName: '' }) => {
        this.searchText = params.searchText;
        this.panelName = params.panelName;

        if (apiResult && apiResult.searchText === params.searchText) {
          this.searchResult = apiResult.searchResult;
          this.employeesResultParser(this.searchResult.EmployeeSearchList);
          this.candidatesResultParser(this.searchResult.CandidateSearchList);
          this.jobsResultParser(this.searchResult.JobSearchList);
          this.organizationsResultParser(
            this.searchResult.OrganizationSearchList
          );
        } else {
          this.globalSearchApiService.search(params.searchText).subscribe(
            (data) => {
              this.searchResult = data?.result;
              this.total = data?.result?.totalCount;
              this.employeesResultParser(data?.result.EmployeeSearchList);
              this.candidatesResultParser(data?.result.CandidateSearchList);
              this.jobsResultParser(data?.result.JobSearchList);
              this.organizationsResultParser(
                data?.result?.OrganizationSearchList
              );
            },
            (err) => {
              console.warn(err);
            }
          );
        }
      }
    );
  }

  // Employee List Parser
  employeesResultParser(empSearchResult: EmployeeSearchList): void {
    this.employeesPanelConfig.isLoading = false;
    this.employeesPanelConfig.totalRows = empSearchResult?.virtualCount;
    this.employeesPanelConfig.tableData = empSearchResult?.results?.map(
      (item, index) => {
        return {
          ...item,
          employeeName: item?.firstName + ' ' + item?.lastName,
          location:
            item?.city === null || item?.state === null
              ? '-'
              : item?.city + ', ' + item?.state,
        };
      }
    );
  }
  // Candidate List Parser
  candidatesResultParser(candidateSearchResult: CandidateSearchList): void {
    this.candidatesPanelConfig.isLoading = false;
    this.candidatesPanelConfig.totalRows = candidateSearchResult?.virtualCount;
    this.candidatesPanelConfig.tableData = candidateSearchResult?.results?.map(
      (item, index) => {
        return {
          ...item,
          candidateName: item?.firstName + ' ' + item?.lastName,
        };
      }
    );
  }
  // Job List Parser
  jobsResultParser(jobSearchResult: JobSearchList): void {
    this.jobsPanelConfig.isLoading = false;
    this.jobsPanelConfig.totalRows = jobSearchResult?.virtualCount;
    this.jobsPanelConfig.tableData = jobSearchResult?.results?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }
  // Organizations Search List Parser
  organizationsResultParser(
    organizationSearchResult: OrganizationSearchList
  ): void {
    this.organizationsPanelConfig.isLoading = false;
    this.organizationsPanelConfig.totalRows =
      organizationSearchResult?.virtualCount;
    this.organizationsPanelConfig.tableData = organizationSearchResult?.results?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  getNextRecords(event: CurrentPage): void {
    if (this.advancedFiltersLength > 0) {
      this.resourceValue = this.getResourceType(event.title);
      if (event.title === SearchResultPanelTitle.EMPLOYEES) {
        this.getEmpAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          this.resourceValue,
          this.name,
          event.pageIndex,
          this.phone,
          this.isAdvancedSearch,
          this.status,
          this.email
        );
      }
      if (event.title === SearchResultPanelTitle.CANDIDATES) {
        this.getCandAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          this.resourceValue,
          this.name,
          event.pageIndex,
          this.phone,
          this.isAdvancedSearch,
          this.status,
          this.email
        );
      }
      if (event.title === SearchResultPanelTitle.JOBS) {
        this.getJobAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          this.resourceValue,
          this.jobcode,
          event.pageIndex,
          this.jobtitle,
          this.isAdvancedSearch,
          this.status,
          this.department,
          this.jobstart
        );
      }
      if (event.title === SearchResultPanelTitle.ORGANIZATIONS) {
        this.getOrgAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          this.resourceValue,
          this.name,
          event.pageIndex,
          this.domain,
          this.isAdvancedSearch,
          this.status,
          this.ein
        );
      }
    } else {
      this.globalSearchApiService
        .search(this.searchText, event.pageIndex, event.pageSize)
        .subscribe(
          (data) => {
            switch (event.title) {
              case 'Employees':
                this.employeesResultParser(data?.result?.EmployeeSearchList);
                break;
              case 'Candidates':
                this.candidatesResultParser(data?.result?.CandidateSearchList);
                break;
              case 'Jobs':
                this.jobsResultParser(data?.result?.JobSearchList);
                break;
              case 'Organizations':
                this.organizationsResultParser(
                  data?.result?.OrganizationSearchList
                );
                break;
            }
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  sortData(event: CurrentPage): void {
    let resourceType = 0;
    let colName = '';
    switch (event.title.toLowerCase()) {
      case 'employees':
        {
          colName = this.parseSortColumnName(
            this.employeesPanelConfig,
            event.colName
          );
          resourceType = 1;
        }
        break;

      case 'candidates':
        {
          resourceType = 2;
          colName = this.parseSortColumnName(
            this.candidatesPanelConfig,
            event.colName
          );
        }
        break;

      case 'jobs':
        {
          resourceType = 3;
          colName = this.parseSortColumnName(
            this.jobsPanelConfig,
            event.colName
          );
        }
        break;

      case 'organizations':
        {
          resourceType = 4;
          colName = this.parseSortColumnName(
            this.organizationsPanelConfig,
            event.colName
          );
        }
        break;
    }

    if (this.advancedFiltersLength > 0) {
      if (event.title === SearchResultPanelTitle.EMPLOYEES) {
        this.getEmpAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          resourceType,
          this.name,
          event.pageIndex,
          this.phone,
          this.isAdvancedSearch,
          this.status,
          this.email
        );
      }
      if (event.title === SearchResultPanelTitle.CANDIDATES) {
        this.getCandAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          resourceType,
          this.name,
          event.pageIndex,
          this.phone,
          this.isAdvancedSearch,
          this.status,
          this.email
        );
      }
      if (event.title === SearchResultPanelTitle.JOBS) {
        this.getJobAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          resourceType,
          this.jobcode,
          event.pageIndex,
          this.jobtitle,
          this.isAdvancedSearch,
          this.status,
          this.department,
          this.jobstart
        );
      }
      if (event.title === SearchResultPanelTitle.ORGANIZATIONS) {
        this.getOrgAdvancedSearch(
          this.searchText,
          event.pageSize,
          this.isProfilePicRequired,
          resourceType,
          this.name,
          event.pageIndex,
          this.domain,
          this.isAdvancedSearch,
          this.status,
          this.ein
        );
      }
    } else {
      this.globalSearchApiService
        .search(this.searchText, event.pageIndex, event.pageSize, colName, event.sortDirection, resourceType)
        .subscribe(
          (data) => {
            switch (event.title) {
              case 'Employees':
                this.employeesResultParser(data?.result?.EmployeeSearchList);
                break;
              case 'Candidates':
                this.candidatesResultParser(data?.result?.CandidateSearchList);
                break;
              case 'Jobs':
                this.jobsResultParser(data?.result?.JobSearchList);
                break;
              case 'Organizations':
                this.organizationsResultParser(
                  data?.result?.OrganizationSearchList
                );
                break;
            }
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  parseSortColumnName(panelConfig: TableConfig, colName: string): string {
    let sortedColumn = '';
    if (colName === 'Employee Name' || colName === 'Candidate Name') {
      sortedColumn = 'fullname';
    } else if (colName === 'Recruitment Start Date') {
      sortedColumn = 'jobRecruitmentStart';
    } else if (colName === 'No. Of Consultants') {
      sortedColumn = 'noOfConsultants';
    } else {
      for (const value of panelConfig?.displayedColumns) {
        if (
          value.toLowerCase() === colName?.toLowerCase() ||
          value.toLowerCase() === colName?.replace(/\s/g, '').toLowerCase() ||
          value.toLowerCase().startsWith(colName?.toLowerCase()) ||
          value.toLowerCase().includes(colName?.toLowerCase()) ||
          colName
            ?.toLowerCase()
            .split(' ')
            .join()
            .replace(',', '')
            .startsWith(value.toLowerCase())
        ) {
          sortedColumn = value;
          break;
        }
      }
    }
    return sortedColumn;
  }

  getSelectedFilterValues(filterValues: FilterValues): void {
    this.advancedFiltersLength = filterValues?.advancedFilters?.length;
    this.resetFilterValues();
    this.resourceValue = this.getResourceType(filterValues?.title);
    this.filterValues = filterValues?.advancedFilters?.value;
    for (this.i = 0; this.i < this.filterValues?.length; this.i++) {
      this.filterValue = this.filterValues[this.i];
      if (this.filterValue?.startsWith('Na')) {
        this.name = this.filterValue?.substr(2);
      }
      if (this.filterValue?.startsWith('Em')) {
        this.email = this.filterValue?.substr(2);
      }
      if (this.filterValue?.startsWith('Ph')) {
        this.phone = this.filterValue?.substr(2);
      }
      if (this.filterValue?.startsWith('St')) {
        this.status = filterValues?.status;
      }
      if (this.filterValue?.startsWith('Jo')) {
        this.jobcode = this.filterValue?.substr(2);
      }
      if (this.filterValue?.startsWith('Jt')) {
        this.jobtitle = this.filterValue?.substr(2);
      }
      if (this.filterValue?.startsWith('De')) {
        this.department = filterValues?.department;
      }
      if (this.filterValue?.startsWith('Js')) {
        this.jobstart = this.filterValue?.substr(2);
        this.jobstart = this.changeDateFormat(this.jobstart);
      }
      if (this.filterValue?.startsWith('Do')) {
        this.domain = this.filterValue?.substr(2);
      }
      if (this.filterValue?.startsWith('Ei')) {
        this.ein = this.filterValue?.substr(2);
      }
    }
    if (filterValues.title === SearchResultPanelTitle.EMPLOYEES) {
      this.getEmpAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.name,
        this.pageNum,
        this.phone,
        this.isAdvancedSearch,
        this.status,
        this.email
      );
    }
    if (filterValues.title === SearchResultPanelTitle.CANDIDATES) {
      this.getCandAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.name,
        this.pageNum,
        this.phone,
        this.isAdvancedSearch,
        this.status,
        this.email
      );
    }
    if (filterValues.title === SearchResultPanelTitle.JOBS) {
      this.getJobAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.jobcode,
        this.pageNum,
        this.jobtitle,
        this.isAdvancedSearch,
        this.status,
        this.department,
        this.jobstart
      );
    }
    if (filterValues.title === SearchResultPanelTitle.ORGANIZATIONS) {
      this.getOrgAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.name,
        this.pageNum,
        this.domain,
        this.isAdvancedSearch,
        this.status,
        this.ein
      );
    }
  }


  getRemainingChipValues(chipsValues: FilterValues): void {
    this.advancedFiltersLength = chipsValues?.advancedFilters?.length;
    this.resourceValue = this.getResourceType(chipsValues.title);
    if (chipsValues?.advancedFilters?.length === 0) {
      this.resetFilterValues();
      this.name = this.searchText;
    } else {
      this.resetFilterValues();
      this.chipValues = chipsValues?.advancedFilters?.value;
      for (this.i = 0; this.i < this.chipValues?.length; this.i++) {
        this.chipValue = this.chipValues[this.i];
        if (this.chipValue?.startsWith('Na')) {
          this.name = this.chipValue?.substr(2);
        }
        if (this.chipValue?.startsWith('Em')) {
          this.email = this.chipValue?.substr(2);
        }
        if (this.chipValue?.startsWith('Ph')) {
          this.phone = this.chipValue?.substr(2);
        }
        if (this.chipValue?.startsWith('St')) {
          this.status = chipsValues?.status;
        }
        if (this.chipValue?.startsWith('Jo')) {
          this.jobcode = this.chipValue?.substr(2);
        }
        if (this.chipValue?.startsWith('Jt')) {
          this.jobtitle = this.chipValue?.substr(2);
        }
        if (this.chipValue?.startsWith('De')) {
          this.department = chipsValues?.department;
        }
        if (this.chipValue?.startsWith('Js')) {
          this.jobstart = this.chipValue?.substr(2);
          this.jobstart = this.changeDateFormat(this.jobstart);
        }
        if (this.chipValue?.startsWith('Do')) {
          this.domain = this.chipValue?.substr(2);
        }
        if (this.chipValue?.startsWith('Ei')) {
          this.ein = this.chipValue?.substr(2);
        }
      }
    }
    if (chipsValues.title === SearchResultPanelTitle.EMPLOYEES) {
      this.getEmpAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.name,
        this.pageNum,
        this.phone,
        this.isAdvancedSearch,
        this.status,
        this.email
      );
    }
    if (chipsValues.title === SearchResultPanelTitle.CANDIDATES) {
      this.getCandAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.name,
        this.pageNum,
        this.phone,
        this.isAdvancedSearch,
        this.status,
        this.email
      );
    }
    if (chipsValues.title === SearchResultPanelTitle.JOBS) {
      this.getJobAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.jobcode,
        this.pageNum,
        this.jobtitle,
        this.isAdvancedSearch,
        this.status,
        this.department,
        this.jobstart
      );
    }
    if (chipsValues.title === SearchResultPanelTitle.ORGANIZATIONS) {
      this.getOrgAdvancedSearch(
        this.searchText,
        this.pageSize,
        this.isProfilePicRequired,
        this.resourceValue,
        this.name,
        this.pageNum,
        this.domain,
        this.isAdvancedSearch,
        this.status,
        this.ein
      );
    }
  }

  changeDateFormat(inputDate: string): string {
    const splitDate = inputDate.split('/');
    const month = splitDate[0];
    const day = splitDate[1];
    const year = splitDate[2];
    return year + '-' + month + '-' + day;
  }

  getResourceType(title: string): number {
    switch (title) {
      case 'Employees':
        this.resourceValue = 1;
        break;
      case 'Candidates':
        this.resourceValue = 2;
        break;
      case 'Jobs':
        this.resourceValue = 3;
        break;
      case 'Organizations':
        this.resourceValue = 4;
        break;
    }
    return this.resourceValue;
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
  }

  getEmpAdvancedSearch(
    searchString: string,
    pageSize: number,
    isProfilePicRequired: boolean,
    resourceValue: number,
    name: string,
    pageNum: number,
    phone: string,
    isAdvancedSearch: boolean,
    status: number,
    email: string
  ): void {
    this.globalSearchApiService
      .empAdvancedSearch(searchString, pageSize, isProfilePicRequired, resourceValue, name, pageNum,
        phone, isAdvancedSearch, status, email)
      .subscribe((data) => {
        this.employeesResultParser(data?.result?.EmployeeSearchList);
      }, err => {
        console.log(err);
      });
  }

  getCandAdvancedSearch(
    searchString: string,
    pageSize: number,
    isProfilePicRequired: boolean,
    resourceValue: number,
    name: string,
    pageNum: number,
    phone: string,
    isAdvancedSearch: boolean,
    status: number,
    email: string
  ): void {
    this.globalSearchApiService
      .candAdvancedSearch(
        searchString,
        pageSize,
        isProfilePicRequired,
        resourceValue,
        name,
        pageNum,
        phone,
        isAdvancedSearch,
        status,
        email
      )
      .subscribe(
        (data) => {
          this.candidatesResultParser(data?.result?.CandidateSearchList);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getJobAdvancedSearch(
    searchString: string,
    pageSize: number,
    isProfilePicRequired: boolean,
    resourceValue: number,
    jobcode: string,
    pageIndex: number,
    jobtitle: string,
    isAdvancedSearch: boolean,
    status: number,
    department: string,
    jobstart: string
  ): void {
    this.globalSearchApiService
      .jobAdvancedSearch(
        searchString,
        pageSize,
        isProfilePicRequired,
        resourceValue,
        jobcode,
        pageIndex,
        jobtitle,
        isAdvancedSearch,
        status,
        department,
        jobstart
      )
      .subscribe(
        (data) => {
          this.jobsResultParser(data?.result?.JobSearchList);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  getOrgAdvancedSearch(
    searchString: string,
    pageSize: number,
    isProfilePicRequired: boolean,
    resourceValue: number,
    name: string,
    pageIndex: number,
    domain: string,
    isAdvancedSearch: boolean,
    status: number,
    ein: string
  ): void {
    this.globalSearchApiService
      .orgAdvancedSearch(
        searchString,
        pageSize,
        isProfilePicRequired,
        resourceValue,
        name,
        pageIndex,
        domain,
        isAdvancedSearch,
        status,
        ein
      )
      .subscribe(
        (data) => {
          this.organizationsResultParser(data?.result?.OrganizationSearchList);
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
