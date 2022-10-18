import { Component, OnInit } from '@angular/core';
import { User } from '../../../../core/model/auth.model';
import { ActiveUserInfoService } from '../../../../core/service/active-user-info.service';
import {
  DashboardAssignmentsResult,
  DashboardProfileInfoResult,
} from '../../../../shared/interface/generic-dashboard.interface';
import { CandidateDashboardService } from '../../../../candidate/service/dashboard/candidate-dashboard.service';
import {
  ComponentLevelPermissionsResult,
  EmployeeDashboard,
  EmployeeDashboardComponents,
} from '../../../../shared/interface/component-level-permissions.interface';
import { ComponentLevelPermissionsService } from '../../../../shared/service/permissions/component-level-permissions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  infoType = 'Employee';
  dashboardAssignmentsResult!: DashboardAssignmentsResult[];
  assigneeId = '';
  user!: User;
  dashboardProfileInfoResult!: DashboardProfileInfoResult;
  onboardingId!: string;

  isLoadingTasks = false;
  isLoadingPI = false;
  jobTitle!: string;

  lastLogin!: string;
  firstName!: string;
  employeeId!: string;
  roleCode = '';

  menuId = '';
  componentLevelPermissionsResult!: ComponentLevelPermissionsResult[];

  constructor(
    private candidateDashboardService: CandidateDashboardService,
    private activeUserInfo: ActiveUserInfoService,
    private componentLevelPermissionsService: ComponentLevelPermissionsService
  ) {
    if (this.activeUserInfo.getActiveUserInfo()) {
      this.user = this.activeUserInfo.getActiveUserInfo();
      this.roleCode = this.user?.rolecode;
      this.firstName = this.user.fullName.split(' ')[0];
      this.assigneeId = this.user.userId;
    }
  }

  ngOnInit(): void {
    if (String(localStorage.getItem('lastLogin')) !== undefined) {
      const lastLoginDate =
        new Date(Date.parse(String(localStorage.getItem('lastLogin')))) +
        ' UTC';
      this.lastLogin = String(new Date(lastLoginDate));
    }
    this.setBasicInfo();
    this.setCandidateAssignments();
    this.setPermissionsByMenuId(EmployeeDashboard.Me);
  }

  setBasicInfo(): void {
    this.isLoadingPI = true;
    this.candidateDashboardService
      .getBasicInfoByUserId(this.infoType, this.user.userId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.dashboardProfileInfoResult = data?.result;
            this.employeeId = this.dashboardProfileInfoResult?.employeeId;
            localStorage.id = this.employeeId;
            this.jobTitle = this.dashboardProfileInfoResult?.jobTitle;
          }
          this.isLoadingPI = false;
        },
        (err) => {
          console.warn(err);
          this.isLoadingPI = false;
        }
      );
  }

  setCandidateAssignments(): void {
    this.isLoadingTasks = true;
    this.candidateDashboardService
      .getCandidateAssignmentsByAssigneeId(this.assigneeId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.dashboardAssignmentsResult = data?.result;
            this.dashboardAssignmentsResult =
              this.dashboardAssignmentsResult.filter(
                (assignee) =>
                  assignee.assignmentStatusCode === 1 ||
                  assignee.assignmentStatusCode === 2
              );
          }
          this.isLoadingTasks = false;
        },
        (err) => {
          console.warn(err);
          this.isLoadingTasks = false;
        }
      );
  }

  setPermissionsByMenuId(menuId: string): void {
    this.componentLevelPermissionsService
      .getComponentLevelPermissionsByMenuId(menuId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.componentLevelPermissionsResult = data?.result;
          }
        },
        (err) => {
          console.log(err);
        }
      );
  }

  isVisible(code: string): boolean {
    return (
      this.componentLevelPermissionsResult &&
      this.componentLevelPermissionsResult?.some(
        (comPerm) => comPerm?.code === code
      )
    );
  }

  // tslint:disable-next-line: no-any
  public get EmployeeDashboardComponents(): any {
    return EmployeeDashboardComponents;
  }
}
