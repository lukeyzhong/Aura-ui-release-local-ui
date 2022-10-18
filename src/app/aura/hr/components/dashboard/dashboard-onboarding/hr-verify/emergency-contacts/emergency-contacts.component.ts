import {
  CandidateOnboardingEmergencyContactsResult,
  EmergencyContacts,
} from '../../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { CandidateOnboardingWorkflowService } from '../../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatNotificationService } from '../../../../../../../shared/service/mat-notification.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { DocumentInformation } from '../../../../../../../shared/interface/document-info.interface';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { PreviewDocumentComponent } from '../../../../../../../shared/components/preview-document/preview-document.component';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import { ContactAddressType } from '../../../../../../../aura/search/interface/person.interface';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-emergency-contacts',
  templateUrl: './emergency-contacts.component.html',
  styleUrls: ['./emergency-contacts.component.scss'],
})
export class EmergencyContactsComponent implements OnInit {
  @Input() employeeOnboardingId!: string;
  @Input() countKeysContactsInfo!: number;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  emergencyContactsResult!: CandidateOnboardingEmergencyContactsResult;
  emergencyContacts!: EmergencyContacts[];
  email: string[] = [];
  cellPhoneNumber: string[] = [];
  cellCountry: string[] = [];
  homePhoneNumber: string[] = [];
  homeCountry: string[] = [];
  officePhoneNumber: string[] = [];
  officeCountry: string[] = [];
  officeExtension: string[] = [];
  fileExtO = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  mapState = new Map<string, string>();
  mapCountry = new Map<string, string>();
  commentForm!: FormGroup;
  comment = '';
  commentKey = '';
  // tslint:disable-next-line: no-any
  commentValue!: any;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();
  showUpdateButton = false;
  stateName = '';
  keysSectionWise: string[] = [];
  countKeysSectionWise = 0;
  @ViewChild(MatMenuTrigger) commentMenusTrigger!: MatMenuTrigger;
  @Output() checkCommentLength = new EventEmitter();

  constructor(
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private matNotificationService: MatNotificationService,
    private fb: FormBuilder,
    private dialogConfirm: MatDialog,
    private dialog: MatDialog,
    private lookupService: LookupService,
    private dialogRefPreview: MatDialogRef<PreviewDocumentComponent>
  ) {}

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
    });
    this.getStateLookup();
    this.getCountryLookup();
    this.getEmergencyContacts();
  }

  getStateLookup(): void {
    this.lookupService.getStateCode().subscribe((data) => {
      for (const state of data?.result) {
        this.mapState.set(state?.lookupCode?.toString(), state?.description);
      }
    });
  }

  getCountryLookup(): void {
    this.lookupService.getCountryCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapCountry.set(country?.lookupCode?.toString(), country?.description);
      }
    });
  }

  getEmergencyContacts(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEmergencyContacts(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.emergencyContactsResult = data?.result;
          this.emergencyContacts =
            this.emergencyContactsResult.emergencyContacts;
          if (this.emergencyContacts){
          for (const emergencyContact of this.emergencyContacts) {
            if (emergencyContact?.contactAddresses !== null) {
              for (const contact of emergencyContact?.contactAddresses) {
                switch (contact?.contactAddressTypeCode) {
                  case ContactAddressType.Email:
                    {
                      this.email.push(contact?.contactAddress);
                    }
                    break;
                  case ContactAddressType.Mobile:
                    {
                      this.cellPhoneNumber.push(
                        this.parsePhoneNumberToShow(contact?.contactAddress)
                      );
                      // tslint:disable-next-line: no-non-null-assertion
                      this.cellCountry.push(contact?.countryCode!);
                    }
                    break;

                  case ContactAddressType.HomePhone:
                    {
                      this.homePhoneNumber.push(
                        this.parsePhoneNumberToShow(contact?.contactAddress)
                      );
                      // tslint:disable-next-line: no-non-null-assertion
                      this.homeCountry.push(contact?.countryCode!);
                    }
                    break;

                  case ContactAddressType.WorkPhone:
                    {
                      this.officePhoneNumber.push(
                        this.parsePhoneNumberToShow(
                          contact?.contactAddress?.split('|')[0]
                        )
                      );
                      this.officeExtension.push(
                        contact?.contactAddress?.split('|')[1]
                      );
                      // tslint:disable-next-line: no-non-null-assertion
                      this.officeCountry.push(contact?.countryCode!);
                    }
                    break;
                }
              }
            }
          }
        }
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

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          this.hrComments = JSON.parse(data?.result);
          if (this.hrComments){
            this.checkCommentLength.emit(Object?.keys(this.hrComments)?.length);
            this.hrCommentsMap = new Map(Object.entries(this.hrComments));
          }
           // get the comment for specific section : start
          this.keysSectionWise = [];
          if (this.hrComments){
          for (const key of Object.keys(this.hrComments)) {
             if (key.toString().includes('emergencyContacts')) {
               this.keysSectionWise.push(key);
             }
           }
          }
          this.countKeysContactsInfo = this.keysSectionWise.length;
           // get the comment for specific section : end
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
    if (this.hrComments){
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
              if (key.toString().includes('emergencyContacts')) {
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

  previewDocument(doc: DocumentInformation): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRefPreview = this.dialog.open(
      PreviewDocumentComponent,
      dialogConfig
    );
  }
}
