import { Component, OnInit } from '@angular/core';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-mytasks-counts',
  templateUrl: './dashboard-mytasks-counts.component.html',
  styleUrls: ['./dashboard-mytasks-counts.component.scss'],
})
export class DashboardMytasksCountsComponent implements OnInit {
  toggleDiv = false;
  isLoadTaskCountSpinner = false;
  taskCountResult = new Map<string, number>();
  taskCountResultMap = new Map<string, number>();
  taskForm!: FormGroup;
  // tslint:disable-next-line: no-any
  taskCounts: any[] = [];
  taskCountsMap = new Map<string, number>();
  index = 0;
  isTaskBackward = true;
  isTaskForward = true;

  constructor(
    private hrDashboardService: HrDashboardService,
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      chkBoxProperty: this.fb.array([this.addchkBoxPropertyFormGroup()]),
    });

    if (this.index === 0) {
      this.isTaskBackward = false;
    }
    this.getTaskCount();
  }

  get chkBoxProperty(): FormArray {
    return this.taskForm.get('chkBoxProperty') as FormArray;
  }

  addchkBoxPropertyFormGroup(): FormGroup {
    return this.fb.group({
      checkBox: [''],
      chkBoxKey: [''],
      chkBoxValue: [''],
    });
  }

  setCheckBoxProperty(taskCountResult: Map<string, number>): FormArray {
    const formArray = new FormArray([]);
    Object.entries(taskCountResult).forEach((d) => {
      formArray.push(
        this.fb.group({
          checkBox: true,
          chkBoxKey: d[0],
          chkBoxValue: d[1],
        })
      );
    });
    return formArray;
  }

  taskBackward(): void {
    this.isTaskForward = true;
    this.index = this.index - 1;
    if (this.index === 0) {
      this.isTaskBackward = false;
    }
  }

  taskForward(): void {
    this.isTaskBackward = true;
    this.index = this.index + 1;
    if (this.index === this.taskCounts.length - 5) {
      this.isTaskForward = false;
    }
  }

  getTaskCount(): void {
    this.isLoadTaskCountSpinner = true;
    this.hrDashboardService.getHRDashboardTaskCount().subscribe(
      (data) => {
        this.taskCountResult = data?.result;
        this.taskCountResultMap = new Map(Object.entries(data?.result));
        this.isLoadTaskCountSpinner = false;
        this.taskForm.setControl(
          'chkBoxProperty',
          this.setCheckBoxProperty(this.taskCountResult)
        );
        this.taskCounts = [];
        this.taskCounts?.push(
          {
            key: 'ADP Integration Failed',
            value: this.taskCountResultMap.get('ADP Integration Failed'),
          },
          {
            key: 'I-9 Management',
            value: this.taskCountResultMap.get('I-9 Management'),
          },
          {
            key: 'Passport Expiring',
            value: this.taskCountResultMap.get('Passport Expiring'),
          },
          {
            key: 'STEM OPT Expiring',
            value: this.taskCountResultMap.get('STEM OPT Expiring'),
          },
          {
            key: 'OPT on Bench',
            value: this.taskCountResultMap.get('OPT on Bench'),
          },
          {
            key: 'H1-B Visa Expiring',
            value: this.taskCountResultMap.get('H1-B Visa Expiring'),
          },
          {
            key: 'PO Expiring',
            value: this.taskCountResultMap.get('PO Expiring'),
          }
        );

        if (this.taskCounts?.length <= 5) {
          this.isTaskForward = false;
        }
      },
      (err) => {
        this.isLoadTaskCountSpinner = false;
        console.warn(err);
      }
    );
  }

  toggle(): void {
    this.toggleDiv = !this.toggleDiv;
  }

  saveCheckBoxSelection(): void {
    this.taskCounts = [];
    this.index = 0;
    for (const chkVal of this.chkBoxProperty?.controls) {
      if (chkVal?.get('checkBox')?.value) {
        this.taskCounts.push({
          key: chkVal?.get('chkBoxKey')?.value,
          value: chkVal?.get('chkBoxValue')?.value,
        });
      }
    }
    if (this.taskCounts.length <= 3) {
      this.isTaskForward = false;
    } else {
      this.isTaskForward = true;
    }
    if (this.index === 0) {
      this.isTaskBackward = false;
    }
    this.toggleDiv = !this.toggleDiv;
  }

  redirectToAdpDetails(): void {
    this.router.navigate(['/aura/hr/mytask-adp'], {});
  }

  redirectToUSCISDetails(): void {
    this.router.navigate(['/aura/hr/mytask-uscis'], {});
  }

  redirectToDetails(cardType: string): void {
    switch (cardType) {
      case 'ADP Integration Failed':
        this.router.navigate(['/aura/hr/mytask-adp'], {});
        break;
      case 'I-9 Management':
        this.router.navigate(['/aura/hr/mytask-uscis'], {});
        break;
      case 'Passport Expiring':
        this.router.navigate(['/aura/hr/mytask-passport'], {});
        break;
      case 'STEM OPT Expiring':
        this.router.navigate(['/aura/hr/stem-opt'], {});
        break;
      case 'OPT on Bench':
        this.router.navigate(['/aura/hr/opt-bench'], {});
        break;
      case 'H1-B Visa Expiring':
        this.router.navigate(['/aura/hr/visa-expiring'], {});
        break;
      case 'PO Expiring':
        this.router.navigate(['/aura/hr/po-expiring'], {});
        break;
    }
  }
}

