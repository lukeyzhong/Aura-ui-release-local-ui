import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidateOnboardingWorkflowComponent } from '../../candidate/components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-onboarding-workflow.component';
import { BenefitsComponent } from './components/benefits/benefits.component';
import { DashboardMytaskAdpComponent } from './components/dashboard/dashboard-mytask-adp/dashboard-mytask-adp.component';
import { DashboardMytaskUscisComponent } from './components/dashboard/dashboard-mytask-uscis/dashboard-mytask-uscis.component';
import { HrVerifyComponent } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MytasksPassportExpiringComponent } from './components/dashboard/mytasks-passport-expiring/mytasks-passport-expiring.component';
import { OptBenchComponent } from './components/dashboard/opt-bench/opt-bench.component';
import { PoExpiringComponent } from './components/dashboard/po-expiring/po-expiring.component';
import { StemOptExpiringComponent } from './components/dashboard/stem-opt-expiring/stem-opt-expiring.component';
import { VisaExpiringComponent } from './components/dashboard/visa-expiring/visa-expiring.component';
import { ManageEmployeesComponent } from './components/manage-employees/manage-employees.component';
import { OnBoardingComponent } from './components/on-boarding/on-boarding.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { ReportsComponent } from './components/reports/reports.component';
import { LeaveManagementComponent } from './components/time/leave-management/leave-management.component';
import { TimeSheetComponent } from './components/time/time-sheet/time-sheet.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'on-boarding',
    component: OnBoardingComponent,
  },
  {
    path: 'mytask-adp',
    component: DashboardMytaskAdpComponent,
  },
  {
    path: 'mytask-uscis',
    component: DashboardMytaskUscisComponent,
  },
  {
    path: 'mytask-passport',
    component: MytasksPassportExpiringComponent,
  },
  {
    path: 'stem-opt',
    component: StemOptExpiringComponent,
  },
  {
    path: 'opt-bench',
    component: OptBenchComponent,
  },
  {
    path: 'visa-expiring',
    component: VisaExpiringComponent,
  },
  {
    path: 'po-expiring',
    component: PoExpiringComponent,
  },
  {
    path: 'candidate-on-boarding',
    component: CandidateOnboardingWorkflowComponent,
  },
  {
    path: 'time',
    children: [
      // { path: '', redirectTo: 'time-sheets', pathMatch: 'full' },
      { path: 'time-sheets', component: TimeSheetComponent },
      { path: 'leave-management', component: LeaveManagementComponent },
    ],
  },
  {
    path: 'manage-employees',
    component: ManageEmployeesComponent,
  },
  {
    path: 'benefits',
    component: BenefitsComponent,
  },
  {
    path: 'hr-verify',
    component: HrVerifyComponent,
  },
  {
    path: 'payroll',
    component: PayrollComponent,
  },

  {
    path: 'performance',
    component: PerformanceComponent,
  },
  {
    path: 'reports',
    component: ReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HRRoutingModule { }
