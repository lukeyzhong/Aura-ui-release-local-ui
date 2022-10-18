import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { GlobalSearchApiService } from '../../service/search/global-search-api.service';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Observable, Subscription } from 'rxjs';
import {
  CandidatePopOverDetails,
  CandidateSearchList,
  EmployeePopOverDetails,
  EmployeeSearchList,
  GlobalSearchResult,
  GlobalSearchResultResponse,
  JobPopOverDetails,
  JobSearchList,
  OrganizationPopOverDetails,
  OrganizationSearchList,
} from '../../interface/search.interface';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MatAutocompleteTrigger,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.scss'],
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  @ViewChild(MatAutocompleteTrigger, { static: true })
  autocomplete!: MatAutocompleteTrigger;
  searchCtrl = new FormControl();
  searchSubject = new Subject();

  // For No Results
  noResults = true;

  // tslint:disable-next-line: no-any
  search$!: Observable<any>;
  searchSub!: Subscription;
  searchResult: GlobalSearchResultResponse;
  result: GlobalSearchResult;

  isLoading = false;

  filterByAll = true;
  filterByEmployees = false;
  filterByOrganizations = false;
  filterByJobs = false;
  filterByCandidates = false;

  validationMsg!: boolean;
  errorMsg!: string;
  noDataFound = true;

  saveAll: boolean | undefined;
  saveEmployee: boolean | undefined;
  saveCandidates: boolean | undefined;
  saveJobs: boolean | undefined;
  saveOrganizations: boolean | undefined;

  EmployeeSearchList: EmployeeSearchList;
  CandidateSearchList: CandidateSearchList;
  JobSearchList: JobSearchList;
  OrganizationSearchList: OrganizationSearchList;

  email = '';
  reportingTo = '';
  phone = '';
  department = '';
  aliasName = '';
  noOfPositions = 0;
  jobStartDate = '';
  noOfConsultants = 0;
  ein = '';

  constructor(
    private globalSearchApiService: GlobalSearchApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.EmployeeSearchList = {
      results: [],
      virtualCount: 0,
    };

    this.CandidateSearchList = {
      results: [],
      virtualCount: 0,
    };

    this.JobSearchList = {
      results: [],
      virtualCount: 0,
    };

    this.OrganizationSearchList = {
      results: [],
      virtualCount: 0,
    };

    this.result = {
      totalCount: 0,
      EmployeeSearchList: this.EmployeeSearchList,
      CandidateSearchList: this.CandidateSearchList,
      JobSearchList: this.JobSearchList,
      OrganizationSearchList: this.OrganizationSearchList,
    };

    this.searchResult = {
      errorCode: 0,
      errorMessage: '',
      result: this.result,
    };
  }

  ngOnInit(): void {
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(500), // debounce 500 ms
        distinctUntilChanged((v1, v2) => {
          return v1 === v2;
        })
      )
      // subscribe() will be triggered on keyup event of global search box
      // tslint:disable-next-line: deprecation
      .subscribe((searchText) => {
        if ((searchText as string).length >= 2) {
          this.isLoading = true;

          // tslint:disable-next-line: deprecation
          this.globalSearchApiService
            .search(searchText as string, 1, 10)
            .subscribe(
              (data) => {
                if (
                  searchText === '' ||
                  (data?.result?.totalCount === 0 && searchText !== '')
                ) {
                  this.noDataFound = false;
                  this.noResults = false;
                } else {
                  this.noDataFound = true;
                  this.noResults = true;
                }
                this.searchResult = data;
                this.resetFilter(this.noDataFound);
                this.isLoading = false;

                if (this.filterByAll === true) {
                  this.filterByEmployees = false;
                  this.filterByCandidates = false;
                  this.filterByJobs = false;
                  this.filterByOrganizations = false;
                }
              },
              (err) => {
                this.errorMsg =
                  'There is some problem with the service. Please try again later';
                this.isLoading = false;
              }
            );
        }
      });

    // tslint:disable-next-line: no-any
    this.route.queryParamMap.subscribe((paramsAsMap: any) => {
      if (paramsAsMap.params && paramsAsMap.params.searchText) {
        this.searchCtrl.setValue(paramsAsMap.params.searchText);
        this.globalSearchApiService
          .search(this.searchCtrl.value, 1, 10)
          .subscribe(
            (data) => {
              if (
                this.searchCtrl.value === '' ||
                (data?.result?.totalCount === 0 && this.searchCtrl.value !== '')
              ) {
                this.noDataFound = false;
                this.noResults = false;
              } else {
                this.noDataFound = true;
                this.noResults = true;
              }
              this.searchResult = data;
              this.resetFilter(this.noDataFound);
              this.isLoading = false;

              if (this.filterByAll === true) {
                this.filterByEmployees = false;
                this.filterByCandidates = false;
                this.filterByJobs = false;
                this.filterByOrganizations = false;
              }
            },
            (err) => {
              this.errorMsg =
                'There is some problem with the service. Please try again later';
              this.isLoading = false;
            }
          );
      } else {
        this.searchCtrl.setValue('');
      }
    });
  }

  setEmpDetails(employee: EmployeePopOverDetails): void {
    this.email = employee?.email;
    this.phone = employee?.phone;
    this.reportingTo = employee?.reportingTo;
    this.department = employee?.department;
  }

  setCandidateDetails(candidate: CandidatePopOverDetails): void {
    this.email = candidate?.email;
    this.phone = candidate?.phone;
    this.aliasName = candidate?.aliasName;
  }

  setJobDetails(job: JobPopOverDetails): void {
    this.noOfPositions = job?.noOfPositions;
    this.jobStartDate = job?.jobStartDate;
  }

  setOrganizationDetails(organization: OrganizationPopOverDetails): void {
    this.noOfConsultants = organization?.noOfConsultants;
    this.ein = organization?.ein;
  }

  // tslint:disable-next-line: typedef
  getTotalResultCount() {
    if (this.searchResult) {
      if (this.searchCtrl?.value === '') {
        this.searchResult.result.totalCount = 0;
      }

      return this.searchResult?.result?.totalCount?.toString();
    } else {
      return 0;
    }
  }

  // on pressing enter key in global search box
  redirectToViewAllResults(): void {
    const searchText = this.searchCtrl?.value;
    if (searchText === '') {
      this.router.navigate(['/aura/search']);
    } else {
      this.router.navigate(['/aura/search'], { queryParams: { searchText } });
    }
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    const value = event?.option?.value;
    const path = ['/aura/search'];
    let id;
    let searchText;

    if (value && value?.id && value?.candidateCode) {
      path.push('candidate');
      id = value.id;
      searchText = value?.firstName + ' ' + value?.lastName;
    } else if (value && value?.id) {
      path.push('employee');
      id = value.id;
      searchText = value?.firstName + ' ' + value?.lastName;
    }

    const searchURLPart = `SEARCH/${searchText}`;
    localStorage.setItem('path', searchURLPart);
    this.globalSearchApiService?.sendPath(searchURLPart);

    this.router.navigate(path, {
      queryParams: { id, searchText },
    });
  }

  // tslint:disable-next-line: no-any
  displayWith(value: any): any {
    if (value && value?.id) {
      return value?.firstName + ' ' + value?.lastName;
    }

    return value;
  }

  search(): void {
    this.searchSubject.next(this.searchCtrl.value);
  }

  viewAllResults(): void {
    this.autocomplete.closePanel();
    this.navigateToSearchResultAll();
  }

  navigateToSearchResultAll(): void {
    this.router.navigate(['/aura/search'], {
      queryParams: { searchText: this.searchCtrl.value },
    });
  }

  filter(e: { value: string }): void {
    switch (e.value) {
      case 'All':
        this.filterByAll = !this.filterByAll;
        if (this.filterByAll === false) {
          this.filterByEmployees = true;
          this.filterByCandidates = true;
          this.filterByJobs = true;
          this.filterByOrganizations = true;
        } else {
          this.filterByEmployees = false;
          this.filterByCandidates = false;
          this.filterByJobs = false;
          this.filterByOrganizations = false;
        }
        break;
      case 'Employees':
        this.filterByEmployees = !this.filterByEmployees;
        if (this.filterByEmployees === true) {
          this.filterByAll = false;
        }
        break;
      case 'Candidates':
        this.filterByCandidates = !this.filterByCandidates;
        if (this.filterByCandidates === true) {
          this.filterByAll = false;
        }
        break;
      case 'Jobs':
        this.filterByJobs = !this.filterByJobs;
        if (this.filterByJobs === true) {
          this.filterByAll = false;
        }
        break;
      case 'Organizations':
        this.filterByOrganizations = !this.filterByOrganizations;
        if (this.filterByOrganizations === true) {
          this.filterByAll = false;
        }
        break;
    }

    if (
      this.filterByEmployees === false &&
      this.filterByCandidates === false &&
      this.filterByJobs === false &&
      this.filterByOrganizations === false
    ) {
      this.filterByAll = true;
    }
    this.saveAll = this.filterByAll;
    this.saveEmployee = this.filterByEmployees;
    this.saveCandidates = this.filterByCandidates;
    this.saveJobs = this.filterByJobs;
    this.saveOrganizations = this.filterByOrganizations;
  }

  resetFilter(status: boolean): void {
    if (!status) {
      this.filterByAll = status;
      this.filterByEmployees = status;
      this.filterByCandidates = status;
      this.filterByJobs = status;
      this.filterByOrganizations = status;
    } else {
      this.filterByAll =
        !this.saveAll && this.saveAll !== undefined ? this.saveAll : status;

      this.filterByEmployees =
        !this.saveEmployee && this.saveEmployee !== undefined
          ? this.saveEmployee
          : status;
      this.filterByCandidates =
        !this.saveCandidates && this.saveCandidates !== undefined
          ? this.saveCandidates
          : status;
      this.filterByJobs =
        !this.saveJobs && this.saveJobs !== undefined ? this.saveJobs : status;
      this.filterByOrganizations =
        !this.saveOrganizations && this.saveOrganizations !== undefined
          ? this.saveOrganizations
          : status;
    }
  }

  navigateToSearchResultPanel(panelName: string): void {
    this.router.navigate(['/aura/search'], {
      queryParams: { searchText: this.searchCtrl.value, panelName },
    });
    this.autocomplete.closePanel();
  }
  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
    }
  }
}
