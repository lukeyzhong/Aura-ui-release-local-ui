import { Component, OnInit } from '@angular/core';
import {
  ComponentLevelPermissionsResult,
  HRDashboardComponents,
  HRDashboardMenus,
} from 'src/app/shared/interface/component-level-permissions.interface';
import { ComponentLevelPermissionsService } from '../../../../shared/service/permissions/component-level-permissions.service';

@Component({
  selector: 'app-hr-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  infoType = 'HR';
  //  menuId = '0a23fa4d-e935-46d9-9a02-7d811f718861';
  menuId = '';
  componentLevelPermissionsResult!: ComponentLevelPermissionsResult[];
  isLoading = false;
  constructor(
    private componentLevelPermissionsService: ComponentLevelPermissionsService
  ) {}

  ngOnInit(): void {
    this.setPermissionsByMenuId(HRDashboardMenus.Dashboard);
  }

  setPermissionsByMenuId(menuId: string): void {
    this.isLoading = true;
    this.componentLevelPermissionsService
      .getComponentLevelPermissionsByMenuId(menuId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.componentLevelPermissionsResult = data?.result;
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
        }
      );
  }

  isVisible(code: string): boolean {
    return (
      this.componentLevelPermissionsResult &&
      this.componentLevelPermissionsResult?.some(
        (comPerm) => comPerm?.code === code
      )
    );
  }

  // tslint:disable-next-line: no-any
  public get HRDashboardComponents(): any {
    return HRDashboardComponents;
  }
}
