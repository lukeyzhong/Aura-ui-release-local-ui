import { NgModule } from '@angular/core';
import { HRRoutingModule } from './hr-routing.module';
import { OnBoardingComponent } from './components/on-boarding/on-boarding.component';
import { TimeComponent } from './components/time/time.component';
import { ManageEmployeesComponent } from './components/manage-employees/manage-employees.component';
import { BenefitsComponent } from './components/benefits/benefits.component';
import { PayrollComponent } from './components/payroll/payroll.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { ReportsComponent } from './components/reports/reports.component';
import { LeaveManagementComponent } from './components/time/leave-management/leave-management.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { PayrollCalendarDialogComponent } from './components/dashboard/payroll-calendar/payroll-calendar-dialog/payroll-calendar-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { PayrollCalendarComponent } from './components/dashboard/payroll-calendar/payroll-calendar.component';
import { ProjectOnboardingComponent } from './components/dashboard/project-onboarding/project-onboarding.component';
import { ProjectOnboardingDialogComponent } from './components/dashboard/project-onboarding/project-onboarding-dialog/project-onboarding-dialog.component';
import { BirthdayAnnivarsaryComponent } from './components/dashboard/birthday-annivarsary/birthday-annivarsary.component';
import { BirthdayDetailsComponent } from './components/dashboard/birthday-annivarsary/birthday-details/birthday-details.component';
import { DashboardHolidaysComponent } from './components/dashboard/dashboard-holidays/dashboard-holidays.component';
import { HolidaysDetailsComponent } from './components/dashboard/dashboard-holidays/holidays-details/holidays-details.component';
import { AnniversaryDetailsComponent } from './components/dashboard/birthday-annivarsary/anniversary-details/anniversary-details.component';
import { ActiveEmpDetailsComponent } from './components/dashboard/dashboard-charts/active-emp-details/active-emp-details.component';
import { DashboardOnboardingComponent } from './components/dashboard/dashboard-onboarding/dashboard-onboarding.component';
import { DashboardMytasksComponent } from './components/dashboard/dashboard-mytasks/dashboard-mytasks.component';
import { OnboardingDetailsComponent } from './components/dashboard/dashboard-onboarding/onboarding-details/onboarding-details.component';
// tslint:disable-next-line: max-line-length
import { DetailsPanelComponent } from './components/dashboard/dashboard-onboarding/onboarding-details/details-panel/details-panel.component';
import { PersonalInfoTabComponent } from './components/on-boarding/personal-info-tab/personal-info-tab.component';
import { EmploymentDetailsTabComponent } from './components/on-boarding/employment-details-tab/employment-details-tab.component';
import { CompensationTabComponent } from './components/on-boarding/compensation-tab/compensation-tab.component';
import { DocumentsTabComponent } from './components/on-boarding/documents-tab/documents-tab.component';
import { PreviewTabComponent } from './components/on-boarding/preview-tab/preview-tab.component';
import { SendOfferTabComponent } from './components/on-boarding/send-offer-tab/send-offer-tab.component';
import { NewHiresDetailsComponent } from './components/dashboard/dashboard-charts/new-hires-details/new-hires-details.component';
import { AttritionDetailsComponent } from './components/dashboard/dashboard-charts/attrition-details/attrition-details.component';
import { EmpTableDetailsComponent } from './components/dashboard/dashboard-charts/emp-table-details/emp-table-details.component';
import { TaskDetailsComponent } from './components/dashboard/dashboard-mytasks/task-details/task-details.component';
import { QuickLinksComponent } from './components/dashboard/quick-links/quick-links.component';
import { OnBoardingStatusComponent } from './components/dashboard/dashboard-onboarding/on-boarding-status/on-boarding-status.component';
import { HrVerifyComponent } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify.component';
import { PersonalInfoComponent } from './components/dashboard/dashboard-onboarding/hr-verify/personal-info/personal-info.component';
import { IdentificationInformationComponent } from './components/dashboard/dashboard-onboarding/hr-verify/identification-information/identification-information.component';
import { EducationInfoComponent } from './components/dashboard/dashboard-onboarding/hr-verify/education-info/education-info.component';
import { EmergencyContactsComponent } from './components/dashboard/dashboard-onboarding/hr-verify/emergency-contacts/emergency-contacts.component';
import { CompensationInfoComponent } from './components/dashboard/dashboard-onboarding/hr-verify/compensation-info/compensation-info.component';
import { BankPaycheckComponent } from './components/dashboard/dashboard-onboarding/hr-verify/bank-paycheck/bank-paycheck.component';
import { HrVerifyWorkEligibilityI9Component } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify-work-eligibility-i9/hr-verify-work-eligibility-i9.component';
import { CaseResultsComponent } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify-work-eligibility-i9/case-results/case-results.component';
import { HrVerifyDocumentsComponent } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify-documents/hr-verify-documents.component';
import { HrVerifyTaxInformationComponent } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify-tax-information/hr-verify-tax-information.component';
import { HrVerifySendEmailComponent } from './components/dashboard/dashboard-onboarding/hr-verify/hr-verify-send-email/hr-verify-send-email.component';
import { DashboardActiveEmpChartsComponent } from './components/dashboard/dashboard-charts/dashboard-active-emp-charts/dashboard-active-emp-charts.component';
import { DashboardNewEmpChartsComponent } from './components/dashboard/dashboard-charts/dashboard-new-emp-charts/dashboard-new-emp-charts.component';
import { DashboardAttritionEmpChartsComponent } from './components/dashboard/dashboard-charts/dashboard-attrition-emp-charts/dashboard-attrition-emp-charts.component';
import { DashboardMytasksCountsComponent } from './components/dashboard/dashboard-mytasks-counts/dashboard-mytasks-counts.component';
import { TimeSheetComponent } from './components/time/time-sheet/time-sheet.component';
import { DashboardMytaskAdpComponent } from './components/dashboard/dashboard-mytask-adp/dashboard-mytask-adp.component';
import { AdpTableDetailsComponent } from './components/dashboard/dashboard-mytask-adp/adp-table-details/adp-table-details.component';
import { DashboardMytaskUscisComponent } from './components/dashboard/dashboard-mytask-uscis/dashboard-mytask-uscis.component';
// tslint:disable-next-line: max-line-length
import { UscisTableDetailsComponent } from './components/dashboard/dashboard-mytask-uscis/uscis-table-details/uscis-table-details.component';
import { AdpUpdateComponent } from './components/dashboard/dashboard-mytask-adp/adp-update/adp-update.component';
import { UscisUpdateComponent } from './components/dashboard/dashboard-mytask-uscis/uscis-update/uscis-update.component';
import { MytasksPassportExpiringComponent } from './components/dashboard/mytasks-passport-expiring/mytasks-passport-expiring.component';
import { StemOptExpiringComponent } from './components/dashboard/stem-opt-expiring/stem-opt-expiring.component';
import { OptBenchComponent } from './components/dashboard/opt-bench/opt-bench.component';
import { VisaExpiringComponent } from './components/dashboard/visa-expiring/visa-expiring.component';
import { PoExpiringComponent } from './components/dashboard/po-expiring/po-expiring.component';

