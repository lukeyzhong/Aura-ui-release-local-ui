import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HrDashboardService } from '../../../../service/dashboard/hr-dashboard.service';
import { CsvUtilityService } from '../../../../../../shared/service/utility/csv-utility.service';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import {
  FetchType,
  ProjectOnboardingConfig,
  ProjectOnboardingResults,
} from '../../../../interface/dashboard/project-onboarding.interface';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DownloadToExcelOrCSV } from '../../../../../../shared/interface/document-info.interface';

@Component({
  selector: 'app-project-onboarding-dialog',
  templateUrl: './project-onboarding-dialog.component.html',
  styleUrls: ['./project-onboarding-dialog.component.scss'],
})
export class ProjectOnboardingDialogComponent implements OnInit {
  projectOnboardingPanelConfig: ProjectOnboardingConfig = {
    isLoading: true,
    displayedColumns: [
      'position',
      'displayPicture',
      'empCode',
      'firstName',
      'lastName',
      'jobTitle',
      'client',
      'endClient',
      'billRate',
      'projectStartDate',
      'workLocation',
      'confirmedBy',
    ],
    columns: [
      {
        headerDisplay: 'S.no',
        key: 'position',
      },
      {
        headerDisplay: 'Emp',
        key: 'displayPicture',
      },
      {
        headerDisplay: 'ID',
        key: 'empCode',
      },
      {
        headerDisplay: 'First Name',
        key: 'firstName',
      },
      {
        headerDisplay: 'Last Name',
        key: 'lastName',
      },
      {
        headerDisplay: 'Job Title',
        key: 'jobTitle',
      },
      {
        headerDisplay: 'Client',
        key: 'client',
      },
      {
        headerDisplay: 'End Client',
        key: 'endClient',
      },
      {
        headerDisplay: 'Bill Rate',
        key: 'billRate',
      },
      {
        headerDisplay: 'Project Start Date',
        key: 'projectStartDate',
      },
      {
        headerDisplay: 'Work Location',
        key: 'workLocation',
      },
      {
        headerDisplay: 'Confirmed By',
        key: 'confirmedBy',
      },
    ],
    tableData: null,
    totalRows: 0,
  };
  projectOnBoardingResult!: ProjectOnboardingResults[];
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  // tslint:disable-next-line: no-any
  excelTableData: any;

  virtualCount = 0;
  pageSizeOptions = [10, 20, 30, 40, 50];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  enableSearch = true;

  pageNum = 1;
  pageSize = 10;
  fetchAll = true;
  startDate: string | null = '';
  endDate: string | null | Date = '';
  searchText = '';
  dateFilter!: FormGroup;
  currentDate!: Date;

  downloadType = 'datagrid';
  typeName = 'ProjectOnboarding';
  searchKey = 'searchterm';
  key1 = 'StartDate';
  value1 = '';
  key2 = 'EndDate';
  value2 = '';

  constructor(
    private datepipe: DatePipe,
    private documentsService: DocumentsService,
    private dateFilterBuilder: FormBuilder,
    private hrDashboardService: HrDashboardService,
    private csvUtilityService: CsvUtilityService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>
  ) {
    this.projectOnBoardingResult = data?.obj?.projOnboardingData;
    if (this.projectOnBoardingResult) {
      this.virtualCount = data?.obj?.virtualCount;
      this.setDataSource(this.projectOnBoardingResult);
    }
  }

  setDataSource(projectOnBoardingResult: ProjectOnboardingResults[]): void {
    this.projectOnboardingPanelConfig.tableData = projectOnBoardingResult;
    this.projectOnboardingParser(this.projectOnboardingPanelConfig?.tableData);
    this.dataSource = new MatTableDataSource(
      this.projectOnboardingPanelConfig.tableData
    );
  }

  projectOnboardingParser(
    projOnboardingResult: ProjectOnboardingResults[]
  ): void {
    this.projectOnboardingPanelConfig.isLoading = false;
    this.projectOnboardingPanelConfig.totalRows = projOnboardingResult?.length;
    this.projectOnboardingPanelConfig.tableData = projOnboardingResult?.map(
      (item, index) => {
        return {
          position: index + 1,
          displayPicture:
            item.displayPictureBase64?.includes('data') ||
            item.displayPictureBase64 === null
              ? item.displayPictureBase64
              : null,
          empCode: item.employeeCode,
          ...item,
        };
      }
    );
  }

  ngOnInit(): void {
    this.dateFilter = this.dateFilterBuilder.group(
      {
        projStartDate: [this.currentDate],
        projEndDate: [''],
      },
      { validator: this.validateProjectDates }
    );
  }

