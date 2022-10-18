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
  ChartGetAllActiveEmpData,
  ChartsPopupScreenData,
  ChartsPopupScreenResult,
  ChartGetAllActiveEmpResults,
  DetailsConfig,
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
  selector: 'app-active-emp-details',
  templateUrl: './active-emp-details.component.html',
  styleUrls: ['./active-emp-details.component.scss'],
})
export class ActiveEmpDetailsComponent implements OnInit {
  activeEmpResponseData!: ChartsPopupScreenData;
  activeEmpResult!: ChartsPopupScreenResult[];
  actEmpYear = new FormControl([]);
  typeOfEmploymentResponseData!: ChartsPopupScreenData;
  typeOfEmploymentResult!: ChartsPopupScreenResult[];
  typeOfEmpYear = new FormControl([]);
  genderEmpYear = new FormControl([]);
  workAuthorizationResponseData!: ChartsPopupScreenData;
  workAuthorizationResult!: ChartsPopupScreenResult[];
  workAuthYear = new FormControl([]);
  empByNationalityResponseData!: ChartsPopupScreenData;
  empByNationalityResult!: ChartsPopupScreenResult[];
  empByNationalityYear = new FormControl([]);
  empByEthinicity = new FormControl([]);
  empByEthinicityYear = new FormControl([]);
  empByGenderResponseData!: ChartsPopupScreenData;
  empByRaceResponseData!: ChartsPopupScreenData;
  empByGenderResult!: ChartsPopupScreenResult[];
  empByEthnicityResponseData!: ChartsPopupScreenData;
  empByRaceResult!: ChartsPopupScreenResult[];
  empByEthnicityResult!: ChartsPopupScreenResult[];
  empLocationResponseData!: ChartsPopupScreenData;
  empLocationResult!: ChartsPopupScreenResult[];
  empLocationYear = new FormControl([]);
  currYear = '';
  currDate!: Date;
  widgetType!: string;
  dataGridType!: string;
  type = '';
  key = 'year';
  value = '';
  year: number[] = [];
  // tslint:disable-next-line: no-any
  ethinicity: any[] = [];
  allActEmpYear = new FormControl([]);
  allActiveEmpForExcel: ChartGetAllActiveEmpResults[] = [];
  allActiveEmpResponseData!: ChartGetAllActiveEmpData;
  allActiveEmpResult: ChartGetAllActiveEmpResults[] = [];
  pageSize!: number;
  pageNum!: number;
  searchKey = 'searchterm';
  searchTerm = '';
  sortColumn = 'FirstName';
  sortDirection = 'Ascending';
  activeEmpTotalCount!: number;
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

