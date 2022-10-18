import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FetchType,
  ProjectOnboardingResults,
} from '../../../interface/dashboard/project-onboarding.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { ProjectOnboardingDialogComponent } from './project-onboarding-dialog/project-onboarding-dialog.component';

@Component({
  selector: 'app-project-onboarding',
  templateUrl: './project-onboarding.component.html',
  styleUrls: ['./project-onboarding.component.scss'],
})
export class ProjectOnboardingComponent implements OnInit {
  isLoading = false;
  // GET PROJECT ONBOARDING RESULT
  projectOnBoardingResults!: ProjectOnboardingResults[];

  constructor(
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setProjectOnboarding();
  }

  setProjectOnboarding(): void {
    this.isLoading = true;
    this.hrDashboardService
      .getProjectOnboarding(FetchType.LatestThree)
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.projectOnBoardingResults = data?.result.results;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  openProjOnboardingDialog(): void {
    this.hrDashboardService
      .getProjectOnboarding(FetchType.Pagination)
      .subscribe(
        (data) => {
          const projectOnBoardingResults = data?.result.results;
          const virtualCount = data?.result.virtualCount;

          const dialogConfig = new MatDialogConfig();
          const obj = {
            projOnboardingData: projectOnBoardingResults,
            virtualCount,
          };
          dialogConfig.disableClose = true;
          dialogConfig.autoFocus = false;

          dialogConfig.data = {
            obj,
          };
          this.dialogRef = this.dialog.open(
            ProjectOnboardingDialogComponent,
            dialogConfig
          );
          this.dialogRef.afterClosed().subscribe((result: string) => {
            if (result === 'success') {
              this.setProjectOnboarding();
            }
          });
        },
        (err) => {
          console.warn(err);
        }
      );
  }
}
