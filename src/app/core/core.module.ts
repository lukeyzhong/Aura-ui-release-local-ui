import {
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './components/Login/Login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptorService } from './service/error-interceptor.service';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AuraModule } from '../aura/aura.module';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseHeaderComponent } from './components/base-header/base-header.component';
import { RegisterComponent } from './components/register/register.component';

@NgModule({
  declarations: [
    LoginComponent,
    PageNotFoundComponent,
    PasswordResetComponent,
    ChangePasswordComponent,
    BaseHeaderComponent,
    RegisterComponent,
  ],
  imports: [SharedModule, AuraModule],
  exports: [LoginComponent, PageNotFoundComponent, RegisterComponent],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        //  {provide: AuthConfig, useValue: oauthConifg},
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptorService,
          multi: true,
        },
      ],
    };
  }

  constructor(
    @Optional() @SkipSelf() parentModule: CoreModule,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }

    const imgDir = './assets/svg/global-module-navigation';
    const svgIconFileNames = [
      'Me',
      'Dashboard',
      'Onboarding',
      'Time',
      'Manage Employees',
      'Benefits',
      'Payroll',
      'Performance',
      'Reports',
      'User Management',
      'Roles',
      'Permissions',
      'Settings',
      'Batch Management',
      'Evaluation',
      'Manage Candidates',
      'Training Schedules',
      'Job Posting',
      'Tracker',
      'Interviews',
    ];

    for (const svg of svgIconFileNames) {
      this.iconRegistry.addSvgIcon(
        svg,
        this.sanitizer.bypassSecurityTrustResourceUrl(`${imgDir}/${svg}.svg`)
      );
    }
  }
}
