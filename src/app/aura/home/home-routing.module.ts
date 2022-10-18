import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyDocumentsComponent } from '../../shared/components/my-documents/my-documents.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { OfferDeclinedComponent } from './components/dashboard/offer-declined/offer-declined.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'me',
  },
  {
    path: 'me',
    component: DashboardComponent,
  },
  {
    path: 'offer-declined',
    component: OfferDeclinedComponent,
  },
  {
    path: 'my-documents',
    component: MyDocumentsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule { }
