import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  EmailList,
  OfferLetterEmailContentResult,
} from '../../../interface/dashboard/candidate-onboarding.interface';
import { CandidateOnboardingService } from '../../../service/dashboard/candidate-onboarding.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-send-offer-tab',
  templateUrl: './send-offer-tab.component.html',
  styleUrls: ['./send-offer-tab.component.scss'],
})
export class SendOfferTabComponent implements OnInit {
  sendOfferLetterForm!: FormGroup;
  offerLetterEmailContentResult!: OfferLetterEmailContentResult;

  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;

  @Output() offerSent = new EventEmitter();
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';

  // EMAIL
  separatorKeysCodes = [ENTER, COMMA];
  toEmailList: EmailList[] = [];
  email!: string;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingService: CandidateOnboardingService,
    private dialogConfirm: MatDialog
  ) {}

  ngOnInit(): void {
    this.sendOfferLetterForm = this.fb.group({
      subject: ['', [Validators.required]],
      body: [''],
    });
    this.candidateOnboardingService.getUpdatedJobTitle().subscribe((jobObj) => {
      if (jobObj?.jobTitle) {
        this.setSendOfferLetterEmailContent();
      }
    });
    this.candidateOnboardingService.getUpdatedEmail().subscribe((emailObj) => {
      this.email = emailObj?.email;
      this.toEmailList = [];
      this.toEmailList.push({
        value: emailObj?.email,
        invalid: false,
      });
      this.setSendOfferLetterEmailContent();
    });
    if (this.email === undefined) {
      this.setSendOfferLetterEmailContent();
    }
  }

  setSendOfferLetterEmailContent(): void {
    this.candidateOnboardingService
      .getOfferLetterEmailContent(
        this.candidateId,
        this.candidateJobRequirementId
      )
      .subscribe(
        (data) => {
          this.offerLetterEmailContentResult = data?.result;

          this.sendOfferLetterForm.patchValue({
            subject: this.offerLetterEmailContentResult?.subject,
            body: this.offerLetterEmailContentResult?.body,
          });

          if (this.email === undefined) {
            this.toEmailList.push({
              value: this.offerLetterEmailContentResult?.to,
              invalid: false,
            });
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onSaveSendOfferLetter(): void {
    this.offerLetterEmailContentResult.candidateId = this.candidateId;
    this.offerLetterEmailContentResult.candidateJobRequirementId =
      this.candidateJobRequirementId;
    let toS = '';
    for (const email of this.toEmailList) {
      toS = toS + ',' + email.value;
    }
    this.offerLetterEmailContentResult.to = toS;
    this.offerLetterEmailContentResult.subject =
      this.sendOfferLetterForm?.controls?.subject?.value;

    this.offerLetterEmailContentResult.body =
      this.sendOfferLetterForm?.controls?.body?.value;

    this.candidateOnboardingService
      .saveSendOfferLetterEmailContentInformation(
        this.offerLetterEmailContentResult
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Offer Letter details sent successfully'
          );

          this.offerSent.emit(true);
        },
        (error) => {
          this.matNotificationService.warn(
            ':: Unable to send the Offer Letter details successfully ' + error
          );
          console.warn(error);
        }
      );
  }

  goToHrDashboard(): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Are you sure, you want to close?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/aura/hr/dashboard']);
      }
    });
  }

  addReceipient(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value) {
      if (this.validateEmail(value)) {
        this.toEmailList?.push({
          value,
          invalid: false,
        });
      } else {
        this.toEmailList?.push({ value, invalid: true });
      }
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  removeReceipient(data: EmailList): void {
    if (this.toEmailList?.indexOf(data) >= 0) {
      this.toEmailList?.splice(this.toEmailList?.indexOf(data), 1);
    }
  }

  validateEmail(email: string): boolean {
    const emailPattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailPattern.test(String(email).toLowerCase());
  }
}
