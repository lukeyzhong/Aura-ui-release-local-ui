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
  ChartGetNewHireEmpResults,
  ChartGetNewHireEmpData,
} from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  ChartTypes,
  ChartTypeDesc,
} from '../../../../../../aura/hr/enum/chartTypes.enum';
import { CurrentPage } from '../../../../../../aura/search/interface/table.interface';
import { DataGridTypes } from '../../../../../../aura/hr/enum/dataGridTypes.enum';

@Component({
  selector: 'app-new-hires-details',
  templateUrl: './new-hires-details.component.html',
  styleUrls: ['./new-hires-details.component.scss'],
})
export class NewHiresDetailsComponent implements OnInit {
  newHireEmpResponseData!: ChartsPopupScreenData;
  newHireEmpResult!: ChartsPopupScreenResult[];
  newHireYear = new FormControl([]);
  typeOfEmploymentResponseData!: ChartsPopupScreenData;
  typeOfEmploymentResult!: ChartsPopupScreenResult[];
  typeOfEmpYear = new FormControl([]);
  workAuthorizationResponseData!: ChartsPopupScreenData;
  workAuthorizationResult!: ChartsPopupScreenResult[];
  workAuthYear = new FormControl([]);
  statisticsByStatusResponseData!: ChartsPopupScreenData;
  statisticsByStatusResult!: ChartsPopupScreenResult[];
  statisticsByCategoryResponseData!: ChartsPopupScreenData;
  statisticsByCategoryResult!: ChartsPopupScreenResult[];
  byStatusYear = new FormControl([]);
  byCategoryYear = new FormControl([]);
  nationalityResponseData!: ChartsPopupScreenData;
  nationalityResult!: ChartsPopupScreenResult[];
  nationalityYear = new FormControl([]);
  currYear = '';
  currDate!: Date;
  widgetType!: string;
  dataGridType!: string;
  type = '';
  key = 'year';
  value = '';
  year: number[] = [];
  newHireEmpYear = new FormControl([]);
  newHireEmpForExcel: ChartGetNewHireEmpResults[] = [];
  allNewHireEmpResponseData!: ChartGetNewHireEmpData;
  allNewHireEmpResult: ChartGetNewHireEmpResults[] = [];
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

