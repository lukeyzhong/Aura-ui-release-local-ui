import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TrainingRoutingModule } from './training-routing.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    TrainingRoutingModule
  ]
})
export class TrainingModule { }