  // tslint:disable-next-line: no-any
  validateProjectDates(group: FormGroup): any {
    if (
      group.controls.projEndDate.value &&
      group.controls.projEndDate.value < group.controls.projStartDate.value
    ) {
      return { notValid: true };
    }
    return null;
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  // tslint:disable-next-line: no-any
  isFloat(input: any): number | boolean {
    if (input !== null && String(input)?.startsWith('data')) {
      return 2;
    }

    if (typeof input !== 'number' && input !== null) {
      if (
        isFinite(Date.parse(input.toString())) &&
        !isFinite(input.toString())
      ) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return input % 1 !== 0;
    }
  }

  exportToCSV(): void {
    const displayedColumns = [
      'Emp ID',
      'First Name',
      'Last Name',
      'Job Title',
      'Client',
      'End Client',
      'Bill Rate',
      'Project Start Date',
      'Work Location',
      'Confirmed By',
    ];
    this.excelTableData = this.projectOnBoardingResult.map((item, index) => {
      return {
        'Emp ID': item.employeeCode,
        'First Name': item.firstName,
        'Last Name': item.lastName,
        'Job Title': item.jobTitle,
        Client: item.client,
        'End Client': item.endClient,
        'Bill Rate': item.billRate,
        'Project Start Date': item.projectStartDate,
        'Work Location': item.workLocation,
        'Confirmed By': item.confirmedBy,
      };
    });

    this.csvUtilityService.exportToCSV(
      this.excelTableData,
      displayedColumns,
      'ProjectOnboarding'
    );
  }

  pageChanged(event: PageEvent): void {
    const pageIndex = event.pageIndex + 1;
    const pageSize = event.pageSize;
    this.projectOnboardingPanelConfig.isLoading = true;
    this.hrDashboardService
      .getProjectOnboarding(
        FetchType.Pagination,
        pageIndex,
        pageSize,
        this.searchText,
        String(this.startDate),
        String(this.endDate)
      )
      .subscribe(
        (data) => {
          this.projectOnboardingPanelConfig.isLoading = false;
          this.projectOnBoardingResult = data?.result.results;
          this.setDataSource(this.projectOnBoardingResult);
        },
        (err) => {
          console.warn(err);
          this.projectOnboardingPanelConfig.isLoading = false;
        }
      );
  }

  projectOnboardingSearch(searchText: string): void {
    this.searchText = '';
    this.searchText = searchText;

    if (this.startDate === '') {
      this.endDate = '';
    }
    if ((searchText as string).length >= 2) {
      this.refreshDataSource();
    } else if ((searchText as string).length === 0) {
      this.refreshDataSource();
    }
  }

  refreshDataSource(): void {
    this.projectOnboardingPanelConfig.isLoading = true;
    this.hrDashboardService
      .getProjectOnboarding(
        FetchType.Pagination,
        this.pageNum,
        this.pageSize,
        this.searchText,
        String(this.startDate),
        String(this.endDate)
      )
      .subscribe(
        (data) => {
          this.projectOnboardingPanelConfig.isLoading = false;
          this.projectOnBoardingResult = data?.result?.results;
          this.virtualCount = data?.result?.virtualCount;
          this.setDataSource(this.projectOnBoardingResult);
        },
        (err) => {
          console.warn(err);
          this.projectOnboardingPanelConfig.isLoading = false;
        }
      );
  }

  updateProjectOnboardingTable(type: string): void {
    switch (type) {
      case 'start':
        {
          if (this.dateFilter?.controls?.projStartDate?.value === null) {
            this.endDate = '';
            this.startDate = '';
            this.dateFilter?.controls?.projEndDate?.setValue('');
          } else {
            const searchDate = this.datepipe.transform(
              this.dateFilter?.controls?.projStartDate?.value,
              'yyyy-MM-dd'
            );
            this.startDate = searchDate;
            this.endDate =
              this.endDate === null || this.endDate === ''
                ? ''
                : this.datepipe.transform(this.endDate, 'yyyy-MM-dd');
          }
        }
        break;
      case 'end':
        {
          this.currentDate = new Date();
          if (this.dateFilter?.controls?.projStartDate?.value === null) {
            this.dateFilter?.controls?.projStartDate?.setValue(
              this.currentDate
            );
            this.startDate = String(
              this.datepipe.transform(this.currentDate, 'yyyy-MM-dd')
            );
          }
          const searchDate = this.datepipe.transform(
            this.dateFilter?.controls?.projEndDate?.value,
            'yyyy-MM-dd'
          );
          this.endDate =
            searchDate === null || searchDate === '' ? '' : searchDate;
        }
        break;
    }

    this.refreshDataSource();
  }

  download(format: string): void {
    this.downloadProjectOnBoardingsExcelOrCSV(format);
  }

  downloadProjectOnBoardingsExcelOrCSV(format: string): void {
    this.hrDashboardService
      .downloadProjectOnboardingToExcelOrCSV(
          this.typeName,
          format,
          this.searchKey,
          this.searchText,
          this.key1,
          this.startDate,
          this.key2,
          this.endDate
        )
        .subscribe(
          (data) => {
            const file = new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const fileURL = URL.createObjectURL(file);
            saveAs(fileURL, this.typeName + '.' + format);
          },
          (err) => {
            console.warn(err);
          }
        );
  }
}
