import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { PayrollCalendarDialogComponent } from '../../dashboard/payroll-calendar/payroll-calendar-dialog/payroll-calendar-dialog.component';
import { PayrollCalendarResult } from '../../../interface/dashboard/payroll-calendar.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { ActiveUserInfoService } from '../../../../../core/service/active-user-info.service';
import { CandidateOnboardingService } from '../../../service/dashboard/candidate-onboarding.service';
import { EmploymentInformationResult } from '../../../interface/dashboard/candidate-onboarding.interface';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-employment-details-tab',
  templateUrl: './employment-details-tab.component.html',
  styleUrls: ['./employment-details-tab.component.scss'],
})
export class EmploymentDetailsTabComponent implements OnInit {
  employmentDetailsForm!: FormGroup;
  employmentInformationResult!: EmploymentInformationResult;

  mapEmpType = new Map<number, string>();
  mapEmploymentType = new Map<string, string>();
  mapEmpCategory = new Map<number, string>();
  mapDepartment = new Map<string, string>();
  mapReportingMgr = new Map<string, string>();
  mapState = new Map<number, string>();
  mapBusinessUnit = new Map<number, string>();

  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;

  @Input() stepper!: MatStepper;
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';

  currentDate = {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  };
  payrollCalendarResult!: PayrollCalendarResult[];
  maxDate!: Date;
  minDate!: Date;
  tempStartDate = '';
  hireDateIsBig = false;

  constructor(
    private datepipe: DatePipe,
    private fb: FormBuilder,
    private router: Router,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingService: CandidateOnboardingService,
    private activeUserInfoService: ActiveUserInfoService,
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog
  ) {}

  ngOnInit(): void {
    this.setEmploymentCategory();
    this.employmentDetailsForm = this.fb.group({
      jobTitle: [
        '',
        [Validators.required, Validators.pattern('^(s?.?[a-zA-Z]+)+$')],
      ],
      department: ['', Validators.required],
      employmentType: ['', Validators.required],
      employmentCategory: ['', Validators.required],
      hireDate: ['', Validators.required],
      startDate: ['', Validators.required],
      hrManager: ['', Validators.required],
      reportingManager: ['', Validators.required],
      workLocation: ['', Validators.required],
      businessUnit: ['', Validators.required],
    });

    this.setEmploymentInformation();
    this.setDepartment();
    this.setReportingManager();
    this.setPayrollCalendar();
    this.setEmploymentType();
    this.setState();
    this.setBusinessUnit();

    this.minDate = new Date(this.currentDate.year - 1, 0, 1);
    this.maxDate = new Date(this.currentDate.year + 1, 11, 31);
  }

