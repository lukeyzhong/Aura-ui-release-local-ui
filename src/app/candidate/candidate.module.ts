import { NgModule } from '@angular/core';
import { CandidateDashboardComponent } from './components/candidate-dashboard/candidate-dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { CandidateOnboardingComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding.component';
import { OfferLetterComponent } from './components/candidate-dashboard/candidate-onboarding/offer-letter/offer-letter.component';
import { OfferRejectComponent } from './components/candidate-dashboard/candidate-onboarding/offer-letter/offer-reject/offer-reject.component';
import { CandidateOnboardingWorkflowComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-onboarding-workflow.component';
import { WorkEligibiltyI9Component } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/work-eligibilty-i9/work-eligibilty-i9.component';
import { TaxInformationComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/tax-information/tax-information.component';
import { OnboardingInformationComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/onboarding-information/onboarding-information.component';
import { CandidatePreviewTabComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-preview-tab/candidate-preview-tab.component';
import { CandidatePersonalInformationTabComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-personal-information-tab/candidate-personal-information-tab.component';
import { CandidateOnboardingDocumentsTabComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-onboarding-documents-tab/candidate-onboarding-documents-tab.component';
import { CandidateEmergencyContactComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-emergency-contact/candidate-emergency-contact.component';
import { BanksPaychecksComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/banks-paychecks/banks-paychecks.component';
import { CandidateRoutingModule } from './candidate-routing.module';
import { DatePipe } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { HomeComponent } from './components/candidate-dashboard/home/home.component';
import { HomeModule } from '../aura/home/home.module';

@NgModule({
  declarations: [
    CandidateDashboardComponent,
    CandidateOnboardingComponent,
    OfferLetterComponent,
    OfferRejectComponent,
    CandidateOnboardingWorkflowComponent,
    WorkEligibiltyI9Component,
    TaxInformationComponent,
    OnboardingInformationComponent,
    CandidatePreviewTabComponent,
    CandidatePersonalInformationTabComponent,
    CandidateOnboardingDocumentsTabComponent,
    CandidateEmergencyContactComponent,
    BanksPaychecksComponent,
    HomeComponent,
  ],
  imports: [CandidateRoutingModule, HomeModule, SharedModule],
  providers: [
    DatePipe,
    {
      provide: MatDialogRef,
      useValue: {},
    },
  ],
})
export class CandidateModule {}
