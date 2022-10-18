import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../../../shared/service/lookup/lookup.service';
import { DashboardOnboardingResults } from '../../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { OnBoardingStatusComponent } from '../../on-boarding-status/on-boarding-status.component';
import { GlobalSearchApiService } from '../../../../../../../shared/service/search/global-search-api.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-details-panel',
  templateUrl: './details-panel.component.html',
  styleUrls: ['./details-panel.component.scss'],
  providers: [DatePipe],
})
export class DetailsPanelComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() tableData!: DashboardOnboardingResults[] | null;
  @Input() title = '';
  @Input() titleCode = 0;
  @Input() isLoading = false;
  // tslint:disable-next-line: no-any
  @Input() columns: any;
  // tslint:disable-next-line: no-any
  @Input() displayedColumns: any;
  @Input() expandedPanelCode!: number;
  @Input() type!: string | undefined;
  @Input() totalRows = 0;
  @Input() searchText = '';
  @Input() cardType = '';
  @Input() cardStatusCode!: number;
  @Input() counts!: number;
  @Input() isDisabled!: boolean;
  @Input() isExpanded!: boolean;
  @Output() paginatorClicked = new EventEmitter();
  @Output() expandedPanelTitleCode = new EventEmitter();
  @Output() refreshCounts = new EventEmitter();
  mapRejectionReasons = new Map<number, string>();
  resultsLength = 0;
  pageSizeOptions = [10, 20, 30, 40, 50];
  displayResults = '';
  selectedTitleCode = 0;
  notificationMessage = '';
  snackBarNotification = false;
  matDialogRef!: MatDialogRef<ConfirmationDialogComponent>;
  // tslint:disable-next-line: no-any
  dataSource!: MatTableDataSource<any>;
  currentDate!: string;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private lookupCodeService: LookupService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private datePipe: DatePipe,
    private globalSearchApiService: GlobalSearchApiService
  ) { }

  ngOnInit(): void {
    const curDate = new Date();
    // tslint:disable-next-line: no-non-null-assertion
    this.currentDate = this.datePipe.transform(curDate, 'yyyy-MM-dd')!;
    this.setRejectionReasonsCodes();
  }

  setRejectionReasonsCodes(): void {
    this.lookupCodeService.getRejectionOfferReasonsCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapRejectionReasons.set(country?.lookupCode, country?.description);
      }
    });
  }

  getTitleCode(titleCodeValue: number): void {
    this.selectedTitleCode = titleCodeValue;
    this.expandedPanelTitleCode.emit(this.selectedTitleCode);
  }

  pageChanged(event: PageEvent): void {
    const pageIndex = event.pageIndex;
    const pageSize = event.pageSize;

    const currentPage = {
      pageIndex: pageIndex + 1,
      pageSize,
    };
    this.isLoading = true;
    this.paginatorClicked.emit(currentPage);
  }

  ngOnChanges(change: SimpleChanges): void {
    this.isLoading = true;
    if (change.tableData && change.tableData.currentValue) {
      this.updateTable(change.tableData.currentValue);
    }
    if (change.totalRows && change.totalRows.currentValue) {
      this.paginator?.firstPage();
    }
  }

  // tslint:disable-next-line: no-any
  updateTable(tableData: any): void {
    this.isLoading = false;
    this.resultsLength = this.totalRows;
    this.dataSource = new MatTableDataSource(tableData);
  }

  openOnboardingStatusDialog(
    onboardCand: DashboardOnboardingResults,
    statusType: string,
    actionType: string = 'Add'
  ): void {
    const dialogConfig = new MatDialogConfig();
    // tslint:disable-next-line: no-any
    const obj: any = {
      onboardCand,
      action: actionType,
      statusType,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '70%';
    dialogConfig.data = {
      obj,
    };

    if (statusType === 'Delete') {
      this.matDialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false,
      });
      this.matDialogRef.componentInstance.confirmMessage =
        'Are you sure, you want to delete?';
      this.matDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.dialogRef = this.dialog.open(
            OnBoardingStatusComponent,
            dialogConfig
          );
          this.dialogRef.afterClosed().subscribe((res) => {
            if (res.status === 'success') {
              this.notificationMessage = res.data;
              this.snackBarNotification = true;
              this.refreshCounts.emit(this.searchText);
            }
          });
        }
      });
    } else {
      this.dialogRef = this.dialog.open(
        OnBoardingStatusComponent,
        dialogConfig
      );
      this.dialogRef.afterClosed().subscribe((res) => {
        if (res?.status === 'success') {
          this.notificationMessage = res?.data;
          this.snackBarNotification = true;
          this.refreshCounts.emit(this.searchText);
        }
      });
    }
  }

  redirectToSendInvite(onboardResult: DashboardOnboardingResults): void {
    this.globalSearchApiService?.sendPath('HR/On Boarding');
    this.router.navigate(['/aura/hr/on-boarding'], {
      queryParams: {
        cId: onboardResult.candidateId,
        cJobId: onboardResult.candidateJobRequirementId,
      },
    });
    this.dialogRef.close('cancel');
    this.dialog.closeAll();
  }

  redirectToHRVerify(onboardResult: DashboardOnboardingResults): void {
    this.globalSearchApiService?.sendPath('HR/HR Verify');
    this.router.navigate(['/aura/hr/hr-verify'], {
      queryParams: {
        eOnBoardingId: onboardResult.employeeOnboardingId,
        cJobId: onboardResult.candidateJobRequirementId,
      },
    });
    this.dialogRef.close('cancel');
    this.dialog.closeAll();
  }

  getComment(comments: string): string {
    const commentsObj = JSON.parse(comments);
    return commentsObj.Comment;
  }

  getRejectionReason(comments: string): string {
    const commentsObj = JSON.parse(comments);
    const reasons = [];
    for (const [k, v] of this.mapRejectionReasons) {
      for (const code of commentsObj.ReasonCodes) {
        if (k === code) {
          reasons.push(v);
        }
      }
    }
    return reasons.join(',');
  }
}
