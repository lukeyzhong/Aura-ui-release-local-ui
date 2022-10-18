import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RecruitmentRoutingModule } from './recruitment-routing.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    RecruitmentRoutingModule
  ]
})
export class RecruitmentModule { }
