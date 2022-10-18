import { Component, OnInit } from '@angular/core';
import { EmployeeDashboardService } from '../../../service/dashboard/employee-dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferDeclineInfoResponse, OfferDeclineInfoResult } from '../../../interface/employee-dashboard.interface';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OnBoardStatus } from '../../../../hr/interface/dashboard/hr-dashboard.interface';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';

@Component({
  selector: 'app-offer-declined',
  templateUrl: './offer-declined.component.html',
  styleUrls: ['./offer-declined.component.scss']
})
export class OfferDeclinedComponent implements OnInit {
  employeeOnboardingId = '';
  offerDeclineInfoResponse!: OfferDeclineInfoResponse;
  offerDeclineInfoResult!: OfferDeclineInfoResult;
  mapRejectionReasons = new Map<number, string>();
  onBoardStatusForm!: FormGroup;
  constructor(private employeeDashboardService: EmployeeDashboardService,
              private route: ActivatedRoute,
              private router: Router,
              private lookupService: LookupService,
              private matNotificationService: MatNotificationService,
              private fb: FormBuilder) {
    this.route.queryParamMap.subscribe((params) => {
      // tslint:disable-next-line: no-non-null-assertion
      this.employeeOnboardingId = params.get('onboardingId')!;
    });
  }

  ngOnInit(): void {
    this.onBoardStatusForm = this.fb.group({
      comments: ['', Validators.required],
    });
    this.setRejectionReasonsCodes();
    this.getOfferDeclineInfoDetails();
  }


  setRejectionReasonsCodes(): void {
    this.lookupService.getRejectionOfferReasonsCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapRejectionReasons.set(country?.lookupCode, country?.description);
      }
    });
  }

  getOfferDeclineInfoDetails(): void {
    this.employeeDashboardService.getOfferDeclineInfo(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.offerDeclineInfoResponse = data;
          this.offerDeclineInfoResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getRejectionReason(comments: number[]): string {
    const reasons = [];
    for (const [k, v] of this.mapRejectionReasons) {
      for (const code of comments) {
        if (k === code) {
          reasons.push(v);
        }
      }
    }
    return reasons.join(',');
  }

  rollBackOffer(): void {
    let statusList!: OnBoardStatus[];
    statusList = [
      {
        Key: 'EmployeeOnboardingId',
        Value: this.employeeOnboardingId,
      },
      {
        Key: 'Comments',
        Value: this.onBoardStatusForm?.controls?.comments?.value,
      },
    ];

    this.employeeDashboardService.SaveOnboardingStatus('RollbackOffer', statusList).
      subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.matNotificationService.success(':: Offer Rollback successfully');
            this.router.navigate(['/aura/hr/dashboard']);
          }
          else {
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

  resendOffer(): void {
    let statusList!: OnBoardStatus[];
    statusList = [
      {
        Key: 'EmployeeOnboardingId',
        Value: this.employeeOnboardingId,
      },
      {
        Key: 'Comments',
        Value: this.onBoardStatusForm?.controls?.comments?.value,
      },
    ];

    this.employeeDashboardService.SaveOnboardingStatus('ResendOffer', statusList).
      subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.matNotificationService.success(':: Offer Resend successfully');
            this.router.navigate(['/aura/hr/on-boarding'], {
              queryParams: {
                cId: this.offerDeclineInfoResult.candidateId,
                cJobId: this.offerDeclineInfoResult.candidateJobRequirementId,
              },
            });
          }
          else {
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

}
