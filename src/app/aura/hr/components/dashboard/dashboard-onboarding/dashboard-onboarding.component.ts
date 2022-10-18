import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { DashboardOnboardingResults } from '../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { OnBoardingStatusComponent } from './on-boarding-status/on-boarding-status.component';
import { OnboardingDetailsComponent } from './onboarding-details/onboarding-details.component';

@Component({
  selector: 'app-dashboard-onboarding',
  templateUrl: './dashboard-onboarding.component.html',
  styleUrls: ['./dashboard-onboarding.component.scss'],
})
export class DashboardOnboardingComponent implements OnInit {
  onboardingResults!: DashboardOnboardingResults[];
  isLoadSpinner = false;
  fetchType = 2;
  searchTerm = '';
  searchText = '';
  // tslint:disable-next-line: no-any
  onboardingCounts: any = [];
  mapStatus = new Map<number, string>();
  mapCardStatus = new Map<string, string>();
  mapRejectionReasons = new Map<number, string>();
  onHoldStatus = 'New';
  cId = '';
  notificationMessage = '';
  snackBarNotification = false;
  index = 0;
  listSize!: number;
  // tslint:disable-next-line: no-any
  onboardingStatuses: any = [];
  // tslint:disable-next-line: no-any
  onboardStatus: any = [];
  isListsBackward = true;
  isListsForward = true;
  onboardingCountsMap = new Map<string, number>();
  cardStatusValue!: number;

  constructor(
    private router: Router,
    private hrDashboardService: HrDashboardService,
    private dialog: MatDialog,
    private lookupCodeService: LookupService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.getDashboardOnboardingData();
    this.getCandidateStatusCodes();
    this.getOnboardingsCounts(this.searchText);
    this.setRejectionReasonsCodes();
  }

