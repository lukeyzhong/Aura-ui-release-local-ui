import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import {
  GlobalSearchResult,
  GlobalSearchResultResponse,
} from '../../interface/search.interface';
import { environment } from '../../../../environments/environment';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalSearchApiService {
  currentSearchResult!: {
    searchText: string;
    searchResult: GlobalSearchResult;
  };
  // tslint:disable-next-line: no-any
  private pathSubject = new Subject<any>();

  // tslint:disable-next-line: no-any
  sendPath(path: any): void {
    this.pathSubject.next({path});
  }
  // tslint:disable-next-line: no-any
  getPath(): Observable<any> {
    return this.pathSubject.asObservable();
  }

  constructor(private httpClient: HttpClient) {}

  search(
    searchString: string,
    pageNum: number = 1,
    pageSize: number = 10,
    sortcolumn: string = 'fullName',
    sortdirection: number = 1,
    resourceType: number = 0,
    isProfilePicRequired = true,
    isAdvancedSearch: boolean = false
  ): Observable<GlobalSearchResultResponse> {
    const httpParams = new HttpParams()
      .set('gsr.SearchString', searchString)
      .set('gsr.PageNum', pageNum.toString())
      .set('gsr.PageSize', pageSize.toString())
      .set('gsr.ResourceType', resourceType.toString())
      .set('gsr.Sortdirection', sortdirection.toString())
      .set('gsr.Sortcolumn', sortcolumn)
      .set('gsr.IsProfilePicRequired', isProfilePicRequired.toString())
      .set('gsr.IsAdvancedSearch', isAdvancedSearch.toString());

    const url = `${environment.apiBaseUrl}/globalsearch/GetGlobalSearch`;
    return this.httpClient
      .get<GlobalSearchResultResponse>(`${url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  empAdvancedSearch(
    searchString: string,
    pageSize: number = 10,
    isProfilePicRequired = true,
    resourceValue: number,
    name?: string,
    pageNum: number = 1,
    phone?: string,
    isAdvancedSearch = true,
    status?: number,
    email?: string
  ): Observable<GlobalSearchResultResponse> {
    let httpParams = new HttpParams()
      .set('gsr.SearchString', searchString)
      .set('gsr.PageSize', pageSize.toString())
      .set('gsr.IsProfilePicRequired', isProfilePicRequired.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.EmployeeSearchRequest.Name', name!)
      .set('gsr.PageNum', pageNum.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.EmployeeSearchRequest.Phone', phone!)
      .set('gsr.ResourceType', resourceValue.toString())
      .set('gsr.IsAdvancedSearch', isAdvancedSearch.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.EmployeeSearchRequest.Status', status!.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.EmployeeSearchRequest.Email', email!);

    httpParams = httpParams.delete('gsr.EmployeeSearchRequest.Status', '0');

    const url = `${environment.apiBaseUrl}/globalsearch/GetGlobalSearch`;
    return this.httpClient
      .get<GlobalSearchResultResponse>(`${url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  candAdvancedSearch(
    searchString: string,
    pageSize: number = 10,
    isProfilePicRequired = true,
    resourceValue: number,
    name?: string,
    pageNum: number = 1,
    phone?: string,
    isAdvancedSearch = true,
    status?: number,
    email?: string
  ): Observable<GlobalSearchResultResponse> {
    let httpParams = new HttpParams()
      .set('gsr.SearchString', searchString)
      // tslint:disable-next-line: align
      .set('gsr.PageSize', pageSize.toString())
      .set('gsr.IsProfilePicRequired', isProfilePicRequired.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.CandidateSearchRequest.Name', name!)
      .set('gsr.PageNum', pageNum.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.CandidateSearchRequest.Phone', phone!)
      .set('gsr.ResourceType', resourceValue.toString())
      .set('gsr.IsAdvancedSearch', isAdvancedSearch.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.CandidateSearchRequest.Status', status!.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.CandidateSearchRequest.Email', email!);

    httpParams = httpParams.delete('gsr.CandidateSearchRequest.Status', '0');

    const url = `${environment.apiBaseUrl}/globalsearch/GetGlobalSearch`;
    return this.httpClient
      .get<GlobalSearchResultResponse>(`${url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  jobAdvancedSearch(
    searchString: string,
    pageSize: number = 10,
    isProfilePicRequired = true,
    resourceValue: number,
    jobcode?: string,
    pageNum: number = 1,
    jobtitle?: string,
    isAdvancedSearch = true,
    status?: number,
    department?: string,
    jobstart?: string
  ): Observable<GlobalSearchResultResponse> {
    let httpParams = new HttpParams()
      .set('gsr.SearchString', searchString)
      // tslint:disable-next-line: align
      .set('gsr.PageSize', pageSize.toString())
      .set('gsr.IsProfilePicRequired', isProfilePicRequired.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.JobSearchRequest.JobCode', jobcode!)
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.JobSearchRequest.Title', jobtitle!)
      .set('gsr.PageNum', pageNum.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.JobSearchRequest.DepartmentId', department!)
      .set('gsr.ResourceType', resourceValue.toString())
      .set('gsr.IsAdvancedSearch', isAdvancedSearch.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.JobSearchRequest.Status', status!.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.JobSearchRequest.JobStartDate', jobstart!);

    httpParams = httpParams.delete('gsr.JobSearchRequest.Status', '0');
    httpParams = httpParams.delete('gsr.JobSearchRequest.DepartmentId', '');

    const url = `${environment.apiBaseUrl}/globalsearch/GetGlobalSearch`;
    return this.httpClient
      .get<GlobalSearchResultResponse>(`${url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  orgAdvancedSearch(
    searchString: string,
    pageSize: number = 10,
    isProfilePicRequired = true,
    resourceValue: number,
    name?: string,
    pageNum: number = 1,
    domain?: string,
    isAdvancedSearch = true,
    status?: number,
    ein?: string
  ): Observable<GlobalSearchResultResponse> {
    let httpParams = new HttpParams()
      .set('gsr.SearchString', searchString)
      // tslint:disable-next-line: align
      .set('gsr.PageSize', pageSize.toString())
      .set('gsr.IsProfilePicRequired', isProfilePicRequired.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.OrganizationSearchRequest.Name', name!)
      .set('gsr.PageNum', pageNum.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.OrganizationSearchRequest.Domain', domain!)
      .set('gsr.ResourceType', resourceValue.toString())
      .set('gsr.IsAdvancedSearch', isAdvancedSearch.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.OrganizationSearchRequest.Status', status!.toString())
      // tslint:disable-next-line: no-non-null-assertion
      .set('gsr.OrganizationSearchRequest.EIN', ein!);

    httpParams = httpParams.delete('gsr.OrganizationSearchRequest.Status', '0');

    const url = `${environment.apiBaseUrl}/globalsearch/GetGlobalSearch`;
    return this.httpClient
      .get<GlobalSearchResultResponse>(`${url}`, { params: httpParams })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: typedef
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
