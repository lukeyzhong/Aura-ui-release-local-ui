import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrentPage } from '../../../../../../aura/search/interface/table.interface';
import {
  DashboardOnboardingResultData,
  DashboardOnboardingResults,
  DetailsConfig,
} from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import { CsvUtilityService } from '../../../../../../shared/service/utility/csv-utility.service';

@Component({
  selector: 'app-onboarding-details',
  templateUrl: './onboarding-details.component.html',
  styleUrls: ['./onboarding-details.component.scss'],
})
export class OnboardingDetailsComponent implements OnInit {
  searchText = '';
  titleCode!: number;
  pageSize!: number;
  pageNum!: number;
  fetchType = 'All';
  sortColumn = 'status';
  sortDirection = 'Ascending';
  isDisabled!: boolean;
  isExpanded!: boolean;
  // tslint:disable-next-line: no-any
  onboardingCounts: any = [];
  mapStatus = new Map<number, string>();
  onboardingResults!: DashboardOnboardingResults[];
  onboardingResultData!: DashboardOnboardingResultData;
  onboardingResultsForExcel!: DashboardOnboardingResults[];
  // tslint:disable-next-line: no-any
  excelTableData: any;
  searchKey = 'searchterm';
  statusKey = 'employeeonboardingstatus';
  statusValue = '';
  statusCodeValue = '';
  cardType = '';
  cardStatusCode!: number;

  detailsPanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [],
    columns: [
      {
        headerDisplay: 'Candidate Code',
        key: 'candidateCode',
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
        headerDisplay: 'Email',
        key: 'email',
      },
      {
        headerDisplay: 'Job Role',
        key: 'jobTitle',
      },
      {
        headerDisplay: 'Status',
        key: 'status',
      },
      {
        headerDisplay: 'Invite Sent Date',
        key: 'inviteDate',
      },
      {
        headerDisplay: 'Due Date',
        key: 'dueDate',
      },
      {
        headerDisplay: 'Declined Date',
        key: 'actionDate',
      },
      {
        headerDisplay: 'Submitted Date',
        key: 'submittedDate',
      },
      {
        headerDisplay: 'Registration Date',
        key: 'registrationDate',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(
    private hrDashboardService: HrDashboardService,
    private csvUtilityService: CsvUtilityService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.onboardingCounts = data?.obj?.onboardingCounts;
    this.mapStatus = data?.obj?.mapStatus;
    this.isDisabled = data?.obj?.disable;
    this.isExpanded = data?.obj?.expend;
    this.cardType = data?.obj?.cardType;
    this.cardStatusCode = data?.obj?.cardStatusValue;
  }

  ngOnInit(): void {
    for (const key of this.mapStatus.keys()) {
      this.titleCode = key;
      this.statusCodeValue = key.toString();
      this.getOnboardingDataByStatusCode(key);
    }

    if (this.cardType === 'single') {
      if (this.titleCode?.toString() === '1') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
        ];
      } else if (this.titleCode?.toString() === '5') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
          'inviteDate',
          'dueDate',
        ];
      } else if (this.titleCode?.toString() === '3') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
          'inviteDate',
          'actionDate',
        ];
      } else if (this.titleCode?.toString() === '6') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
          'submittedDate',
        ];
      } else if (this.titleCode?.toString() === '10') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
          'submittedDate',
        ];
      } else if (this.titleCode?.toString() === '8') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
        ];
      } else if (this.titleCode?.toString() === '11') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
          'inviteDate',
          'registrationDate',
        ];
      } else if (this.titleCode?.toString() === '12') {
        this.detailsPanelConfig.displayedColumns = [
          'candidateCode',
          'firstName',
          'lastName',
          'email',
          'jobTitle',
          'status',
          'inviteDate',
          'actionDate',
        ];
      }
    }
    if (this.cardType === 'all') {
      this.detailsPanelConfig.displayedColumns = [
        'candidateCode',
        'firstName',
        'lastName',
        'email',
        'jobTitle',
        'status',
        'inviteDate',
        'dueDate',
        'actionDate',
        'submittedDate',
        'registrationDate',
      ];
    }
  }

  getOnboardingsCounts(searchText: string): void {
    this.hrDashboardService
      .getOnboardingsCount(searchText)
      .subscribe((data) => {
        this.onboardingCounts = data?.result;
        if (this.titleCode !== undefined) {
          this.getExpandedPanelTitleCode(this.titleCode);
        }
      });
  }

  getExpandedPanelTitleCode(titleCodeValue: number): void {
    this.detailsPanelConfig.isLoading = true;
    this.titleCode = titleCodeValue;
    if (this.titleCode !== undefined) {
      this.getOnboardingDataByStatusCode(titleCodeValue);
    }
  }

  getOnboardingDataByStatusCode(titleCodeValue: number): void {
    this.hrDashboardService
      .getHROnboardingDataByStatusCode(
        titleCodeValue,
        this.pageNum,
        this.pageSize,
        this.searchText
      )
      .subscribe(
        (data) => {
          this.onboardingResults = data?.result?.results;
          this.onboardingResultParser(data?.result);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getOnboardingDataForExportToExcel(format: string): void {
    if (this.cardType === 'all') {
      this.statusCodeValue = '';
    }
    this.hrDashboardService
      .getOnboardingExportToExcel(
        this.searchKey,
        this.searchText,
        this.statusKey,
        this.statusCodeValue,
        format
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, 'Onboarding Status' + '.' + format);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  onboardingResultParser(
    onboardingResultData: DashboardOnboardingResultData
  ): void {
    this.detailsPanelConfig.isLoading = false;
    this.detailsPanelConfig.totalRows = onboardingResultData?.virtualCount;
    this.detailsPanelConfig.tableData = onboardingResultData?.results?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
  }

  getNextRecords(event: CurrentPage): void {
    this.hrDashboardService
      .getHROnboardingDataByStatusCode(
        this.titleCode,
        event.pageIndex,
        event.pageSize
      )
      .subscribe(
        (data) => {
          this.onboardingResultParser(data?.result);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  performSearch(search: string): void {
    this.searchText = search;
    if (search.length >= 1 || search.length === 0) {
      this.getOnboardingsCounts(this.searchText);
      if (this.titleCode !== undefined) {
        this.getOnboardingDataByStatusCode(this.titleCode);
      }
    }
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  exportToCSV(): void {
    this.getOnboardingDataForExportToExcel(this.searchText);
  }

  getOnboardingExcel(): void {
    const columnsDisplayed = [
      'Candidate Code',
      'First Name',
      'Last Name',
      'Email',
      'Job Role',
      'Status',
      'Invite sent Date',
      'Due date',
    ];
    this.excelTableData = this.onboardingResultsForExcel?.map((item, index) => {
      return {
        'Candidate Code': item?.candidateCode,
        'First Name': item?.firstName,
        'Last Name': item?.lastName,
        Email: item?.email,
        'Job Role': item?.jobTitle,
        Status: item?.status,
        'Invite sent Date': item?.inviteDate,
        'Due date': item?.dueDate,
      };
    });

    this.csvUtilityService?.exportToCSV(
      this.excelTableData,
      columnsDisplayed,
      'Candidate Onboarding'
    );
  }

  download(format: string): void {
    this.getOnboardingDataForExportToExcel(format);
  }
}
