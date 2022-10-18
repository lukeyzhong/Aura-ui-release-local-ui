import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { OnBoardStatus } from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';

@Component({
  selector: 'app-offer-reject',
  templateUrl: './offer-reject.component.html',
  styleUrls: ['./offer-reject.component.scss'],
})
export class OfferRejectComponent implements OnInit {
  onBoardRejectForm!: FormGroup;
  selectedRejectionsReasonsCodes: string[] = [];
  employeeOnboardingId!: string;
  mapRejectionReasons = new Map<number, string>();
  isLoading = false;
  reject = true;
  jobTitle!: string;

  constructor(
    private lookupService: LookupService,
    private router: Router,
    private matNotificationService: MatNotificationService,
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    private fb: FormBuilder
  ) {
    this.employeeOnboardingId = data?.obj?.employeeOnboardingId;
  }

  ngOnInit(): void {
    this.onBoardRejectForm = this.fb.group({
      rejectionReasonCode: ['', [Validators.required]],
      comments: ['', Validators.required],
    });

    this.setRejectionReasonsCodes();
  }

  setRejectionReasonsCodes(): void {
    this.isLoading = true;
    this.lookupService.getRejectionOfferReasonsCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapRejectionReasons.set(country?.lookupCode, country?.description);
      }
      this.isLoading = false;
    });
  }

  onCancel(e: Event): void {
    this.dialogRef.close('success');
  }
  onClose(e: Event): void {
    this.dialogRef.close('success');
    this.router.navigate(['/candidate/dashboard']);
  }
  rejectOffer(): void {
    this.reject = false;
    let statusList!: OnBoardStatus[];
    statusList = [
      {
        Key: 'EmployeeOnboardingId',
        Value: this.employeeOnboardingId,
      },
      {
        Key: 'Comments',
        Value: this.onBoardRejectForm?.controls?.comments?.value,
      },
      {
        Key: 'DeclineReasonCodes',
        Value: this.selectedRejectionsReasonsCodes?.join(','),
      },
    ];

    this.hrDashboardService
      .saveHROnboardingStatusesByEmployeeOnboardingIdAndStatusType(
        'DeclineOffer',
        statusList
      )
      .subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.matNotificationService.success(
              `::  Offer Letter rejected successfully`
            );
          } else {
            this.matNotificationService.warn(':: Error: ' + res.errorMessage);
          }
        },
        (error) => {
          this.matNotificationService.showSnackBarMessage(
            'Oops! Request has failed',
            'error'
          );
          console.warn(error);
        }
      );
  }
}
