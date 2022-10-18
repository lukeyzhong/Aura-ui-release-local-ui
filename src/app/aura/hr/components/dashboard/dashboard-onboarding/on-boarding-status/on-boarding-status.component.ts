import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  DashboardOnboardingResults,
  OnBoardStatus,
} from '../../../../../hr/interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../../../hr/service/dashboard/hr-dashboard.service';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';

@Component({
  selector: 'app-on-boarding-status',
  templateUrl: './on-boarding-status.component.html',
  styleUrls: ['./on-boarding-status.component.scss'],
})
export class OnBoardingStatusComponent implements OnInit {
  onboardCandidate!: DashboardOnboardingResults;
  actionType!: string;
  statusType!: string;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  onBoardStatusForm!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<OnBoardingStatusComponent>,
    private matNotificationService: MatNotificationService,
    private hrDashboardService: HrDashboardService,
    private dialogConfirm: MatDialog,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    private fb: FormBuilder
  ) {
    this.onboardCandidate = data?.obj?.onboardCand;
    this.actionType = data?.obj?.action;
    this.statusType =
      data?.obj?.statusType === 'Onhold' ? 'On Hold' : data?.obj?.statusType;
  }

  ngOnInit(): void {
    this.onBoardStatusForm = this.fb.group({
      comments: ['', Validators.required],
    });
    if (this.actionType === 'Edit') {
      const commentsObj = JSON.parse(this.onboardCandidate?.comments);

      this.onBoardStatusForm.patchValue({
        comments: commentsObj.Comment,
      });
    }
  }

  onSubmit(statusType: string): void {
    const currentStatusType = statusType.replace(/ /g, '').toLowerCase();
    let statusList!: OnBoardStatus[];
    if (
      currentStatusType === 'onhold' ||
      currentStatusType === 'rollbackoffer' ||
      currentStatusType === 'delete'
    ) {
      statusList = [
        {
          Key: 'EmployeeOnboardingId',
          Value: this.onboardCandidate.employeeOnboardingId,
        },
        {
          Key: 'Comments',
          Value: this.onBoardStatusForm?.controls?.comments?.value,
        },
      ];
    }

    this.hrDashboardService
      .saveHROnboardingStatusesByEmployeeOnboardingIdAndStatusType(
        currentStatusType,
        statusList
      )
      .subscribe(
        (res) => {
          if (res.errorCode === 0) {
            switch (currentStatusType) {
              case 'onhold':
                {
                  this.dialogRef.close({
                    status: 'success',
                    data: `:: ${this.onboardCandidate.fullName} Profile successfully put on Hold`,
                  });
                }
                break;
              case 'rollbackoffer':
                {
                  this.dialogRef.close({
                    status: 'success',
                    data: `:: ${this.onboardCandidate.fullName} Offer Rolled Back Successfully`,
                  });
                }
                break;

              case 'delete':
                {
                  this.dialogRef.close({
                    status: 'success',
                    data: `:: ${this.onboardCandidate.fullName} Profile Deleted Successfully`,
                  });
                }
                break;
            }
          } else {
            this.matNotificationService.warn(':: Error: ' + res.errorMessage);
          }
        },
        (error) => {
          this.matNotificationService.showSnackBarMessage(
            'Oops! Request has failed',
            error
          );
        }
      );
  }

  onCancel(e: Event): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you want to leave without saving?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.dialogRef.close('cancel');
      }
    });
    e.preventDefault();
  }
}