  setBusinessUnit(): void {
    this.lookupService.getBusinessUnitNames().subscribe(
      (data) => {
        for (const bu of data?.result) {
          this.mapBusinessUnit.set(bu?.lookupCode, bu?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  setState(): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          this.mapState.set(state?.lookupCode, state?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  setPayrollCalendar(): void {
    this.hrDashboardService
      .getPayRollCalendarByYear(this.currentDate.year)
      .subscribe(
        (data) => {
          this.payrollCalendarResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  openPayRollDialog(): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      payRollData: this.payrollCalendarResult,
      year: this.currentDate.year,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialogConfirm.open(
      PayrollCalendarDialogComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.dialogRef.close('success');
      }
    });
  }

  setEmploymentCategory(): void {
    this.lookupService.getEmploymentCategory().subscribe(
      (data) => {
        for (const category of data?.result) {
          this.mapEmpCategory.set(category?.lookupCode, category?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  setEmploymentType(): void {
    this.lookupService.getEmploymentType().subscribe(
      (data) => {
        for (const type of data?.result) {
          this.mapEmpType.set(type?.lookupCode, type?.name);
          this.mapEmploymentType.set(type?.name, type?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  setEmploymentInformation(): void {
    this.candidateOnboardingService
      .getEmploymentInformation(
        this.candidateId,
        this.candidateJobRequirementId
      )
      .subscribe(
        (data) => {
          this.employmentInformationResult = data?.result;

          this.employmentDetailsForm.patchValue({
            jobTitle: this.employmentInformationResult?.jobTitle,
            department: this.employmentInformationResult?.departmentId,
            employmentType:
              this.employmentInformationResult?.employmentTypeCode,
            employmentCategory:
              this.employmentInformationResult?.employmentCategoryCode,
            hireDate: this.employmentInformationResult?.hireDate,
            startDate:
              this.employmentInformationResult?.startDate?.split('T')[0],
            hrManager:
              this.activeUserInfoService?.getActiveUserInfo()?.userName,
            reportingManager:
              this.employmentInformationResult?.reportingManager,
            workLocation: this.employmentInformationResult?.workLocationCode,
            businessUnit: this.employmentInformationResult?.businessUnitCode,
          });
          this.employmentDetailsForm?.controls?.hrManager?.disable();
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setReportingManager(): void {
    this.lookupService.getReportingManagerByName().subscribe(
      (data) => {
        this.mapReportingMgr = data?.result;
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  setDepartment(): void {
    this.lookupService.getDepartmentLookup().subscribe(
      (data) => {
        for (const dept of data?.result) {
          this.mapDepartment.set(dept?.departmentId, dept?.departmentName);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  onSaveEmploymentDetails(): void {
    this.employmentInformationResult.jobTitle =
      this.employmentDetailsForm?.controls?.jobTitle?.value;
    this.employmentInformationResult.departmentId =
      this.employmentDetailsForm?.controls?.department?.value;

    this.employmentInformationResult.employmentTypeCode =
      this.employmentDetailsForm?.controls?.employmentType?.value;
    this.employmentInformationResult.employmentCategoryCode =
      this.employmentDetailsForm?.controls?.employmentCategory?.value;
    this.employmentInformationResult.hireDate = String(
      this.datepipe.transform(
        this.employmentDetailsForm?.controls?.hireDate?.value,
        'yyyy-MM-dd'
      )
    );

    this.employmentInformationResult.startDate = String(
      this.datepipe.transform(
        this.employmentDetailsForm?.controls?.startDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.employmentInformationResult.hrManager =
      this.activeUserInfoService?.getActiveUserInfo()?.userName;
    this.employmentInformationResult.hrManagerId =
      this.activeUserInfoService?.getActiveUserInfo()?.userId;

    this.employmentInformationResult.reportingManagerId = this.getKeyByValue(
      this.mapReportingMgr,
      this.employmentDetailsForm?.controls?.reportingManager?.value
    );

    this.employmentInformationResult.workLocationCode =
      this.employmentDetailsForm?.controls?.workLocation?.value;
    this.employmentInformationResult.businessUnitCode =
      this.employmentDetailsForm?.controls?.businessUnit?.value;

    this.candidateOnboardingService
      .saveEmploymentInformation(this.employmentInformationResult)
      .subscribe(
        (data) => {
          const pkgTypeValue = this.mapEmpType.get(
            this.employmentDetailsForm?.controls?.employmentType?.value
          );
          const pkgType = {
            code: this.employmentDetailsForm?.controls?.employmentType?.value,
            value: pkgTypeValue,
          };

          this.candidateOnboardingService.sendPkgTypeName(pkgType);
          this.matNotificationService.success(
            ':: Employment Details updated successfully'
          );
          this.candidateOnboardingService.sendUpdatedJobTitle(
            this.employmentDetailsForm?.controls?.jobTitle?.value
          );
          this.candidateOnboardingService.sendUpdatedWorkLocation(true);
          this.employmentDetailsForm.markAsPristine();
          this.setEmploymentInformation();
        },
        (error) => {
          this.matNotificationService.warn(':: Unable to update successfully');
        }
      );
  }

  getFirstPayrollDate(startDate: HTMLInputElement): string {
    const checkDate = new Date(startDate.value);
    const pay = this.payrollCalendarResult?.find(
      (payroll) =>
        Date.parse(payroll?.endDate) >= checkDate?.getTime() &&
        Date.parse(payroll?.startDate) <= checkDate?.getTime()
    );

    return pay === undefined ? '' : String(pay?.payDate);
  }

  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object?.keys(object)?.find((key) => object[key] === value);
  }

  onRestore(e: Event, employmentDetailsForm: FormGroup): void {
    if (employmentDetailsForm.dirty && employmentDetailsForm.valid) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setEmploymentInformation();
          employmentDetailsForm.markAsPristine();
          this.stepper.selectedIndex = 0;
        }
      });
      e.preventDefault();
    } else {
      this.setEmploymentInformation();
      this.stepper.selectedIndex = 0;
    }
  }

  goToHrDashboard(employmentDetailsForm: FormGroup): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Are you sure, you want to save & close?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        if (employmentDetailsForm.dirty && employmentDetailsForm.valid) {
          this.onSaveEmploymentDetails();
          employmentDetailsForm.markAsPristine();
        }
        this.router.navigate(['/aura/hr/dashboard']);
      }
    });
  }

  saveContinue(employmentDetailsForm: FormGroup): void {
    if (employmentDetailsForm.dirty) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onSaveEmploymentDetails();
          employmentDetailsForm.markAsPristine();
          this.stepper.next();
        }
      });
    } else if (employmentDetailsForm.valid) {
      const pkgTypeValue = this.mapEmpType.get(
        this.employmentDetailsForm?.controls?.employmentType?.value
      );
      const pkgType = {
        code: this.employmentDetailsForm?.controls?.employmentType?.value,
        value: pkgTypeValue,
      };
      employmentDetailsForm.markAsPristine();
      this.candidateOnboardingService.sendPkgTypeName(pkgType);
      this.stepper.next();
      this.matNotificationService.success(':: No changes made.');
    }
  }

  setStartDate(empType: number, hireDate: string): void {
    const empTypes = [5, 6];

    if (empTypes.includes(empType)) {
      this.tempStartDate = hireDate;
      this.employmentDetailsForm?.controls?.startDate?.setValue(
        new Date(hireDate)
      );
      this.employmentDetailsForm?.controls?.startDate?.disable();
    } else {
      this.employmentDetailsForm?.controls?.startDate?.enable();
    }
  }

  checkForValidStartDate(hireDate: string, startDate: string): void {
    if (new Date(hireDate) <= new Date(startDate)) {
      this.hireDateIsBig = false;
    } else {
      this.hireDateIsBig = true;
    }
  }
}
