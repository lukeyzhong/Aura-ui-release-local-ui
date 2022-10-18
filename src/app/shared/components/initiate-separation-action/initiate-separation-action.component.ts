import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  EmployeeTermination,
  EmployeeTerminationDetails,
} from '../../../aura/search/interface/employee-profile/employee-profile-api.interface';
import { EmployeeProfileApiService } from '../../../aura/search/service/employee/employee-profile-api.service';

@Component({
  selector: 'app-initiate-separation-action',
  templateUrl: './initiate-separation-action.component.html',
  styleUrls: ['./initiate-separation-action.component.scss'],
})
export class InitiateSeparationActionComponent implements OnInit {
  toppings = new FormControl();
  empDetails!: EmployeeTerminationDetails;
  empTermination!: EmployeeTermination;
  toppingList: string[] = [
    'IT Team',
    'Finance Team',
    'Sales Team',
    'Recruiter Team',
    'HR Team',
  ];
  initiateSeparationForm!: FormGroup;

  constructor(
    private datepipe: DatePipe,
    private employeeProfileApiService: EmployeeProfileApiService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<InitiateSeparationActionComponent>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.empDetails = data?.obj?.empDetails;
  }

  ngOnInit(): void {
    this.empTermination = {
      employeeId: '',
      terminationDate: '',
      lastWorkingDate: '',
      comment: '',
      rehireEligibleIndicator: null,
      severanceEligibleIndicator: null,
    };
    this.initiateSeparationForm = this.fb.group({
      employeeId: [''],
      employeeCode: [{ value: '', disabled: true }],
      firstName: [{ value: '', disabled: true }],
      lastName: [{ value: '', disabled: true }],
      separationType: [''],
      comment: [''],
      lastWorkingDate: [''],
      separationInitiatedBy: [''],
      terminationDate: [''],
      // notifyTo: [''],
      rehireEligibleIndicator: [''],
      severanceEligibleIndicator: [''],
    });

    this.initiateSeparationForm.patchValue({
      employeeId: this.empDetails?.employeeId,
      employeeCode: this.empDetails?.employeeCode,
      firstName: this.empDetails?.firstName,
      lastName: this.empDetails?.lastName,
    });
  }

  closeDialog(): void {
    this.dialogRef.close('cancel');
  }

  uploadDocuments(): void {}

  saveInitiateSeparation(initiateSeparationForm: FormGroup): void {
    console.log(initiateSeparationForm.value);
    this.empTermination.employeeId = this.empDetails.employeeId;
    this.empTermination.terminationDate = String(
      this.datepipe.transform(
        this.initiateSeparationForm?.controls?.terminationDate?.value,
        'yyyy-MM-dd'
      )
    );
    this.empTermination.lastWorkingDate = this.empTermination.terminationDate =
      String(
        this.datepipe.transform(
          this.initiateSeparationForm?.controls?.lastWorkingDate?.value,
          'yyyy-MM-dd'
        )
      );
    this.empTermination.comment =
      this.initiateSeparationForm?.controls?.comment?.value;
    this.empTermination.rehireEligibleIndicator =
      this.initiateSeparationForm?.controls?.rehireEligibleIndicator?.value;
    this.empTermination.severanceEligibleIndicator =
      this.initiateSeparationForm?.controls?.severanceEligibleIndicator?.value;

    console.log(this.empTermination);

    this.employeeProfileApiService
      .terminateEmployeeProfile(this.empTermination)
      .subscribe(
        (data) => {
          console.log(data);
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
