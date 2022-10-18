import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { HrDashboardService } from '../../../../../hr/service/dashboard/hr-dashboard.service';

@Component({
  selector: 'app-adp-update',
  templateUrl: './adp-update.component.html',
  styleUrls: ['./adp-update.component.scss'],
})
export class AdpUpdateComponent implements OnInit {
  employeeOnboardingId!: string;
  adpPositionID!: string;
  updateADPGroup!: FormGroup;
  type = '';
  additionalInfo = '';
  constructor(
    private matNotificationService: MatNotificationService,
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private updateADPGroupBuilder: FormBuilder
  ) {
    this.employeeOnboardingId = data?.obj?.employeeOnboardingId;
    this.type = data?.obj?.type;
    try {
      this.additionalInfo = JSON.parse(data?.obj?.additionalInfo)?.Error;
    } catch (err) {}
  }

  ngOnInit(): void {
    this.updateADPGroup = this.updateADPGroupBuilder.group({
      adpPositionID: ['', Validators.required],
    });
  }

  updateADP(): void {
    this.adpPositionID = this.updateADPGroup.controls.adpPositionID.value;
    this.hrDashboardService
      .updateADPRecords(this.employeeOnboardingId, this.adpPositionID)
      .subscribe(
        (data) => {
          if (data?.errorCode === 0) {
            this.matNotificationService.success(
              ':: ADP record updated successfully'
            );
            this.dialogRef?.close('success');
          } else {
            this.matNotificationService.warn(':: Error: ' + data?.errorMessage);
          }
        },
        (err) => {
          this.matNotificationService.showSnackBarMessage(
            'Oops! Request has failed',
            'error'
          );
        }
      );
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }
}
