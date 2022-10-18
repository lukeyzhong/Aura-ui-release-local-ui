import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatNotificationService } from '../../../shared/service/mat-notification.service';
import {
  SaveUserInfo,
  ValidatePersonInfo,
  ValidatePersonInfoResult,
} from '../../../candidate/interface/dashboard/candidate-dashboard.interface';
import { CandidateDashboardService } from '../../../candidate/service/dashboard/candidate-dashboard.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { AgeValidator } from '../../../shared/custom-validators/custom-validator-age';
import { DatePipe } from '@angular/common';
import { GlobalVariables } from 'src/app/shared/enums/global-variables.enum';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  termsCondnToken = '';
  fullName = '';
  isLoading = false;

  // Terms & Condns
  // tslint:disable-next-line: no-any
  templateTC: any;
  disableAccept = true;
  acceptanceDate!: Date;
  showTermsCondns = true;
  linkExpired = false;

  // Validate Person
  personalInfo!: ValidatePersonInfo;
  personInfoResult!: ValidatePersonInfoResult;
  showValidatePerson = false;
  validatePersonForm!: FormGroup;
  personInfoNotValid = false;
  personInfoValid = false;
  verifyErrMsg = '';
  // tslint:disable-next-line: no-any
  validationErrors: any[] = [];
  validationErrorsMap = new Map<string, string>();

  // Create Password
  showCreatePassword = false;
  createPwdInfo!: SaveUserInfo;
  createPwdForm!: FormGroup;
  userTypeCode = 2;
  showPassword = false;
  showCnfPassword = false;
  showRejectDialog = false;

  constructor(
    private candidateDashboardService: CandidateDashboardService,
    private router: Router,
    private datepipe: DatePipe,
    private fb: FormBuilder,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog,
    private matNotificationService: MatNotificationService,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.activatedRoute.queryParams.subscribe((parameter) => {
      this.termsCondnToken = parameter.token;
    });
    this.candidateDashboardService
      .termCondValidateToken(this.termsCondnToken)
      .subscribe(
        (data) => {
          this.isLoading = false;
          if (data?.result) {
            this.termsCondnToken = data?.result?.token;
            this.fullName = data?.result?.fullName;

            this.setTermsAndConditions();
          } else if (data?.errorCode === 3) {
            this.linkExpired = true;
            this.showValidatePerson = true;
            this.showTermsCondns = false;
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );

    this.acceptanceDate = new Date();

    this.personalInfo = Object.assign({}, this.personalInfo);
    // VALIDATE PERSON
    this.validatePersonForm = this.fb.group({
      firstName: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      lastName: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      dateOfBirth: ['', [Validators.required, AgeValidator.isAgeInvalid()]],
      countryCode: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
      ],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
    });

    // CREATE PASSWORD
    this.createPwdInfo = Object.assign({}, this.createPwdInfo);
    this.createPwdForm = this.fb.group(
      {
        userName: [
          { value: '', disabled: true },
          [Validators.required, Validators.pattern('^[a-zA-Z0-9. ]+$')],
        ],
        newPassword: ['', [Validators.required]],
        confirmPassword: [''],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  // Password matches with Confirm Password
  // tslint:disable-next-line: no-any
  passwordMatchValidator(frm: FormGroup): any {
    return frm?.controls?.newPassword?.value ===
      frm?.controls?.confirmPassword?.value
      ? null
      : { mismatch: true };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  toggleCnfPasswordVisibility(): void {
    this.showCnfPassword = !this.showCnfPassword;
  }

  setTermsAndConditions(): void {
    this.candidateDashboardService.getTermsAndConditionsTemplate().subscribe(
      (data) => {
        if (data?.result) {
          this.templateTC = this.sanitizer.bypassSecurityTrustHtml(
            data?.result
          );
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  acceptTermsAndConditions(): void {
    if (!this.disableAccept) {
      this.showTermsCondns = false;
      this.showValidatePerson = true;
      this.personInfoValid = true;
      this.showCreatePassword = false;
    }
  }

  acceptTerms(event: MatCheckboxChange): void {
    this.disableAccept = event.checked ? false : true;
  }

  onReject(): void {
    this.dialogRef = this.dialogConfirm.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you want to reject?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.candidateDashboardService
          .rejectTermsAndConditions(this.termsCondnToken)
          .subscribe(
            (data) => {
              this.showTermsCondns = false;
              this.showRejectDialog = true;
            },
            (err) => {
              console.warn(err);
              this.isLoading = false;
            }
          );
      }
    });
  }

  onValidatePerson(): void {
    this.personalInfo.firstName =
      this.validatePersonForm?.controls?.firstName?.value;
    this.personalInfo.lastName =
      this.validatePersonForm?.controls?.lastName?.value;
    this.personalInfo.dob = String(
      this.datepipe.transform(
        this.validatePersonForm?.controls?.dateOfBirth?.value,
        'yyyy-MM-dd'
      )
    );
    this.personalInfo.countryCode =
      this.validatePersonForm?.controls?.countryCode?.value;
    this.personalInfo.phone = this.parsePhoneNumberToSave(
      this.validatePersonForm?.controls?.phone?.value
    );
    this.personalInfo.email = this.validatePersonForm?.controls?.email?.value;
    this.personalInfo.token = this.termsCondnToken;

    this.candidateDashboardService.validatePerson(this.personalInfo).subscribe(
      (data) => {
        if (data?.errorCode === 0) {
          if (
            data?.result?.personId !== GlobalVariables.DefaultGUID &&
            data?.result?.userName !== null
          ) {
            this.personInfoResult = data?.result;
            this.createPwdForm.patchValue({
              userName: this.personInfoResult?.userName,
            });
            this.matNotificationService.success(
              ':: Candidate details verified successfully.'
            );
            this.showValidatePerson = false;
            this.personInfoValid = false;
            this.showCreatePassword = true;
            this.verifyErrMsg = '';
          } else {
            this.validationErrors = JSON.parse(data?.result?.errors);
            this.validationErrorsMap = new Map(
              Object?.entries(this.validationErrors)
            );

            const failedCount = data?.result?.failedCount;

            this.verifyErrMsg = `Information provided is not valid. You have ${
              3 - failedCount
            } attempts left.`;
            if (failedCount === 3 || failedCount === -1) {
              this.personInfoNotValid = true;
              this.personInfoValid = false;
            }
          }
        } else {
          this.matNotificationService.warn(`:: ${data?.errorMessage}.`);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  createPassword(): void {
    this.createPwdInfo.userName = this.personInfoResult?.userName;
    this.createPwdInfo.newPassword =
      this.createPwdForm?.controls?.newPassword?.value;
    this.createPwdInfo.UserRegisterToken = this.termsCondnToken;
    this.createPwdInfo.personId = this.personInfoResult?.personId;

    this.candidateDashboardService
      .saveUserAndCreatePassword(this.createPwdInfo)
      .subscribe(
        (data) => {
          if (data?.errorCode === 0) {
            this.matNotificationService.success(
              ':: Candidate password created successfully.'
            );
            this.router.navigate(['/login']);
          } else {
            this.matNotificationService.warn(':: User creation failed.');
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  parsePhoneNumberToSave(phoneNumber: string): string {
    if (phoneNumber) {
      phoneNumber =
        phoneNumber.substr(1, 3) +
        phoneNumber.substr(6, 3) +
        phoneNumber.substr(10, 4);
    }
    return phoneNumber;
  }
}