  setRejectionReasonsCodes(): void {
    this.lookupCodeService.getRejectionOfferReasonsCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapRejectionReasons.set(country?.lookupCode, country?.description);
      }
    });
  }

  getCandidateStatusCodes(): void {
    this.lookupCodeService.getCandidateStatusCode().subscribe((data) => {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < data?.result?.length; i++) {
        this.mapStatus.set(data?.result[i].lookupCode, data?.result[i].name);
      }
    });
  }

  getOnboardingsCounts(searchText: string): void {
    this.hrDashboardService
      .getOnboardingsCount(searchText)
      .subscribe((data) => {
        this.onboardingCounts = data?.result;
        if (this.onboardingCounts) {
          this.onboardingStatuses = [];
          this.onboardingCountsMap = new Map(
            Object.entries(this.onboardingCounts)
          );

          for (const [key, value] of this.onboardingCountsMap?.entries()) {
            if (key === '1') {
              this.onboardingStatuses?.push({
                status: 'New',
                code: key,
                count: value,
                class: 'statusnew',
                icon: 'new',
              });
            } else if (key === '5') {
              this.onboardingStatuses?.push({
                status: 'In Progress',
                code: key,
                count: value,
                class: 'in-progress',
                icon: 'in progress',
              });
            } else if (key === '6') {
              this.onboardingStatuses?.push({
                status: 'HR Verify',
                code: key,
                count: value,
                class: 'hr-verify',
                icon: 'verify',
              });
            } else if (key === '10') {
              this.onboardingStatuses?.push({
                status: 'HR Verify Failed',
                code: key,
                count: value,
                class: 'verification-failed',
                icon: 'Verification failed',
              });
            } else if (key === '3') {
              this.onboardingStatuses?.push({
                status: 'Offer Declined',
                code: key,
                count: value,
                class: 'offer-declined',
                icon: 'offer declined',
              });
            } else if (key === '8') {
              this.onboardingStatuses?.push({
                status: 'On Hold',
                code: key,
                count: value,
                class: 'onhold',
                icon: 'on hold',
              });
            } else if (key === '11') {
              this.onboardingStatuses?.push({
                status: 'Registration Failed',
                code: key,
                count: value,
                class: 'integration-failed',
                icon: 'registration failed',
              });
            } else if (key === '12') {
              this.onboardingStatuses?.push({
                status: 'Declined T&C',
                code: key,
                count: value,
                class: 'rollback-offer',
                icon: 'Declined T&C',
              });
            }
            // else if (key === '7') {
            //   this.onboardingStatuses?.push({
            //     status: 'Onboarding Completed',
            //     code: key,
            //     count: value,
            //     class: 'onboarding-completed',
            //     icon: 'Onboarding completed',
            //   });
            // }
            // else if (key === '9') {
            //   this.onboardingStatuses?.push({
            //     status: 'RollBack Offer',
            //     code: key,
            //     count: value,
            //     class: 'rollback-offer',
            //     icon: 'roll back offer',
            //   });
            // }
            // else if (key === '4') {
            //   this.onboardingStatuses?.push({
            //     status: 'Integration Failed',
            //     code: key,
            //     count: value,
            //     class: 'integration-failed',
            //     icon: 'integration failed',
            //   });
            // }
          }
          this.index = 0;
          this.listSize = 8;
          this.onboardStatus = this.onboardingStatuses?.slice(
            this.index,
            this.listSize
          );
        }
      });
    // this.isListsBackward = false;
    // if (this.onboardingStatuses.length <= 8) {
    //   this.isListsForward = true;
    // }
  }

  getDashboardOnboardingData(): void {
    this.isLoadSpinner = true;
    this.hrDashboardService
      .getHRDashboardOnboardingData(this.searchTerm)
      .subscribe(
        (data) => {
          this.onboardingResults = data?.result?.results;
          this.isLoadSpinner = false;
        },
        (err) => {
          this.isLoadSpinner = false;
          console.warn(err);
        }
      );
  }

  getComment(comments: string): string {
    const commentsObj = JSON.parse(comments);
    return commentsObj.Comment;
  }

  onboadingDetails(type: string): void {
    const dialogConfig = new MatDialogConfig();
    // tslint:disable-next-line: no-any
    const obj: any = {
      onboardingCounts: this.onboardingCounts,
      mapStatus: this.mapStatus,
      disable: false,
      expend: false,
      cardType: type
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '70%';
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(OnboardingDetailsComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result === 'cancel') {
          this.getOnboardingsCounts(this.searchText);
          this.isListsBackward = false;
        }
      }
    });
  }

  openOnboardingStatusDialog(
    onboardCand: DashboardOnboardingResults,
    statusType: string,
    actionType: string = 'Add'
  ): void {
    const dialogConfig = new MatDialogConfig();
    // tslint:disable-next-line: no-any
    const obj: any = {
      onboardCand,
      action: actionType,
      statusType,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '70%';
    dialogConfig.data = {
      obj,
    };

    if (statusType === 'Delete') {
      this.dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
      });
      this.dialogRef.componentInstance.confirmMessage =
        'Are you sure, you want to delete?';
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef = this.dialog.open(
            OnBoardingStatusComponent,
            dialogConfig
          );
          this.dialogRef.afterClosed().subscribe((res) => {
            if (res.status === 'success') {
              this.notificationMessage = res.data;
              this.snackBarNotification = true;
              setTimeout(() => {
                this.snackBarNotification = false;
              }, 5000);
              this.getDashboardOnboardingData();
            }
          });
        }
      });
    } else {
      this.dialogRef = this.dialog.open(
        OnBoardingStatusComponent,
        dialogConfig
      );
      this.dialogRef.afterClosed().subscribe((res) => {
        if (res.status === 'success') {
          this.notificationMessage = res.data;
          this.snackBarNotification = true;
          setTimeout(() => {
            this.snackBarNotification = false;
          }, 5000);
          this.getDashboardOnboardingData();
        }
      });
    }
  }

  performSearch(search: string): void {
    this.searchTerm = search;
    this.getDashboardOnboardingData();
  }

  redirectToSendInvite(onboardResult: DashboardOnboardingResults): void {
    this.router.navigate(['/aura/hr/on-boarding'], {
      queryParams: {
        cId: onboardResult.candidateId,
        cJobId: onboardResult.candidateJobRequirementId,
      },
    });
  }

  redirectToHRVerify(onboardResult: DashboardOnboardingResults): void {
    this.router.navigate(['/aura/hr/hr-verify'], {
      queryParams: {
        eOnBoardingId: onboardResult.employeeOnboardingId,
        cJobId: onboardResult.candidateJobRequirementId,
      },
    });
  }

  // moveForward(): void {
  //   this.isListsBackward = true;
  //   this.index = this.index + 2;
  //   this.listSize = this.listSize + 2;
  //   this.onboardStatus = this.onboardingStatuses?.slice(
  //     this.index,
  //     this.listSize
  //   );
  //   if (this.index === this.onboardingStatuses?.length - 6) {
  //     this.isListsForward = false;
  //   }
  // }

  // moveBackward(): void {
  //   this.isListsForward = true;
  //   this.index = this.index - 2;
  //   this.listSize = this.listSize - 2;
  //   this.onboardStatus = this.onboardingStatuses?.slice(
  //     this.index,
  //     this.listSize
  //   );
  //   if (this.index === 0) {
  //     this.isListsBackward = false;
  //   }
  // }

  onCardClick(code: string, status: string, count: number, type: string): void {
    if (count !== 0) {
      this.mapCardStatus.clear();
      this.mapCardStatus.set(code, status);
      const dialogConfig = new MatDialogConfig();
      // tslint:disable-next-line: no-any
      const obj: any = {
        onboardingCounts: this.onboardingCounts,
        mapStatus: this.mapCardStatus,
        disable: true,
        expend: true,
        cardType: type,
        // tslint:disable-next-line: radix
        cardStatusValue: parseInt(code),
      };
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = false;
      dialogConfig.width = '70%';
      dialogConfig.data = {
        obj,
      };
      this.dialogRef = this.dialog.open(
        OnboardingDetailsComponent,
        dialogConfig
      );
      this.dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result === 'cancel') {
            this.getOnboardingsCounts(this.searchText);
          }
        }
      });
    }
  }
}
