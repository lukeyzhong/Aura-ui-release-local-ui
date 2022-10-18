import { Component, OnInit } from '@angular/core';
import { PageConfig } from '../../../../../aura/search/interface/table.interface';
import {
  CountsDataGridsResults,
  DetailsConfig,
} from '../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { DownloadToExcelOrCSV } from '../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../shared/service/documents/documents.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-po-expiring',
  templateUrl: './po-expiring.component.html',
  styleUrls: ['./po-expiring.component.scss']
})
export class PoExpiringComponent implements OnInit {

  countsDataGridsDetails!: CountsDataGridsResults[];
  total = 0;
  pageNum = 1;
  pageSize = 10;
  searchKey = 'searchterm';
  searchString = '';
  daysKey = 'days';
  daysValue = 60;
  dataGridType = 'POExpiring';
  enableSearch = true;
  downloadType = 'datagrid';

  countsDataGridsPanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'position',
      'displayPicture',
      'empCode',
      'firstName',
      'lastName',
      'email',
      'employmentType',
      'issueDate',
      'expiryDate'
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
        headerDisplay: 'Email',
        key: 'email',
      },
      {
        headerDisplay: 'Employment Type',
        key: 'employmentType',
      },
      {
        headerDisplay: 'PO Start Date',
        key: 'issueDate',
      },
      {
        headerDisplay: 'PO End Date',
        key: 'expiryDate',
      },
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(private hrDashboardService: HrDashboardService, private documentsService: DocumentsService, private router: Router) { }

  ngOnInit(): void {
    this.getPOExpiringDataDatails();
  }

  performSearch(search: string): void {
    let searchValue = search;
    if (search.length >= 2 || search.length === 0) {
      if (searchValue.length > 0) {
        this.searchString = searchValue;
      } else {
        this.searchString = '';
        searchValue = '';
      }
      this.countsDataGridsPanelConfig.isLoading = true;
      this.hrDashboardService
        .getPOExpiringData(
          this.dataGridType,
          this.searchString,
          this.daysKey,
          this.daysValue,
          this.pageNum,
          this.pageSize
        )
        .subscribe(
          (data) => {
            this.countsDataGridsDetails = data?.result?.results;
            this.total = data?.result?.virtualCount;
            this.countsDataGridsResultParser(data?.result?.results);
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  getPOExpiringDataDatails(): void {
    this.hrDashboardService
      .getPOExpiringData(
        this.dataGridType,
        this.searchString,
        this.daysKey,
        this.daysValue,
        this.pageNum,
        this.pageSize
      )
      .subscribe(
        (data) => {
          this.countsDataGridsDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          if (this.total === 0) {
            this.enableSearch = false;
          }
          this.countsDataGridsResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getNextRecords(event: PageConfig): void {
    this.hrDashboardService
      .getPOExpiringData(
        this.dataGridType,
        this.searchString,
        this.daysKey,
        this.daysValue,
        event.pageIndex,
        event.pageSize
      )
      .subscribe(
        (data) => {
          this.countsDataGridsDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          this.countsDataGridsResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  countsDataGridsResultParser(countsDataGridsResults: CountsDataGridsResults[]): void {
    this.countsDataGridsPanelConfig.isLoading = false;
    this.countsDataGridsPanelConfig.totalRows = this.total;
    this.countsDataGridsPanelConfig.tableData = countsDataGridsResults?.map((item, index) => {
      return {
        position: index + 1,
        displayPicture:
          item?.displayPictureBase64?.includes('data') ||
          item?.displayPictureBase64 === null
            ? item?.displayPictureBase64
            : null,
        empCode: item?.employeeCode,
        firstName: item?.firstName,
        lastName: item?.lastName,
        email: item?.email,
        employmentType: item?.employmentType,
        issueDate: item?.issueDate,
        expiryDate: item?.expiryDate
      };
    });
  }

  download(format: string): void {
    this.downloadDataToExcelOrCSV(format);
  }

  downloadDataToExcelOrCSV(format: string): void {
      this.hrDashboardService.downloadAlertCardsDataToExcelOrCSV(
          this.downloadType,
          this.dataGridType,
          format,
          this.searchKey,
          this.searchString,
          this.daysKey,
          this.daysValue.toString()
        )
        .subscribe(
          (data) => {
            const file = new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const fileURL = URL.createObjectURL(file);
            saveAs(fileURL, this.dataGridType + '.' + format);
          },
          (err) => {
            console.warn(err);
          }
        );
  }

  goToDashboard(): void {
    this.router.navigate(['/aura/hr/dashboard']);
  }

}
