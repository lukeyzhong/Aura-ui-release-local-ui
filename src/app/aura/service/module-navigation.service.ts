import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavLinkNode } from 'antra-ui';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import {
  GlobalModuleResultResponse,
  GlobalSubModuleResult,
} from '../interface/module-navigation.interface';

@Injectable({
  providedIn: 'root',
})
export class ModuleNavigationService {
  baseUrl = environment.apiBaseUrl;
  errorData: {} | undefined;

  sideNavConfig: NavLinkNode[] = [
    {
      name: 'Me',
      icon: 'Me',
      useSvgIcon: true,
      url: '/aura/home/me',
    },
  ];

  constructor(private httpClient: HttpClient) {}

  // =================== Reset SideNavConfig Object ===================
  resetSideNavConfig(): NavLinkNode[] {
    this.sideNavConfig = [
      {
        name: 'Me',
        icon: 'Me',
        useSvgIcon: true,
        url: '/aura/home/me',
      },
    ];
    return this.sideNavConfig;
  }

  // =================== GLOBAL MODULE NAVIGATION MENU BEGIN ===================
  // tslint:disable-next-line: no-any
  getModules(): Observable<any> {
    return this.httpClient
      .get<GlobalModuleResultResponse>(`${this.baseUrl}/Module/UserModules`)
      .pipe(retry(1), catchError(this.handleError));
  }
  // =================== GLOBAL MODULE NAVIGATION MENU END ===================

  // =================== LEFT NAVIGATION MENU BEGIN ===================
  loadMenuItems(globalSubModuleResult: GlobalSubModuleResult[]): NavLinkNode[] {
    const sideNavMenuItems: NavLinkNode[] = [];
    let menuItem: NavLinkNode;
    for (const subModuleResult of globalSubModuleResult) {
      if (subModuleResult.menuItems.length > 0) {
        menuItem = {
          name: subModuleResult.displayValue,
          icon: subModuleResult.displayValue,
          url: subModuleResult.url,
          useSvgIcon: true,
          children: this.getChildrenMenuItems(subModuleResult),
        };
      } else {
        menuItem = {
          name: subModuleResult.displayValue,
          icon: subModuleResult.displayValue,
          url: subModuleResult.url,
          useSvgIcon: true,
        };
      }
      sideNavMenuItems.push(menuItem);
    }
    this.sideNavConfig = sideNavMenuItems;
    return this.sideNavConfig;
  }

  // loading sub menu items
  getChildrenMenuItems(subModuleResult: GlobalSubModuleResult): NavLinkNode[] {
    const menuList = [];
    for (const grandChildMenu of subModuleResult.menuItems) {
      const grandChild: NavLinkNode = {
        name: grandChildMenu.displayValue,
        url: grandChildMenu.url,
      };
      menuList.push(grandChild);
    }
    return menuList;
  }
  // =================== LEFT NAVIGATION MENU END ===================

  // =================== ERROR HANDLER BEGIN ===================
  // tslint:disable-next-line: typedef
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }

    this.errorData = {
      errorTitle: 'Oops! Request has failed',
      errorDesc: 'Something bad happened. Please try again later.',
    };
    return throwError(this.errorData);
  }
  // =================== ERROR HANDLER END ===================
}
