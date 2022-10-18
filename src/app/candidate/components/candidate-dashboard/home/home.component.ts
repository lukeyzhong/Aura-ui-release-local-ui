import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActiveUserInfoService } from '../../../../core/service/active-user-info.service';
import { User } from '../../../../core/model/auth.model';
import { CandidateDashboardService } from '../../../service/dashboard/candidate-dashboard.service';
import {
  DashboardAssignmentsResult,
  DashboardProfileInfoResult,
} from '../../../../shared/interface/generic-dashboard.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  dashboardAssignmentsResult!: DashboardAssignmentsResult[];
  assigneeId = '';
  user!: User;
  dashboardProfileInfoResult!: DashboardProfileInfoResult;
  onboardingId!: string;
  jobTitle!: string;
  infoType = 'Candidate';

  constructor(
    private router: Router,
    private candidateDashboardService: CandidateDashboardService,
    private activeUserInfo: ActiveUserInfoService
  ) {
    this.user = this.activeUserInfo.getActiveUserInfo();
    this.assigneeId = this.user.userId;
  }

  ngOnInit(): void {
    this.setBasicInfo();
    this.setCandidateAssignments();
  }
  setBasicInfo(): void {
    this.candidateDashboardService
      .getBasicInfoByUserId(this.infoType, this.user.userId)
      .subscribe(
        (data) => {
          this.dashboardProfileInfoResult = data?.result;
          this.jobTitle = this.dashboardProfileInfoResult?.jobTitle;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setCandidateAssignments(): void {
    this.candidateDashboardService
      .getCandidateAssignmentsByAssigneeId(this.assigneeId)
      .subscribe(
        (data) => {
          this.dashboardAssignmentsResult = data?.result;
          this.dashboardAssignmentsResult =
            this.dashboardAssignmentsResult.filter(
              (assignee) =>
                assignee.assignmentTypeCode === 26 &&
                assignee.resourceTypeCode === 39 &&
                (assignee.assignmentStatusCode === 1 ||
                  assignee.assignmentStatusCode === 2)
            );
          this.onboardingId = this.dashboardAssignmentsResult[0]?.resourceValue;
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  goToOnboarding(): void {
    this.router.navigate([
      '/candidate/dashboard/offer-letter',
      this.onboardingId,
      this.jobTitle,
    ]);
  }
}
