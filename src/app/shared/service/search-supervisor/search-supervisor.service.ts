import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SearchSupervisorResponse } from '../../interface/search-supervisor.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchSupervisorService {
  url!: string;
  constructor(private httpClient: HttpClient) { }


  search(searchString: string): Observable<SearchSupervisorResponse> {
    const httpParams = new HttpParams()
      .set('searchString', searchString);
    this.url = `${environment.apiBaseUrl}/user/SearchSupervisors`;
    return this.httpClient.get<SearchSupervisorResponse>(`${this.url}`, { params: httpParams })
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
