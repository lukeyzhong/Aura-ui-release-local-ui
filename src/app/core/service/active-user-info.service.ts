import { Injectable } from '@angular/core';
import { User } from '../model/auth.model';

@Injectable({
  providedIn: 'root',
})
export class ActiveUserInfoService {
  user!: User;
  constructor() {}

  setActiveUserInfo(user: User): void {
    this.user = user;
  }
  getActiveUserInfo(): User {
    return this.user;
  }
}
