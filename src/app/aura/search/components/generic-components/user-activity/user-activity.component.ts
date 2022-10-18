import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CsvUtilityService } from '../../../../../shared/service/utility/csv-utility.service';
import { FormControl } from '@angular/forms';
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { UserActivityResult } from '../../../../search/interface/user-activity.interface';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss'],
})
export class UserActivityComponent implements OnInit {
  // GET User Activities
  userActivityResult!: UserActivityResult[];
  isLoading = false;
  id!: string;
  indexNumber!: number;
  tempIndex!: number;
  displayedColumns = [
    'Date & Time',
    'Activity Category',
    'Activity Description',
    'Activity By',
  ];
  // tslint:disable-next-line: no-any
  excelTableData: any;
  mapUACatergoryList = new Map<string, string>();
  categoryNames = new FormControl([]);
  selectedCategories: string[] = [];
  resourceTypeCode!: number;
  pageName = '';

  constructor(
    private csvUtilityService: CsvUtilityService,
    private genericProfileApiService: GenericProfileApiService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<UserActivityComponent>
  ) {
    this.id = data?.obj?.id;
    this.pageName = data?.obj?.pageName;
  }

  ngOnInit(): void {
    this.setUserActivityById(this.id, this.pageName);
  }

  setUserActivityById(
    id: string,
    pageName: string,
    filter: string[] = []
  ): void {
    this.isLoading = true;
    switch (pageName) {
      case 'Employee':
        this.resourceTypeCode = 7;
        break;
      case 'Candidate':
        this.resourceTypeCode = 5;
        break;
    }
    this.genericProfileApiService
      .getUserActivityById(this.resourceTypeCode, id, filter)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.isLoading = false;
            this.userActivityResult = data?.result;

            for (const activity of data?.result) {
              this.mapUACatergoryList.set(
                activity?.userActivityType?.userActivityTypeCategoryCode,
                activity?.userActivityType?.userActivityTypeCategory
              );
            }
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  closeUserActivity(): void {
    this.dialogRef.close('cancel');
  }

  showActivityText(i: number): void {
    if (this.tempIndex === i) {
      this.indexNumber = -1;
      this.tempIndex = -1;
    } else {
      this.indexNumber = i;
      this.tempIndex = i;
    }
  }

  bindCSSFromDB(index: number): string {
    let customClass = '';
    for (let i = 0; i < this.userActivityResult?.length; i++) {
      if (i === index) {
        customClass = this.userActivityResult[i]?.userActivityType?.cssClass;
        break;
      }
    }
    return customClass;
  }

  exportToCSV(): void {
    this.excelTableData = this.userActivityResult?.map((item, index) => {
      return {
        'Date & Time': item?.activityOn,
        'Activity Category': item?.userActivityType?.name,
        'Activity Description': item?.activityText,
        'Activity By': item?.activityBy,
      };
    });

    this.csvUtilityService.exportToCSV(
      this.excelTableData,
      this.displayedColumns,
      'User Activity'
    );
  }

  removeChip(index: string): void {
    let categoryList = this.categoryNames?.value as string[];
    categoryList = categoryList?.filter((category) => category !== index);
    this.categoryNames?.setValue(categoryList);

    const filter = [];
    for (const entry of this.mapUACatergoryList?.entries()) {
      for (const category of categoryList) {
        if (entry[1] === category) {
          filter?.push(entry[0]);
        }
      }
    }
    this.setUserActivityById(this.id, this.pageName, filter);
  }

  clearAllChips(): void {
    this.categoryNames.setValue([]);
    this.setUserActivityById(this.id, this.pageName);
  }

  chooseCategories(categories: string[]): void {
    const filter = [];
    for (const entry of this.mapUACatergoryList?.entries()) {
      for (const category of categories) {
        if (entry[1] === category) {
          filter.push(entry[0]);
        }
      }
    }
    this.setUserActivityById(this.id, this.pageName, filter);
  }
}