  // Total Active Employees : Start
  isLoadActEmpSpinner = false;
  public activeEmpLineChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public activeEmpCountData: number[] = [];
  public activeEmpLineChartLabels: Label[] = [];
  public activeEmpLineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
  public activeEmpLineChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#f0f6ff',
      pointBackgroundColor: 'white',
      pointHoverBackgroundColor: '#008acc',
      pointRadius: 5,
      pointHoverRadius: 6,
      pointStyle: 'circle',
    },
  ];
  public activeEmpLineChartLegend = false;
  public activeEmpLineChartType: ChartType = 'line';
  // Total Active Employees : End

  // Head Count By Type Of Employment : Start
  isLoadTypeEmpSpinner = false;
  public typeOfEmploymentDoughnutChartData: ChartDataSets[] = [
    { data: [], label: '' },
  ];
  public typeOfEmploymentCountData: number[] = [];
  public typeOfEmploymentDoughnutChartLabels: Label[] = [];
  public typeOfEmploymentDoughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
   // cutoutPercentage: 70,
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
  public typeOfEmploymentDoughnutChartColors: Color[] = [
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
  public typeOfEmploymentDoughnutChartPlugins = [
    {
      // tslint:disable-next-line: no-any
      afterLayout(chart: any): void {
        // tslint:disable-next-line: no-any
        chart.legend.legendItems.forEach((label: any) => {
          const value = chart.data.datasets[0].data[label.index];

          label.text += ' ' + value;
          return label;
        });
      },
    },
    {
      // tslint:disable-next-line: no-any
      beforeInit(chart: any, options: any): void {
        // tslint:disable-next-line: typedef
        chart.legend.afterFit = function() {
          this.width += 25;
        };
      },
    },
  ];
  public typeOfEmploymentDoughnutChartLegend = true;
  public typeOfEmploymentDoughnutChart: ChartType = 'pie';
  // Head Count By Type Of Employment : End

  // Employee By Work Authorization : Start
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
  // Employee By Work Authorization : End

  // Employee By Nationality : Start
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
            display: true,
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
            display: true,
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
  // Employee By Nationality : End

  // Employee By Gender : Start
  isLoadGenderSpinner = false;
  public genderChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public genderCountData: number[] = [];
  public genderChartLabels: Label[] = [];
  public genderChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
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
  public genderChartColors: Color[] = [
    {
      backgroundColor: ['#45B9E0', '#5996E2', '#6571E3', '#0390fc', '#03dffc'],
      borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
      borderWidth: 1,
    },
  ];
  public genderChartLegend = true;
  public genderChartType: ChartType = 'pie';
  // Employee By Gender : End

  // Employee By Ethnicity : Start
  isLoadEthnicitySpinner = false;
  public ethnicityChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public ethnicityCountData: number[] = [];
  public ethnicityChartLabels: Label[] = [];
  public ethnicityChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
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
  public ethnicityChartColors: Color[] = [
    {
      backgroundColor: ['#45B9E0', '#5996E2', '#6571E3', '#0390fc', '#03dffc'],
      borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
      borderWidth: 1,
    },
  ];
  public ethnicityChartLegend = true;
  public ethnicityChartType: ChartType = 'pie';
  // Employee By Ethnicity : End

  // Employee By Race : Start
  isLoadRaceSpinner = false;
  public raceChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public raceCountData: number[] = [];
  public raceChartLabels: Label[] = [];
  public raceChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
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
  public raceChartColors: Color[] = [
    {
      backgroundColor: ['#45B9E0', '#5996E2', '#6571E3', '#0390fc', '#03dffc'],
      borderColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
      borderWidth: 1,
    },
  ];
  public raceChartLegend = true;
  public raceChartType: ChartType = 'pie';
  // Employee By Race : End

  // Employee By Location : Start
  isLoadEmpLocationSpinner = false;
  public empByLocationChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public empByLocationCountData: number[] = [];
  public empByLocationChartLabels: Label[] = [];
  public empByLocationChartOptions: ChartOptions = {
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
  public empByLocationChartColors: Color[] = [
    {
      borderColor: '#008acc',
      borderWidth: 1.5,
      backgroundColor: '#008acc',
      hoverBackgroundColor: '#008acc',
      hoverBorderColor: '#008acc',
    },
  ];
  public empByLocationChartLegend = false;
  public empByLocationChartType: ChartType = 'bar';
  // Employee By Location : End

  activeEmployeePanelConfig: DetailsConfig = {
    isLoading: true,
    displayedColumns: [
      'employeeCode',
      'firstName',
      'lastName',
      'workAuthorizationStatus',
      'employmentType',
      'startDate',
      'projectStartDate',
      'recruiterName',
      'salesPerson',
      'client',
      'endClient',
    ],
    columns: [
      {
        headerDisplay: 'Emp ID',
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
        headerDisplay: 'Start Date',
        key: 'startDate',
      },
      {
        headerDisplay: 'Project Start Date',
        key: 'projectStartDate',
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
    ],
    tableData: null,
    totalRows: 0,
  };
  constructor(
    private hrDashboardService: HrDashboardService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.currDate = new Date();
    this.currYear = this.currDate.getFullYear().toString();
    this.value = this.currYear;
    for (let i = 0; i <= 4; i++) {
      this.year.push(this.currDate?.getUTCFullYear() - i);
    }
    this.ethinicity.push(
      { key: 'EmployeeEthnicity', value: 'Ethnicity' },
      { key: 'EmployeeRace', value: 'Race' }
    );
    this.actEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.typeOfEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.genderEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.workAuthYear.setValue(this.currDate?.getUTCFullYear());
    this.empByNationalityYear.setValue(this.currDate?.getUTCFullYear());
    this.empByEthinicityYear.setValue(this.currDate?.getUTCFullYear());
    this.empLocationYear.setValue(this.currDate?.getUTCFullYear());
    this.allActEmpYear.setValue(this.currDate?.getUTCFullYear());
    this.empByEthinicity.setValue(ChartTypes[6]);
    this.getTotalActiveEmployees();
    this.getTypeOfEmployment();
    this.getWorkAuthorization();
    this.getEmpByNationality();
    this.getEmpByGender();
    this.getEmpByEthnicity();
    this.getEmpByRace();
    this.getEmpByLocation();
    this.getAllActiveEmployees();
  }

  getTotalActiveEmployees(): void {
    this.isLoadActEmpSpinner = true;
    this.type = ChartTypes[1];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.activeEmpResponseData = data?.result;
          this.activeEmpTotalCount =
            this.activeEmpResponseData?.result[
              this.activeEmpResponseData?.result?.length - 1
            ]?.count;
          this.activeEmpResult = data?.result?.result;
          this.activeEmpLineChartLabels = this.activeEmpResult?.map((x) =>
            x.description?.slice(0, 3)
          );
          this.activeEmpCountData = this.activeEmpResult?.map((x) => x.count);
          this.activeEmpLineChartData = [
            { data: this.activeEmpCountData, label: 'Count' },
          ];
          this.isLoadActEmpSpinner = false;
        },
        (err) => {
          this.isLoadActEmpSpinner = false;
          console.warn(err);
        }
      );
  }

  getTypeOfEmployment(): void {
    this.isLoadTypeEmpSpinner = true;
    this.type = ChartTypes[2];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.typeOfEmploymentResponseData = data?.result;
          this.typeOfEmploymentResult = data?.result?.result;
          this.typeOfEmploymentDoughnutChartLabels =
            this.typeOfEmploymentResult?.map((x) => x.description.slice(0, 20));
          this.typeOfEmploymentCountData = this.typeOfEmploymentResult?.map(
            (x) => x.count
          );
          this.typeOfEmploymentDoughnutChartData = [
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

  getWorkAuthorization(): void {
    this.isLoadWorkAuthSpinner = true;
    this.type = ChartTypes[3];
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

  getEmpByNationality(): void {
    this.isLoadNationalitySpinner = true;
    this.type = ChartTypes[4];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.empByNationalityResponseData = data?.result;
          this.empByNationalityResult = data?.result?.result;
          this.nationalityChartLabels = this.empByNationalityResult?.map(
            (x) => x.description
          );
          this.nationalityCountData = this.empByNationalityResult?.map(
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

  getEmpByGender(): void {
    this.isLoadGenderSpinner = true;
    this.type = ChartTypes[5];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.empByGenderResponseData = data?.result;
          this.empByGenderResult = data?.result?.result;
          this.genderChartLabels = this.empByGenderResult?.map(
            (x) => x.description
          );
          this.genderCountData = this.empByGenderResult?.map((x) => x.count);
          this.genderChartData = [
            { data: this.genderCountData, label: 'Count' },
          ];
          this.isLoadGenderSpinner = false;
        },
        (err) => {
          this.isLoadGenderSpinner = false;
          console.warn(err);
        }
      );
  }

  getEmpByEthnicity(): void {
    this.isLoadEthnicitySpinner = true;
    this.type = ChartTypes[6];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.empByEthnicityResponseData = data?.result;
          this.empByEthnicityResult = data?.result?.result;
          this.ethnicityChartLabels = this.empByEthnicityResult?.map(
            (x) => x.description
          );
          this.ethnicityCountData = this.empByEthnicityResult?.map(
            (x) => x.count
          );
          this.ethnicityChartData = [
            { data: this.ethnicityCountData, label: 'Count' },
          ];
          this.isLoadEthnicitySpinner = false;
        },
        (err) => {
          this.isLoadEthnicitySpinner = false;
          console.warn(err);
        }
      );
  }

  getEmpByRace(): void {
    this.isLoadRaceSpinner = true;
    this.type = ChartTypes[16];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.empByRaceResponseData = data?.result;
          this.empByRaceResult = data?.result?.result;
          this.raceChartLabels = this.empByRaceResult?.map((x) =>
            x.description.slice(0, 30)
          );
          this.raceCountData = this.empByRaceResult?.map((x) => x.count);
          this.raceChartData = [{ data: this.raceCountData, label: 'Count' }];
          this.isLoadRaceSpinner = false;
        },
        (err) => {
          this.isLoadRaceSpinner = false;
          console.warn(err);
        }
      );
  }

  getEmpByLocation(): void {
    this.isLoadEmpLocationSpinner = true;
    this.type = ChartTypes[7];
    this.hrDashboardService
      .getDashboardChartsPopupScreenData(this.type, this.key, this.value)
      .subscribe(
        (data) => {
          this.empLocationResponseData = data?.result;
          this.empLocationResult = data?.result?.result;
          this.empByLocationChartLabels = this.empLocationResult?.map(
            (x) => x.description
          );
          this.empByLocationCountData = this.empLocationResult?.map(
            (x) => x.count
          );
          this.empByLocationChartData = [
            {
              maxBarThickness: 10,
              data: this.empByLocationCountData,
              label: 'Count',
            },
          ];
          this.isLoadEmpLocationSpinner = false;
        },
        (err) => {
          this.isLoadEmpLocationSpinner = false;
          console.warn(err);
        }
      );
  }

  getAllActiveEmployees(): void {
    this.activeEmployeePanelConfig.isLoading = true;
    this.hrDashboardService
      .getAllActiveEmployeesData(
        this.value,
        this.searchTerm,
        this.pageNum,
        this.pageSize,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(
        (data) => {
          this.activeEmployeeResultParser(data?.result);
          this.activeEmployeePanelConfig.isLoading = false;
        },
        (err) => {
          this.activeEmployeePanelConfig.isLoading = false;
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

  actEmpYearSelection(): void {
    this.value = this.actEmpYear.value;
    this.getTotalActiveEmployees();
  }

  typeOfEmpYearSelection(): void {
    this.value = this.typeOfEmpYear.value;
    this.getTypeOfEmployment();
  }

  genderEmpYearSelection(): void {
    this.value = this.genderEmpYear.value;
    this.getEmpByGender();
  }

  workAuthYearSelection(): void {
    this.value = this.workAuthYear.value;
    this.getWorkAuthorization();
  }

  nationalityYearSelection(): void {
    this.value = this.empByNationalityYear.value;
    this.getEmpByNationality();
  }

  ethinicityYearSelection(): void {
    this.value = this.empByEthinicityYear.value;
    this.type = this.empByEthinicity.value;
    switch (this.type) {
      case ChartTypes[6]:
        this.getEmpByEthnicity();
        break;
      case ChartTypes[16]:
        this.getEmpByRace();
        break;
    }
  }

  ethinicitySelection(): void {
    this.value = this.empByEthinicityYear.value;
    this.type = this.empByEthinicity.value;
    switch (this.type) {
      case ChartTypes[6]:
        this.getEmpByEthnicity();
        break;
      case ChartTypes[16]:
        this.getEmpByRace();
        break;
    }
  }

  empLocationYearSelection(): void {
    this.value = this.empLocationYear.value;
    this.getEmpByLocation();
  }

  allActEmpYearSelection(): void {
    this.value = this.allActEmpYear.value;
    this.getAllActiveEmployees();
  }

  exportToCsvAllCharts(type: string, dataType: string): void {
    this.dataType = dataType;
    switch (type) {
      case ChartTypeDesc.TotalActiveEmployees:
        this.widgetType = this.ChartTypes[1];
        break;
      case ChartTypeDesc.TypeOfEmployment:
        this.widgetType = this.ChartTypes[2];
        break;
      case ChartTypeDesc.EmployeeWorkAuthorization:
        this.widgetType = this.ChartTypes[3];
        break;
      case ChartTypeDesc.EmployeeNationality:
        this.widgetType = this.ChartTypes[4];
        break;
      case ChartTypeDesc.EmployeeGender:
        this.widgetType = this.ChartTypes[5];
        break;
      case ChartTypeDesc.EmployeeEthnicity:
        this.widgetType = this.ChartTypes[6];
        break;
      case ChartTypeDesc.EmployeeLocation:
        this.widgetType = this.ChartTypes[7];
        break;
      case ChartTypeDesc.EmployeeRace:
        this.widgetType = this.ChartTypes[16];
        break;
    }
  }

  exportToCsvAllActiveEmpTable(dataType: string): void {
    this.dataType = dataType;
    this.dataGridType = DataGridTypes[1];
  }

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }

  getNextRecords(event: CurrentPage): void {
    this.hrDashboardService
      .getAllActiveEmployeesData(
        this.value,
        this.searchTerm,
        event.pageIndex,
        event.pageSize,
        this.sortColumn,
        this.sortDirection
      )
      .subscribe(
        (data) => {
          this.activeEmployeeResultParser(data?.result);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  activeEmployeeResultParser(
    activeEmpResultData: ChartGetAllActiveEmpData
  ): void {
    this.activeEmployeePanelConfig.isLoading = false;
    this.activeEmployeePanelConfig.totalRows =
      activeEmpResultData?.virtualCount;
    this.activeEmployeePanelConfig.tableData =
      activeEmpResultData?.results?.map((item, index) => {
        return {
          ...item,
        };
      });
  }

  performSearch(search: string): void {
    this.searchTerm = search;
    if (search.length >= 2 || search.length === 0) {
      this.getAllActiveEmployees();
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
