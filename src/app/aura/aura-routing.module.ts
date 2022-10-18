import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuraComponent } from './components/aura.component';

const routes: Routes = [
  {
    path: '',
    component: AuraComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadChildren: () =>
          import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./admin/admin.module').then((m) => m.AdminModule),
      },
      {
        path: 'hr',
        loadChildren: () => import('./hr/hr.module').then((m) => m.HRModule),
      },
      {
        path: 'recruitment',
        loadChildren: () =>
          import('./recruitment/recruitment.module').then(
            (m) => m.RecruitmentModule
          ),
      },
      {
        path: 'training',
        loadChildren: () =>
          import('./training/training.module').then((m) => m.TrainingModule),
      },
      {
        path: 'search',
        loadChildren: () =>
          import('./search/search.module').then((m) => m.SearchModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuraRoutingModule {}
