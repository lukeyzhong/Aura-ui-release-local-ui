import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HRModule } from '../hr/hr.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { HomeRoutingModule } from './home-routing.module';

import { EmployeeInterviewsComponent } from './components/dashboard/employee-interviews/employee-interviews.component';
import { TimeSheetsComponent } from './components/dashboard/time-sheets/time-sheets.component';
import { RecentActivityComponent } from './components/dashboard/recent-activity/recent-activity.component';

import { TimesheetTableDetailsComponent } from './components/dashboard/time-sheets/timesheet-table-details/timesheet-table-details.component';
import { PtoChartComponent } from './components/dashboard/pto-chart/pto-chart.component';
import { TotalhoursChartComponent } from './components/dashboard/totalhours-chart/totalhours-chart.component';
import { OfferDeclinedComponent } from './components/dashboard/offer-declined/offer-declined.component';

@NgModule({
  declarations: [
    DashboardComponent,
    EmployeeInterviewsComponent,
    TimeSheetsComponent,
    RecentActivityComponent,
    TimesheetTableDetailsComponent,
    PtoChartComponent,
    TotalhoursChartComponent,
    OfferDeclinedComponent,
  ],
  imports: [HomeRoutingModule, SharedModule, HRModule],
})
export class HomeModule {}
