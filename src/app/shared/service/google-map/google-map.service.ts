import {
  HttpParams,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GoogleMapKeyResponse } from '../../../shared/interface/google-map.interface';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  // =================== GOOGLE MAP KEY BEGIN ===================
  getGoogleMapKey(): Observable<GoogleMapKeyResponse> {
    const url = `${this.baseUrl}/MasterControls/GoogleMapKey`;
    return this.httpClient
      .get<GoogleMapKeyResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }
  // =================== GOOGLE MAP KEY END ===================

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
