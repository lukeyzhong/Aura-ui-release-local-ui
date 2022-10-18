import {
  Component,
  OnInit,
  Input,
  ViewChild,
  EventEmitter,
  Output,
} from '@angular/core';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { EmploymentCompensationInfoResult } from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-compensation-info',
  templateUrl: './compensation-info.component.html',
  styleUrls: ['./compensation-info.component.scss'],
})
export class CompensationInfoComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  employmentCompensationInfoResult!: EmploymentCompensationInfoResult;
  commentForm!: FormGroup;
  comment = '';
  commentKey = '';
  // tslint:disable-next-line: no-any
  commentValue!: any;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();
  showUpdateButton = false;
  @ViewChild(MatMenuTrigger) commentMenusTrigger!: MatMenuTrigger;
  @Output() checkEmploymentType = new EventEmitter();

  constructor(
    private matNotificationService: MatNotificationService,
    private fb: FormBuilder,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
    this.getEmploymentCompensationInfo();
  }

  getEmploymentCompensationInfo(): void {
    this.candidateOnboardingWorkflowService
      .getEmploymentCompensationInformation(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.employmentCompensationInfoResult = data?.result;
          if (
            // tslint:disable-next-line: radix
            parseInt(this.employmentCompensationInfoResult?.employmentInfo
              ?.employmentTypeCode) === 5 ||
            // tslint:disable-next-line: radix
            parseInt(this.employmentCompensationInfoResult?.employmentInfo
              ?.employmentTypeCode) === 6
          ) {
            this.checkEmploymentType.emit(false);
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.hrComments = JSON.parse(data?.result);
          if (this.hrComments) {
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onHover(val: string): void {
    this.showUpdateButton = false;
    this.commentForm.get('comment')?.patchValue('');
    this.commentKey = val;
    if (this.hrComments) {
      Object.entries(this.hrComments).forEach((d) => {
        if (d[0] === this.commentKey) {
          this.commentValue = d[1];
          this.commentForm.get('comment')?.patchValue(this.commentValue);
          this.commentForm?.markAsPristine();
          this.showUpdateButton = true;
        }
      });
    }
  }

  onSave(): void {
    this.commentValue = this.commentForm.get('comment')?.value;
    this.hrCommentsMap.delete(this.commentKey);
    this.hrCommentsMap.set(this.commentKey, this.commentValue);

    const commentStr = JSON.stringify(Object.fromEntries(this.hrCommentsMap));

    // tslint:disable-next-line: no-any
    let CommentList: any;
    CommentList = {
      EmployeeOnboardingId: this.employeeOnboardingId,
      HRComments: commentStr,
    };

    this.candidateOnboardingWorkflowService
      .saveHRComment(CommentList)
      .subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.getComments();
            this.matNotificationService.success(
              `:: Comment saved successfully`
            );
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
    this.commentMenusTrigger.closeMenu();
  }

  deleteComment(): void {
    this.hrCommentsMap.delete(this.commentKey);
    const commentStr = JSON.stringify(Object.fromEntries(this.hrCommentsMap));

    // tslint:disable-next-line: no-any
    let CommentList: any;
    CommentList = {
      EmployeeOnboardingId: this.employeeOnboardingId,
      HRComments: commentStr,
    };

    this.candidateOnboardingWorkflowService
      .saveHRComment(CommentList)
      .subscribe(
        (res) => {
          if (res.errorCode === 0) {
            this.getComments();
            this.matNotificationService.success(
              `:: Comment deleted successfully`
            );
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
    this.commentMenusTrigger.closeMenu();
  }

  closeMenu(): void {
    this.commentMenusTrigger.closeMenu();
  }
}
