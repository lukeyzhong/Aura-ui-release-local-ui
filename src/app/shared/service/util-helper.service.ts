import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilHelperService {

  constructor() { }

  // tslint:disable-next-line: no-any
  roleMatch(roles1: any, roles2: any): any {
    // tslint:disable-next-line: no-any
    return roles1.some((role: any) => {
      return roles2.includes(role);
    });
  }
}
