import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import { OnBoardStatus } from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';

@Component({
  selector: 'app-uscis-update',
  templateUrl: './uscis-update.component.html',
  styleUrls: ['./uscis-update.component.scss'],
})
export class UscisUpdateComponent implements OnInit {
  employeeOnboardingId!: string;
  empCode!: string;
  fullName!: string;
  hireDate!: string;
  uscisCaseNumber!: string;
  submittedOn!: string;
  // tslint:disable-next-line: no-any
  uscisList!: any;
  updateUSCISGroup!: FormGroup;

  constructor(
    private matNotificationService: MatNotificationService,
    private datePipe: DatePipe,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    private updateUSCISGroupBuilder: FormBuilder,
    private hrDashboardService: HrDashboardService
  ) {
    this.employeeOnboardingId = data?.obj?.employeeOnboardingId;
    this.uscisCaseNumber = data?.obj?.uscisCaseNumber;
    this.submittedOn = data?.obj?.submittedOn;
    this.empCode = data?.obj?.empCode;
    this.fullName = data?.obj?.fullName;
    this.hireDate = data?.obj?.hireDate;
  }

  ngOnInit(): void {
    this.updateUSCISGroup = this.updateUSCISGroupBuilder.group({
      employeeCode: [''],
      fullName: [''],
      hireDate: [''],
      caseNumber: ['', Validators.required],
      submittedOn: ['', Validators.required],
    });

    this.updateUSCISGroup.patchValue({
      employeeCode: this.empCode,
      fullName: this.fullName,
      // tslint:disable-next-line: no-non-null-assertion
      hireDate: this.datePipe?.transform(this.hireDate, 'yyyy-MM-dd')!,
      caseNumber: this.uscisCaseNumber,
      // tslint:disable-next-line: no-non-null-assertion
      submittedOn: this.datePipe?.transform(this.submittedOn, 'yyyy-MM-dd')!,
    });
    this.updateUSCISGroup?.controls?.employeeCode?.disable();
    this.updateUSCISGroup?.controls?.fullName?.disable();
    this.updateUSCISGroup?.controls?.hireDate?.disable();
    if (this.uscisCaseNumber !== null) {
      this.updateUSCISGroup?.controls?.caseNumber?.disable();
      this.updateUSCISGroup?.controls?.submittedOn?.disable();
    }
    else{
      this.updateUSCISGroup?.controls?.caseNumber?.enable();
      this.updateUSCISGroup?.controls?.submittedOn?.enable();
    }
  }

  updateUSCISRecord(): void {
    if (this.uscisCaseNumber !== null) {
      this.uscisList =
        {
          EmployeeOnboardingId: this.employeeOnboardingId,
        };
    } else {
      this.uscisList =
        {
          EmployeeOnboardingId: this.employeeOnboardingId,
          USCISCaseNumber: this.updateUSCISGroup.controls.caseNumber.value,
          SubmittedOn: this.updateUSCISGroup.controls.submittedOn.value,
        };
    }
    this.hrDashboardService.updateUSCISRecords(this.uscisList).subscribe(
      (data) => {
        if (data?.errorCode === 0) {
          this.matNotificationService.success(':: Case updated succesfully');
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
    this.dialogRef?.close('cancel');
  }
}