@NgModule({
  declarations: [
    DashboardComponent,
    OnBoardingComponent,
    TimeComponent,
    ManageEmployeesComponent,
    BenefitsComponent,
    PayrollComponent,
    PerformanceComponent,
    ReportsComponent,
    LeaveManagementComponent,
    PayrollCalendarDialogComponent,
    PayrollCalendarComponent,
    BirthdayAnnivarsaryComponent,
    BirthdayDetailsComponent,
    DashboardHolidaysComponent,
    HolidaysDetailsComponent,
    ProjectOnboardingComponent,
    ProjectOnboardingDialogComponent,
    AnniversaryDetailsComponent,
    PersonalInfoTabComponent,
    EmploymentDetailsTabComponent,
    CompensationTabComponent,
    DocumentsTabComponent,
    PreviewTabComponent,
    SendOfferTabComponent,
    ActiveEmpDetailsComponent,
    DashboardOnboardingComponent,
    DashboardMytasksComponent,
    OnboardingDetailsComponent,
    DetailsPanelComponent,
    NewHiresDetailsComponent,
    AttritionDetailsComponent,
    EmpTableDetailsComponent,
    TaskDetailsComponent,
    QuickLinksComponent,
    OnBoardingStatusComponent,
    HrVerifyComponent,
    PersonalInfoComponent,
    IdentificationInformationComponent,
    EducationInfoComponent,
    EmergencyContactsComponent,
    CompensationInfoComponent,
    BankPaycheckComponent,
    HrVerifyWorkEligibilityI9Component,
    HrVerifyDocumentsComponent,
    CaseResultsComponent,
    HrVerifyDocumentsComponent,
    HrVerifyTaxInformationComponent,
    HrVerifySendEmailComponent,
    DashboardActiveEmpChartsComponent,
    DashboardNewEmpChartsComponent,
    DashboardAttritionEmpChartsComponent,
    DashboardMytasksCountsComponent,
    TimeSheetComponent,
    DashboardMytaskAdpComponent,
    AdpTableDetailsComponent,
    DashboardMytaskUscisComponent,
    UscisTableDetailsComponent,
    AdpUpdateComponent,
    UscisUpdateComponent,
    MytasksPassportExpiringComponent,
    StemOptExpiringComponent,
    OptBenchComponent,
    VisaExpiringComponent,
    PoExpiringComponent,
  ],
  imports: [HRRoutingModule, SharedModule],
  exports: [
    PayrollCalendarComponent,
    DashboardHolidaysComponent,
    QuickLinksComponent,
  ],
  // providers: [
  //   DatePipe,
  //   {
  //     provide: MatDialogRef,
  //     useValue: {},
  //   },
  // ],
})
export class HRModule {}
