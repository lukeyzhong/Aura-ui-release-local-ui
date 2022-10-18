import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { ComponentLevelPermissionsResponse } from '../../interface/component-level-permissions.interface';

@Injectable({
  providedIn: 'root',
})
export class ComponentLevelPermissionsService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) {}

  getComponentLevelPermissionsByMenuId(
    menuId: string
  ): Observable<ComponentLevelPermissionsResponse> {
    const url = `${environment.apiBaseUrl}/UserPermission/components?menuId=${menuId}`;

    return this.httpClient
      .get<ComponentLevelPermissionsResponse>(`${url}`)
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
