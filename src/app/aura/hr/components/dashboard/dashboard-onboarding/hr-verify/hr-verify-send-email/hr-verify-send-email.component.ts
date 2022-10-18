import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmailList } from '../../../../../interface/dashboard/candidate-onboarding.interface';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { GetRejectionEmailContentResult } from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hr-verify-send-email',
  templateUrl: './hr-verify-send-email.component.html',
  styleUrls: ['./hr-verify-send-email.component.scss']
})
export class HrVerifySendEmailComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  sendEmailForm!: FormGroup;
  rejectionEmailContentResult!: GetRejectionEmailContentResult;
  @Output() offerSent = new EventEmitter();
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';
  errorMsg = '';
  showDashboardLinkAfterEmailSent = false;
  isLoading = false;
  @Output() previousButtonClicked = new EventEmitter();
  @Output() reloadCommentsCount = new EventEmitter();

  // EMAIL
  separatorKeysCodes = [ENTER, COMMA];
  toEmailList: EmailList[] = [];
  toList: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
  ) {}

  ngOnInit(): void {
    this.sendEmailForm = this.fb.group({
      subject: ['', [Validators.required]],
      body: [''],
    });
    this.setRejectionEmailContent();
  }

  setRejectionEmailContent(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .GetRejectionEmailContentData(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.rejectionEmailContentResult = data?.result;
          this.sendEmailForm.patchValue({
            subject: this.rejectionEmailContentResult?.subject,
            body: this.rejectionEmailContentResult?.body,
          });
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0 ; i < this.rejectionEmailContentResult?.to?.length; i++){
          this.toEmailList.push({
           value: this.rejectionEmailContentResult?.to[i],
           invalid: false,
         });
        }
          this.isLoading = false;
        },
        (err) => {
          this.isLoading = false;
          console.warn(err);
        }
      );
  }

  movePreviousScreen(): void{
    this.previousButtonClicked.emit(false);
    this.reloadCommentsCount.emit(true);
  }

  onSaveSendEmail(): void {
    this.toList = [];
    for (const email of this.toEmailList) {
      this.toList?.push(email?.value);
    }
    this.rejectionEmailContentResult.employeeOnboardingId = this.employeeOnboardingId;
    this.rejectionEmailContentResult.to = this.toList;
    this.rejectionEmailContentResult.subject = this.sendEmailForm?.controls?.subject?.value;
    this.rejectionEmailContentResult.body = this.sendEmailForm?.controls?.body?.value;

    this.candidateOnboardingWorkflowService
      .sendRejectionEmailContent(
        this.rejectionEmailContentResult
      )
      .subscribe(
        (data) => {
          if (data?.errorCode === 0){
            this.showDashboardLinkAfterEmailSent = true;
            this.matNotificationService.success(':: Email with rejection details sent successfully');
          }
          else{
            this.matNotificationService.warn(':: Unable to send rejection email');
          }
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(
            ':: Unable to send rejection email'
          );
          console.warn(error);
        }
      );
  }

  addReceipient(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      if (this.validateEmail(value)) {
        this.toEmailList.push({
          value,
          invalid: false,
        });
      } else {
        this.toEmailList.push({ value, invalid: true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  removeReceipient(data: EmailList): void {
    if (this.toEmailList.indexOf(data) >= 0) {
      this.toEmailList.splice(this.toEmailList.indexOf(data), 1);
    }
  }

  validateEmail(email: string): boolean {
    const emailPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(String(email).toLowerCase());
  }

  goToHrDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
  }

}
