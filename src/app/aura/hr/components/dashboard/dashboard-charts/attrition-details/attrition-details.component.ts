import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
  ChartDataSets,
  ChartOptions,
  ChartTooltipModel,
  ChartType,
} from 'chart.js';
import { Color, Label } from 'ng2-charts';
import {
  ChartsPopupScreenData,
  ChartsPopupScreenResult,
  DetailsConfig,
  ChartGetAttritionEmpResults,
  ChartGetAttritionEmpData,
} from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import {
  ChartTypes,
  ChartTypeDesc,
} from '../../../../../../aura/hr/enum/chartTypes.enum';
import { CurrentPage } from '../../../../../../aura/search/interface/table.interface';
import { DataGridTypes } from '../../../../../../aura/hr/enum/dataGridTypes.enum';

@Component({
  selector: 'app-attrition-details',
  templateUrl: './attrition-details.component.html',
  styleUrls: ['./attrition-details.component.scss'],
})
export class AttritionDetailsComponent implements OnInit {
  attritionCountResponseData!: ChartsPopupScreenData;
  attritionCountResult!: ChartsPopupScreenResult[];
  countYear = new FormControl([]);
  attritionReasonResponseData!: ChartsPopupScreenData;
  attritionReasonResult!: ChartsPopupScreenResult[];
  attritionAuthWorkResponseData!: ChartsPopupScreenData;
  attritionAuthWorkResult!: ChartsPopupScreenResult[];
  attritionHourWorkResponseData!: ChartsPopupScreenData;
  attritionHourWorkResult!: ChartsPopupScreenResult[];
  reasonsYear = new FormControl([]);
  authWorkYear = new FormControl([]);
  hourWorkYear = new FormControl([]);
  currYear = '';
  currDate!: Date;
  widgetType!: string;
  dataGridType!: string;
  type = '';
  key = 'year';
  value = '';
  year: number[] = [];
  attritionEmpYear = new FormControl([]);
  attritionEmpForExcel: ChartGetAttritionEmpResults[] = [];
  pageSize!: number;
  pageNum!: number;
  searchKey = 'searchterm';
  searchTerm = '';
  sortColumn = 'FirstName';
  sortDirection = 'Ascending';
  dataType!: string;
  downloadType!: string;
  format!: string;

  // tslint:disable-next-line: no-any
  public get ChartTypeDesc(): any {
    return ChartTypeDesc;
  }

  // tslint:disable-next-line: no-any
  public get ChartTypes(): any {
    return ChartTypes;
  }