  // Total New Hires Employees : Start
  isLoadNewHireEmpSpinner = false;
  public newHireLineChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public newHireEmpCountData: number[] = [];
  public newHireLineChartLabels: Label[] = [];
  public newHireLineChartOptions: ChartOptions = {
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
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public newHireLineChartColors: Color[] = [
    {
      borderColor: '#A7B72A',
      borderWidth: 1.5,
      backgroundColor: '#F8F5C9',
      pointBackgroundColor: 'white',
      pointHoverBackgroundColor: '#A7B72A',
      pointRadius: 3.5,
      pointHoverRadius: 5,
      pointStyle: 'circle',
    },
  ];
  public newHireLineChartLegend = false;
  public newHireLineChartType: ChartType = 'line';
  // Total New Hires Employees : End

  // New Hire By Type Of Employment : Start
  isLoadTypeEmpSpinner = false;
  public typeOfEmploymentChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public typeOfEmploymentCountData: number[] = [];
  public typeOfEmploymentChartLabels: Label[] = [];
  public typeOfEmploymentChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 70,
    plugins: {
      datalabels: {
        color: '#FFFFFF',
        anchor: 'center',
        align: 'center',
        formatter: Math.round,
        font: {
          size: 10,
          family: 'ProximaNova-Regular',
        },
      },
      labels: {
        render: [ChartDataLabels],
      },
    },
    legend: {
      position: 'right',
      labels: {
        fontFamily: 'ProximaNova-Regular',
        fontSize: 10,
        fontColor: '#000',
      },
      onHover: (event, chartElement) => {
        (event.target as HTMLInputElement).style.cursor = 'pointer';
      },
      onLeave: (event, chartElement) => {
        (event.target as HTMLInputElement).style.cursor = 'default';
      },
    },

    tooltips: {
      bodyFontSize: 12,
      bodyFontFamily: 'ProximaNova-Regular',
      yPadding: 11,
      displayColors: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 33;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public typeOfEmploymentChartColors: Color[] = [
    {
      backgroundColor: [
        '#45B9E0',
        '#5996E2',
        '#6571E3',
        '#0390fc',
        '#03dffc',
        '#32a852',
        '#a89d32',
        '#a84832',
        '#a83279',
      ],
      borderColor: [
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
        '#FFFFFF',
      ],
      borderWidth: 1,
    },
  ];
  public typeOfEmploymentChartLegend = true;
  public typeOfEmploymentChartType: ChartType = 'doughnut';
  // New Hire By Type Of Employment : End

  // New Hire By Work Authorization : Start
  isLoadWorkAuthSpinner = false;
  public workAuthorizationChartData: ChartDataSets[] = [
    { data: [], label: '' },
  ];
  public workAuthorizationCountData: number[] = [];
  public workAuthorizationChartLabels: Label[] = [];
  public workAuthorizationChartOptions: ChartOptions = {
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
  public workAuthorizationChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public workAuthorizationChartLegend = false;
  public workAuthorizationChartType: ChartType = 'bar';
  // New Hire By Work Authorization : End

  // Statistics By Status : Start
  isLoadStatusSpinner = false;
  public StatusChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public statusCountData: number[] = [];
  public statusChartLabels: Label[] = [];
  public statusChartOptions: ChartOptions = {
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
        tooltipModel.width = 80;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public statusChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public statusChartLegend = false;
  public statusChartType: ChartType = 'bar';
  // Statistics By Status  : End

  // Statistics By Category : Start
  isLoadCategorySpinner = false;
  public categoryChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public categoryCountData: number[] = [];
  public categoryChartLabels: Label[] = [];
  public categoryChartOptions: ChartOptions = {
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
        tooltipModel.width = 80;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public categoryChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public categoryChartLegend = false;
  public categoryChartType: ChartType = 'bar';
  // Statistics By Category  : End

  // New Hires By Nationality  : Start
  isLoadNationalitySpinner = false;
  public nationalityChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public nationalityCountData: number[] = [];
  public nationalityChartLabels: Label[] = [];
  public nationalityChartOptions: ChartOptions = {
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
        tooltipModel.width = 70;
        tooltipModel.backgroundColor = '#008acc';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public nationalityChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public nationalityChartLegend = false;
  public nationalityChartType: ChartType = 'bar';
  // New Hires By Nationality  : End

  newHireEmployeePanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'employeeCode',
      'firstName',
      'lastName',
      'workAuthorizationStatus',
      'employmentType',
      'employmentStartDate',
      'recruiterName',
      'nationality',
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
        headerDisplay: 'Employment Type',
        key: 'employmentType',
      },
      {
        headerDisplay: 'Employment Start Date',
        key: 'employmentStartDate',
      },
      {
        headerDisplay: 'Recruiter Name',
        key: 'recruiterName',
      },
      {
        headerDisplay: 'Nationality',
        key: 'nationality',
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
    this.newHireYear.setValue(this.currDate?.getUTCFullYear());
    this.typeOfEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.workAuthYear.setValue(this.currDate?.getUTCFullYear());
    this.byStatusYear.setValue(this.currDate?.getUTCFullYear());
    this.byCategoryYear.setValue(this.currDate?.getUTCFullYear());
    this.nationalityYear.setValue(this.currDate?.getUTCFullYear());
    this.newHireEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.getTotalNewHireEmployees();
    this.getNewHireByTypeOfEmployment();
    this.getNewHireByWorkAuthorization();
    this.getNewHireByStatus();
    this.getNewHireByCategory();
    this.getNewHireByNationality();
    this.getNewHireEmployeesTable();
  }

  getTotalNewHireEmployees(): void {
    this.isLoadNewHireEmpSpinner = true;
    this.type = ChartTypes[9];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.newHireEmpResponseData = data?.result;
          this.newHireEmpResult = data?.result?.result;
          this.newHireLineChartLabels = this.newHireEmpResult?.map((x) =>
            x.description?.slice(0, 3)
          );
          this.newHireEmpCountData = this.newHireEmpResult?.map((x) => x.count);
          this.newHireLineChartData = [
            { data: this.newHireEmpCountData, label: 'Count' },
          ];
          this.isLoadNewHireEmpSpinner = false;
        },
        (err) => {
          this.isLoadNewHireEmpSpinner = false;
          console.warn(err);
        }
      );
  }

  getNewHireByTypeOfEmployment(): void {
    this.isLoadTypeEmpSpinner = true;
    this.type = ChartTypes[10];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.typeOfEmploymentResponseData = data?.result;
          this.typeOfEmploymentResult = data?.result?.result;
          this.typeOfEmploymentChartLabels = this.typeOfEmploymentResult?.map(
            (x) => x.description.slice(0, 20)
          );
          this.typeOfEmploymentCountData = this.typeOfEmploymentResult?.map(
            (x) => x.count
          );
          this.typeOfEmploymentChartData = [
            { data: this.typeOfEmploymentCountData, label: 'Count' },
          ];
          this.isLoadTypeEmpSpinner = false;
        },
        (err) => {
          this.isLoadTypeEmpSpinner = false;
          console.warn(err);
        }
      );
  }

  getNewHireByWorkAuthorization(): void {
    this.isLoadWorkAuthSpinner = true;
    this.type = ChartTypes[11];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.workAuthorizationResponseData = data?.result;
          this.workAuthorizationResult = data?.result?.result;
          this.workAuthorizationChartLabels = this.workAuthorizationResult?.map(
            (x) => x.description
          );
          this.workAuthorizationCountData = this.workAuthorizationResult?.map(
            (x) => x.count
          );
          this.workAuthorizationChartData = [
            {
              maxBarThickness: 10,
              data: this.workAuthorizationCountData,
              label: 'Count',
            },
          ];
          this.isLoadWorkAuthSpinner = false;
        },
        (err) => {
          this.isLoadWorkAuthSpinner = false;
          console.warn(err);
        }
      );
  }

  getNewHireByStatus(): void {
    this.isLoadStatusSpinner = true;
    this.type = ChartTypes[12];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.statisticsByStatusResponseData = data?.result;
          this.statisticsByStatusResult = data?.result?.result;
          this.statusChartLabels = this.statisticsByStatusResult?.map(
            (x) => x.description
          );
          this.statusCountData = this.statisticsByStatusResult?.map(
            (x) => x.count
          );
          this.StatusChartData = [
            { maxBarThickness: 10, data: this.statusCountData, label: 'Count' },
          ];
          this.isLoadStatusSpinner = false;
        },
        (err) => {
          this.isLoadStatusSpinner = false;
          console.warn(err);
        }
      );
  }

  getNewHireByCategory(): void {
    this.isLoadCategorySpinner = true;
    this.type = ChartTypes[17];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.statisticsByCategoryResponseData = data?.result;
          this.statisticsByCategoryResult = data?.result?.result;
          this.categoryChartLabels = this.statisticsByCategoryResult?.map(
            (x) => x.description
          );
          this.categoryCountData = this.statisticsByCategoryResult?.map(
            (x) => x.count
          );
          this.categoryChartData = [
            {
              maxBarThickness: 10,
              data: this.categoryCountData,
              label: 'Count',
            },
          ];
          this.isLoadCategorySpinner = false;
        },
        (err) => {
          this.isLoadCategorySpinner = false;
          console.warn(err);
        }
      );
  }

  getNewHireByNationality(): void {
    this.isLoadNationalitySpinner = true;
    this.type = ChartTypes[13];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.nationalityResponseData = data?.result;
          this.nationalityResult = data?.result?.result;
          this.nationalityChartLabels = this.nationalityResult?.map(
            (x) => x.description
          );
          this.nationalityCountData = this.nationalityResult?.map(
            (x) => x.count
          );
          this.nationalityChartData = [
            {
              maxBarThickness: 10,
              data: this.nationalityCountData,
              label: 'Count',
            },
          ];
          this.isLoadNationalitySpinner = false;
        },
        (err) => {
          this.isLoadNationalitySpinner = false;
          console.warn(err);
        }
      );
  }

  getNewHireEmployeesTable(): void {
    this.newHireEmployeePanelConfig.isLoading = true;
    this.hrDashboardService
      .getNewHireEmployeesTableData(
        this.value,
        this.searchTerm,
        this.pageNum,
        this.pageSize,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(
        (data) => {
          this.newHireEmployeeResultParser(data?.result);
          this.newHireEmployeePanelConfig.isLoading = false;
        },
        (err) => {
          this.newHireEmployeePanelConfig.isLoading = false;
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

  newHireYearSelection(): void {
    this.value = this.newHireYear.value;
    this.getTotalNewHireEmployees();
  }

  typeOfEmpYearSelection(): void {
    this.value = this.typeOfEmpYear.value;
    this.getNewHireByTypeOfEmployment();
  }

  workAuthYearSelection(): void {
    this.value = this.workAuthYear.value;
    this.getNewHireByWorkAuthorization();
  }

  byStatusYearSelection(): void {
    this.value = this.byStatusYear.value;
    this.getNewHireByStatus();
  }

  byCategoryYearSelection(): void {
    this.value = this.byCategoryYear.value;
    this.getNewHireByCategory();
  }

  nationalityYearSelection(): void {
    this.value = this.nationalityYear.value;
    this.getNewHireByNationality();
  }

  newHireEmpYearSelection(): void {
    this.value = this.newHireEmpYear.value;
    this.getNewHireEmployeesTable();
  }

  exportToCsvAllCharts(type: string, dataType: string): void {
    this.dataType = dataType;
    switch (type) {
      case ChartTypeDesc.NewHiresCount:
        this.widgetType = this.ChartTypes[9];
        break;
      case ChartTypeDesc.NewHiresByEmploymentType:
        this.widgetType = this.ChartTypes[10];
        break;
      case ChartTypeDesc.NewHiresByWorkAuthorization:
        this.widgetType = this.ChartTypes[11];
        break;
      case ChartTypeDesc.NewHiresByStatus:
        this.widgetType = this.ChartTypes[12];
        break;
      case ChartTypeDesc.NewHiresByNationality:
        this.widgetType = this.ChartTypes[13];
        break;
      case ChartTypeDesc.EmployeeCategory:
        this.widgetType = this.ChartTypes[17];
        break;
    }
  }

  exportToCsvNewHireEmpTable(dataType: string): void {
    this.dataType = dataType;
    this.dataGridType = DataGridTypes[2];
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  getNextRecords(event: CurrentPage): void {
    this.hrDashboardService
      .getNewHireEmployeesTableData(
        this.value,
        this.searchTerm,
        event.pageIndex,
        event.pageSize,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(
        (data) => {
          this.newHireEmployeeResultParser(data?.result);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  newHireEmployeeResultParser(
    newHireEmpResultData: ChartGetNewHireEmpData
  ): void {
    this.newHireEmployeePanelConfig.isLoading = false;
    this.newHireEmployeePanelConfig.totalRows =
      newHireEmpResultData?.virtualCount;
    this.newHireEmployeePanelConfig.tableData =
      newHireEmpResultData?.results?.map((item, index) => {
        return {
          ...item,
        };
      });
  }

  performSearch(search: string): void {
    this.searchTerm = search;
    if (search.length >= 2 || search.length === 0) {
      this.getNewHireEmployeesTable();
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
