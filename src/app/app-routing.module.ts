import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { ChangePasswordComponent } from './core/components/change-password/change-password.component';
import { LoginComponent } from './core/components/Login/Login.component';
import { PageNotFoundComponent } from './core/components/page-not-found/page-not-found.component';
import { PasswordResetComponent } from './core/components/password-reset/password-reset.component';
import { RegisterComponent } from './core/components/register/register.component';
import { AuthGuard } from './core/guard/auth.guard';
import { DebugApiComponent } from './shared/components/debug-api/debug-api.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'aura',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'candidate',
    loadChildren: () => import('./candidate/candidate.module').then((m) => m.CandidateModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'aura',
    loadChildren: () => import('./aura/aura.module').then((m) => m.AuraModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'pwd-reset',
    component: PasswordResetComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'change-pwd',
    component: ChangePasswordComponent,
  },
  {
    path: 'upsert-endpt',
    component: DebugApiComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      // enableTracing: true,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
