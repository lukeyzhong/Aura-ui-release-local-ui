import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../../../core/model/auth.model';
import { AuthService } from '../../../core/service/auth.service';
import { ActiveUserInfoService } from '../../../core/service/active-user-info.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-dashboard',
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.scss'],
})
export class CandidateDashboardComponent implements OnInit {
  user!: User;

  private subs: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private activeUserInfo: ActiveUserInfoService,
    private router: Router
  ) {
    this.user = this.authService.user as User;
    this.subs.push(
      this.authService.user$.subscribe((user) => {
        if (user) {
          this.user = user;
          this.activeUserInfo.setActiveUserInfo(this.user);
        }
      })
    );
  }

  ngOnInit(): void {}

  logOut(): void {
    this.subs.push(
      this.authService
        .logOutFromDB(localStorage.getItem('jwt_token') as string)
        .subscribe(
          (res) => {
            if (res.errorCode === 0) {
              this.authService.logOut();
            }
          },
          (error) => {
            this.authService.logOut();
          }
        )
    );
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }
}
