import { Component, OnInit } from '@angular/core';
import { UserInfoResult } from '../../../interface/all-users.interface';
import { UserManagementService } from '../../../service/user-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AllFeaturesResult } from '../../../interface/all-features.interface';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-user-assign-permissions',
  templateUrl: './user-assign-permissions.component.html',
  styleUrls: ['./user-assign-permissions.component.scss'],
})
export class UserAssignPermissionsComponent implements OnInit {
  userId = '';
  userInfoResult!: UserInfoResult;
  mapFeaturesCategory = new Map<number, string>();
  allFeaturesResult!: AllFeaturesResult[];
  featuresResult!: AllFeaturesResult[];
  // tslint:disable-next-line: no-any
  filteredFeaturesSubCategoryResult: any = [];
  mapFilteredFeatureSubCategory = new Map<number, AllFeaturesResult[]>();
  subCategoryPermissionListAbbr = new Map<string, boolean>();
  subCategoryPermissionList: string[] = [];
  deletedPermissionsList: string[] = [];
  featureCategoryCode = 0;

  constructor(
    private userManagementService: UserManagementService,
    private route: ActivatedRoute,
    private matNotificationService: MatNotificationService,
    private router: Router,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog
  ) {
    this.route.params.subscribe((params) => {
      this.userId = params.userId;
    });
  }

  ngOnInit(): void {
    this.setFeaturesResult();
    this.setUserInfo();
    this.setFeaturesCategory();
  }
  setFeaturesResult(): void {
    this.userManagementService.getAllFeatures(this.userId).subscribe(
      (data) => {
        this.featuresResult = data?.result;
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  setFeaturesCategory(): void {
    this.userManagementService.getFeatureCategoryCode().subscribe((data) => {
      for (const category of data?.result) {
        this.mapFeaturesCategory.set(
          category?.lookupCode,
          category?.description
        );
      }
    });
  }
  setUserInfo(): void {
    this.userManagementService.getUserInfo(this.userId).subscribe(
      (data) => {
        this.userInfoResult = data?.result;
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  showFeatureSubCategories(event: MatTabChangeEvent): void {
    const tab = event.tab.textLabel;

    if (this.featureCategoryCode === 0) {
      this.featureCategoryCode = 1;
    } else {
      for (const [k, v] of this.mapFeaturesCategory) {
        if (v === tab) {
          this.featureCategoryCode = k;
          break;
        }
      }
    }

    this.allFeaturesResult = this.featuresResult?.filter(
      (feature) => feature?.featureCategoryCode === this.featureCategoryCode
    );

    if (this.allFeaturesResult) {
      const groupByFeatureSubCategory = new Set(
        this.allFeaturesResult?.map(
          (item: AllFeaturesResult) => item?.featureSubCategory
        )
      );
      this.filteredFeaturesSubCategoryResult = [];
      groupByFeatureSubCategory?.forEach((g) =>
        this.filteredFeaturesSubCategoryResult?.push({
          key: g,
          featuresSubCategoryList: this.allFeaturesResult?.filter(
            (i: AllFeaturesResult) => i?.featureSubCategory === g
          ),
        })
      );
    }
  }

  getSubCategoryFeaturesCount(
    featuresSubCategoryList: AllFeaturesResult[]
  ): number {
    let count = 0;

    featuresSubCategoryList?.map((features) => {
      if (features?.hasPermission === true) {
        count++;
      }
    });

    return count++;
  }
  parsePhoneNumber(phoneNumber: string | undefined): string {
    let parsedPhoneNumber = '';

    if (phoneNumber) {
      if (phoneNumber === null) {
        parsedPhoneNumber = '-';
      } else {
        const countryCode = phoneNumber.substr(0, 2);
        if (countryCode === null) {
          parsedPhoneNumber =
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        } else {
          parsedPhoneNumber =
            countryCode +
            '(' +
            phoneNumber.substr(2, 3) +
            ') ' +
            phoneNumber.substr(5, 3) +
            '-' +
            phoneNumber.substr(8, 4);
        }
      }
    }
    return parsedPhoneNumber;
  }

  saveUserPermission(): void {
    this.subCategoryPermissionList = [];

    for (const feature of this.featuresResult) {
      if (feature?.hasPermission === true) {
        this.subCategoryPermissionList?.push(feature.abbr.toString());
      }
    }

    for (const [k, v] of this.subCategoryPermissionListAbbr) {
      if (v === true) {
        this.subCategoryPermissionList.push(k);
      }
    }

    this.userManagementService
      .saveUserPermission(this.userId, this.subCategoryPermissionList)
      .subscribe(
        (res) => {
          if (res?.errorCode === 0) {
            this.matNotificationService.success(
              ':: User Permissions updated successfully'
            );
            this.router.navigate(['/aura/admin/user-management']);
          } else {
            this.matNotificationService.warn(':: Error: ' + res?.errorMessage);
          }
        },
        (error) => {
          this.matNotificationService.showSnackBarMessage(
            'Oops! Request has failed',
            'error'
          );
        }
      );
  }

  onChangeSubCategory(event: MatCheckboxChange, abbr: string): void {
    this.subCategoryPermissionListAbbr?.set(abbr, event.checked);
  }

  goBack(): void {
    this.dialogRef = this.dialogConfirm.open(ConfirmationDialogComponent, {
      disableClose: false,
    });

    this.dialogRef.componentInstance.confirmMessage =
      'Are you sure, you want to cancel the changes made?';
    this.dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.router.navigate(['/aura/admin/user-management']);
      }
    });
  }
}
