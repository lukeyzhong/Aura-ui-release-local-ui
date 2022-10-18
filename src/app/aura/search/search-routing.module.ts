import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CandidateProfileComponent } from './components/candidate-profile/candidate-profile.component';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { GlobalSearchResultAllComponent } from './components/global-search-result-all/global-search-result-all.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'GlobalSearchResultAllComponent',
    },
    {
        path: '',
        component: GlobalSearchResultAllComponent,
    },
    {
        path: 'employee',
        component: EmployeeProfileComponent,
    },
    {
        path: 'candidate',
        component: CandidateProfileComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SearchRoutingModule { }
