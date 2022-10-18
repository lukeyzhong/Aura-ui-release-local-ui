import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { CandidateOnboardingWorkflowService } from 'src/app/shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import {
  Addresses,
  AddressType,
  ContactAddressType,
} from '../../../../../../../aura/search/interface/person.interface';
// tslint:disable-next-line: max-line-length
import { CandidateOnboardingPersonalInformationResult } from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
})
export class PersonalInfoComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  @Input() countKeysPersonalInfo!: number;
  candidateOnboardingPersonalInfoResult!: CandidateOnboardingPersonalInformationResult;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  email = '';
  cellPhoneNumber = '';
  cellCountry = '';
  homePhoneNumber = '';
  homeCountry = '';
  officePhoneNumber = '';
  officeCountry = '';
  officeExtension = '';
  livingAddress!: Addresses | null;
  livingAddrStateName = '';
  livingAddrCountryName = '';
  commentForm!: FormGroup;
  comment = '';
  commentKey = '';
  // tslint:disable-next-line: no-any
  commentValue!: any;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();
  showUpdateButton = false;
  hrCommentCount = 0;
  keysSectionWise: string[] = [];
  @ViewChild(MatMenuTrigger) commentMenusTrigger!: MatMenuTrigger;
  @Output() checkCommentLength = new EventEmitter();

  constructor(
    private matNotificationService: MatNotificationService,
    private lookupService: LookupService,
    private fb: FormBuilder,
    private dialogConfirm: MatDialog,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
    this.getPersonalInfo();
  }

  getPersonalInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingPersonalInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          this.candidateOnboardingPersonalInfoResult = data?.result;

          if (data?.result?.contactAddresses !== null) {
            for (const contact of data?.result?.contactAddresses) {
              switch (contact?.contactAddressTypeCode) {
                case ContactAddressType.Email:
                  {
                    this.email = contact?.contactAddress;
                  }
                  break;
                case ContactAddressType.Mobile:
                  {
                    this.cellPhoneNumber = this.parsePhoneNumberToShow(
                      contact?.contactAddress
                    );
                    // tslint:disable-next-line: no-non-null-assertion
                    this.cellCountry = contact?.countryCode!;
                  }
                  break;

                case ContactAddressType.HomePhone:
                  {
                    this.homePhoneNumber = this.parsePhoneNumberToShow(
                      contact?.contactAddress
                    );
                    // tslint:disable-next-line: no-non-null-assertion
                    this.homeCountry = contact?.countryCode!;
                  }
                  break;

                case ContactAddressType.WorkPhone:
                  {
                    this.officePhoneNumber = this.parsePhoneNumberToShow(
                      contact?.contactAddress?.split('|')[0]
                    );
                    this.officeExtension =
                      contact?.contactAddress?.split('|')[1];
                    // tslint:disable-next-line: no-non-null-assertion
                    this.officeCountry = contact?.countryCode!;
                  }
                  break;
              }
            }
          }

          if (data?.result?.address?.addressTypeCode === AddressType.Mailing) {
            this.livingAddress = data?.result?.address;
            this.findLivingAddressStateName(this.livingAddress?.stateCode);
            this.findLivingAddressCountryName(this.livingAddress?.countryCode);
          } else {
            this.livingAddress = null;
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
            this.checkCommentLength.emit(Object?.keys(this.hrComments)?.length);
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));
          }
          // get the comment for specific section : start
          this.keysSectionWise = [];
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('personalInformation')) {
                this.keysSectionWise.push(key);
              }
            }
          }
          this.countKeysPersonalInfo = this.keysSectionWise.length;
          // get the comment for specific section : end
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  parsePhoneNumberToShow(phoneNumber: string): string {
    if (phoneNumber) {
      phoneNumber =
        '(' +
        phoneNumber.substr(0, 3) +
        ')' +
        ' ' +
        phoneNumber.substr(3, 3) +
        '-' +
        phoneNumber.substr(6, 4);
    }
    return phoneNumber;
  }

  findLivingAddressCountryName(countryCode: string): void {
    this.lookupService.getCountryCode().subscribe(
      (data) => {
        for (const country of data?.result) {
          if (country.lookupCode === Number(countryCode)) {
            this.livingAddrCountryName = country.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  findLivingAddressStateName(stateCode: string): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          if (state.lookupCode === Number(stateCode)) {
            this.livingAddrStateName = state.description;
            break;
          }
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

  deleteComment(type: string, event: Event): void {
    this.getComments();
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );
    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to delete?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type === 'All') {
          if (this.hrComments) {
            for (const key of Object.keys(this.hrComments)) {
              if (key.toString().includes('personalInformation')) {
                this.hrCommentsMap.delete(key);
              }
            }
          }
        }
        if (type === 'Single') {
          this.hrCommentsMap.delete(this.commentKey);
        }
        const commentStr = JSON.stringify(
          Object.fromEntries(this.hrCommentsMap)
        );

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
                if (type === 'Single') {
                  this.matNotificationService.success(
                    `:: Comment deleted successfully`
                  );
                } else if (type === 'All') {
                  this.matNotificationService.success(
                    `:: Comments deleted successfully`
                  );
                }
              } else {
                this.matNotificationService.warn(
                  ':: Error: ' + res.errorMessage
                );
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
    });
    event.preventDefault();
    event.stopPropagation();
  }

  closeMenu(): void {
    this.commentMenusTrigger.closeMenu();
  }

  goToExternalUrl(url: string): void {
    window.open(url, '_blank');
  }
}