  // Attrition Count : Start
  isLoadCountSpinner = false;
  public attritionCountChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public attritionCountData: number[] = [];
  public attritionCountChartLabels: Label[] = [];
  public attritionCountChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
        font: {
          size: 10,
          family: 'ProximaNova-Regular',
        },
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: false,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
      yAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: true,
            stepSize: 100,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
    },
    tooltips: {
      bodyFontSize: 12,
      bodyFontFamily: 'ProximaNova-Regular',
      yPadding: 11,
      displayColors: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 33;
        tooltipModel.width = 75;
        tooltipModel.backgroundColor = '#C45658';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public attritionCountChartColors: Color[] = [
    {
      borderColor: '#EF8587',
      borderWidth: 1.5,
      backgroundColor: '#EF8587',
      hoverBackgroundColor: '#C45658',
      hoverBorderColor: '#C45658',
    },
  ];
  public attritionCountChartLegend = false;
  public attritionCountChartType: ChartType = 'bar';
  // Attrition Count : End

  // Attrition Reasons : Start
  isLoadReasonsSpinner = false;
  public attritionReasonChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public attritionReasonCountData: number[] = [];
  public attritionReasonChartLabels: Label[] = [];
  public attritionReasonChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
        font: {
          size: 10,
          family: 'ProximaNova-Regular',
        },
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: false,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
      yAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: true,
            stepSize: 100,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
    },
    tooltips: {
      bodyFontSize: 12,
      bodyFontFamily: 'ProximaNova-Regular',
      yPadding: 11,
      displayColors: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 33;
        tooltipModel.width = 75;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public attritionReasonChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public attritionReasonChartLegend = false;
  public attritionReasonChartType: ChartType = 'bar';
  // Attrition Reasons : End

  // Attrition AuthWork : Start
  isLoadAuthWorkSpinner = false;
  public authWorkReasonChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public attritionAuthWorkCountData: number[] = [];
  public attritionAuthWorkChartLabels: Label[] = [];
  public attritionAuthWorkChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
        font: {
          size: 10,
          family: 'ProximaNova-Regular',
        },
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: false,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
      yAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: true,
            stepSize: 100,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
    },
    tooltips: {
      bodyFontSize: 12,
      bodyFontFamily: 'ProximaNova-Regular',
      yPadding: 11,
      displayColors: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 33;
        tooltipModel.width = 75;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public attritionAuthWorkChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public attritionAuthWorkChartLegend = false;
  public attritionAuthWorkChartType: ChartType = 'bar';
  // Attrition AuthWork : End

  // Attrition HourWork : Start
  isLoadHourWorkSpinner = false;
  public hourWorkReasonChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public attritionHourWorkCountData: number[] = [];
  public attritionHourWorkChartLabels: Label[] = [];
  public attritionHourWorkChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        display: false,
        font: {
          size: 10,
          family: 'ProximaNova-Regular',
        },
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: false,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
      yAxes: [
        {
          display: true,
          gridLines: {
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: true,
            stepSize: 100,
            fontSize: 10,
            fontFamily: 'ProximaNova-Regular',
            fontColor: '#000'
          },
        },
      ],
    },
    tooltips: {
      bodyFontSize: 12,
      bodyFontFamily: 'ProximaNova-Regular',
      yPadding: 11,
      displayColors: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 33;
        tooltipModel.width = 75;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public attritionHourWorkChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public attritionHourWorkChartLegend = false;
  public attritionHourWorkChartType: ChartType = 'bar';
  // Attrition HourWork : End

  attritionEmployeePanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'employeeCode',
      'firstName',
      'lastName',
      'workAuthorizationStatus',
      'employmentStartDate',
      'resignDate',
      'recruiterName',
      'salesPerson',
      'client',
      'endClient',
      'projectStartDate',
    ],
    columns: [
      {
        headerDisplay: 'Emp Code',
        key: 'employeeCode',
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
        headerDisplay: 'Work Authorization',
        key: 'workAuthorizationStatus',
      },
      {
        headerDisplay: 'Employment Start Date',
        key: 'employmentStartDate',
      },
      {
        headerDisplay: 'Resigned Date',
        key: 'resignDate',
      },
      {
        headerDisplay: 'Recruiter Name',
        key: 'recruiterName',
      },
      {
        headerDisplay: 'Sales Person',
        key: 'salesPerson',
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
        headerDisplay: 'Project Start Date',
        key: 'projectStartDate',
      },
    ],
    tableData: null,
    totalRows: 0,
  };
  constructor(
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit(): void {
    this.currDate = new Date();
    this.currYear = this.currDate.getFullYear().toString();
    this.value = this.currYear;
    for (let i = 0; i <= 4; i++) {
      this.year.push(this.currDate?.getUTCFullYear() - i);
    }
    this.countYear.setValue(this.currDate?.getUTCFullYear());
    this.reasonsYear.setValue(this.currDate?.getUTCFullYear());
    this.authWorkYear.setValue(this.currDate?.getUTCFullYear());
    this.hourWorkYear.setValue(this.currDate?.getUTCFullYear());
    this.attritionEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.getAttritionCountData();
    this.getAttritionReasonsData();
    this.getAttritionAuthWorkData();
    this.getAttritionHourWorkData();
    this.getAttritionEmployeesTable();
  }

  getAttritionCountData(): void {
    this.isLoadCountSpinner = true;
    this.type = ChartTypes[14];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.attritionCountResponseData = data?.result;
          this.attritionCountResult = data?.result?.result;
          this.attritionCountChartLabels = this.attritionCountResult?.map((x) =>
            x.description?.slice(0, 3)
          );
          this.attritionCountData = this.attritionCountResult?.map(
            (x) => x.count
          );
          this.attritionCountChartData = [
            {
              maxBarThickness: 15,
              data: this.attritionCountData,
              label: 'Count',
            },
          ];
          this.isLoadCountSpinner = false;
        },
        (err) => {
          this.isLoadCountSpinner = false;
          console.warn(err);
        }
      );
  }

  getAttritionReasonsData(): void {
    this.isLoadReasonsSpinner = true;
    this.type = ChartTypes[15];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.attritionReasonResponseData = data?.result;
          this.attritionReasonResult = data?.result?.result;
          this.attritionReasonChartLabels = this.attritionReasonResult?.map(
            (x) => x.description?.slice(0, 20)
          );
          this.attritionReasonCountData = this.attritionReasonResult?.map(
            (x) => x.count
          );
          this.attritionReasonChartData = [
            {
              maxBarThickness: 20,
              data: this.attritionReasonCountData,
              label: 'Count',
            },
          ];
          this.isLoadReasonsSpinner = false;
        },
        (err) => {
          this.isLoadReasonsSpinner = false;
          console.warn(err);
        }
      );
  }

  getAttritionAuthWorkData(): void {
    this.isLoadAuthWorkSpinner = true;
    this.type = ChartTypes[18];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.attritionAuthWorkResponseData = data?.result;
          this.attritionAuthWorkResult = data?.result?.result;
          this.attritionAuthWorkChartLabels = this.attritionAuthWorkResult?.map(
            (x) => x.description?.slice(0, 20)
          );
          this.attritionAuthWorkCountData = this.attritionAuthWorkResult?.map(
            (x) => x.count
          );
          this.authWorkReasonChartData = [
            {
              maxBarThickness: 20,
              data: this.attritionAuthWorkCountData,
              label: 'Count',
            },
          ];
          this.isLoadAuthWorkSpinner = false;
        },
        (err) => {
          this.isLoadAuthWorkSpinner = false;
          console.warn(err);
        }
      );
  }

  getAttritionHourWorkData(): void {
    this.isLoadHourWorkSpinner = true;
    this.type = ChartTypes[19];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.attritionHourWorkResponseData = data?.result;
          this.attritionHourWorkResult = data?.result?.result;
          this.attritionHourWorkChartLabels = this.attritionHourWorkResult?.map(
            (x) => x.description?.slice(0, 20)
          );
          this.attritionHourWorkCountData = this.attritionHourWorkResult?.map(
            (x) => x.count
          );
          this.hourWorkReasonChartData = [
            {
              maxBarThickness: 20,
              data: this.attritionHourWorkCountData,
              label: 'Count',
            },
          ];
          this.isLoadHourWorkSpinner = false;
        },
        (err) => {
          this.isLoadHourWorkSpinner = false;
          console.warn(err);
        }
      );
  }

  getAttritionEmployeesTable(): void {
    this.attritionEmployeePanelConfig.isLoading = true;
    this.hrDashboardService
      .getAttritionEmployeesTableData(
        this.value,
        this.searchTerm,
        this.pageNum,
        this.pageSize,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(
        (data) => {
          this.attritionEmployeeResultParser(data?.result);
          this.attritionEmployeePanelConfig.isLoading = false;
        },
        (err) => {
          this.attritionEmployeePanelConfig.isLoading = false;
          console.warn(err);
        }
      );
  }

  getExportToExcelAllCharts(): void {
    this.hrDashboardService
      .getExcelDocForWidgetPopupScreenData(
        this.downloadType,
        this.widgetType,
        this.format,
        this.key,
        this.value
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, this.widgetType + '.' + this.format);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getExportToExcelTable(): void {
    this.hrDashboardService
      .getExportToExcelForDataGridsData(
        this.downloadType,
        this.dataGridType,
        this.format,
        this.key,
        this.value,
        this.searchKey,
        this.searchTerm
      )
      .subscribe(
        (data) => {
          const file = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileURL = URL.createObjectURL(file);
          saveAs(fileURL, this.dataGridType + '.' + this.format);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  countYearSelection(): void {
    this.value = this.countYear.value;
    this.getAttritionCountData();
  }

  reasonsYearSelection(): void {
    this.value = this.reasonsYear.value;
    this.getAttritionReasonsData();
  }

  authWorkYearSelection(): void {
    this.value = this.authWorkYear.value;
    this.getAttritionAuthWorkData();
  }

  hourWorkYearSelection(): void {
    this.value = this.hourWorkYear.value;
    this.getAttritionHourWorkData();
  }

  attritionEmpYearSelection(): void {
    this.value = this.attritionEmpYear.value;
    this.getAttritionEmployeesTable();
  }

  exportToCsvAllCharts(type: string, dataType: string): void {
    this.dataType = dataType;
    switch (type) {
      case ChartTypeDesc.AttritionCount:
        this.widgetType = this.ChartTypes[14];
        break;
      case ChartTypeDesc.AttritionReasons:
        this.widgetType = this.ChartTypes[15];
        break;
      case ChartTypeDesc.AttritionByWorkAuth:
        this.widgetType = this.ChartTypes[18];
        break;
      case ChartTypeDesc.AttritionByHoursWorked:
        this.widgetType = this.ChartTypes[19];
        break;
    }
  }

  exportToCsvAttritionTable(dataType: string): void {
    this.dataType = dataType;
    this.dataGridType = DataGridTypes[3];
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  getNextRecords(event: CurrentPage): void {
    this.hrDashboardService
      .getAttritionEmployeesTableData(
        this.value,
        this.searchTerm,
        event.pageIndex,
        event.pageSize,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(
        (data) => {
          this.attritionEmployeeResultParser(data?.result);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  attritionEmployeeResultParser(
    attritionEmpResultData: ChartGetAttritionEmpData
  ): void {
    this.attritionEmployeePanelConfig.isLoading = false;
    this.attritionEmployeePanelConfig.totalRows =
      attritionEmpResultData?.virtualCount;
    this.attritionEmployeePanelConfig.tableData =
      attritionEmpResultData?.results?.map((item, index) => {
        return {
          ...item,
        };
      });
  }

  performSearch(search: string): void {
    this.searchTerm = search;
    if (search.length >= 2 || search.length === 0) {
      this.getAttritionEmployeesTable();
    }
  }

  download(format: string): void {
    this.format = format;
    if (this.dataType === 'chartWidget') {
      this.downloadType = 'Widget';
      this.getExportToExcelAllCharts();
    }
    if (this.dataType === 'chartTable') {
      this.downloadType = 'DataGrid';
      this.getExportToExcelTable();
    }
  }
}
