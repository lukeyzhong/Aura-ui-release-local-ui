import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidateDashboardComponent } from './components/candidate-dashboard/candidate-dashboard.component';
import { CandidateOnboardingWorkflowComponent } from './components/candidate-dashboard/candidate-onboarding/candidate-onboarding-workflow/candidate-onboarding-workflow.component';
import { OfferLetterComponent } from './components/candidate-dashboard/candidate-onboarding/offer-letter/offer-letter.component';
import { HomeComponent } from './components/candidate-dashboard/home/home.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    component: CandidateDashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'on-boarding/:id',
        component: CandidateOnboardingWorkflowComponent,
      },
      {
        path: 'offer-letter',
        component: OfferLetterComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CandidateRoutingModule {}
