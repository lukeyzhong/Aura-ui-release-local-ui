import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RolesComponent } from './components/roles/roles.component';
import { AdminRoutingModule } from './admin-routing.module';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { SettingsComponent } from './components/settings/settings.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { SharedModule } from '../../shared/shared.module';
import { UserAssignPermissionsComponent } from './components/user-management/user-assign-permissions/user-assign-permissions.component';
import { AddNewUserComponent } from './components/user-management/add-new-user/add-new-user.component';
import { AddGroupUserComponent } from './components/user-management/add-group-user/add-group-user.component';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@NgModule({
  declarations: [
    DashboardComponent,
    RolesComponent,
    PermissionsComponent,
    SettingsComponent,
    UserManagementComponent,
    UserAssignPermissionsComponent,
    AddNewUserComponent,
    AddGroupUserComponent,
  ],
  imports: [AdminRoutingModule, FormsModule, SharedModule],
  providers: [
    {
      provide: MatDialogRef,
      useValue: {},
    },
  ],
})
export class AdminModule {}
