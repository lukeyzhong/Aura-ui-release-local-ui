import { Component, OnInit } from '@angular/core';
import {
  ChartDataSets,
  ChartOptions,
  ChartTooltipModel,
  ChartType,
} from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { Months } from '../../../../enum/months.enum';
import {
  ChartResponseData,
  ChartResult,
} from '../../../../interface/dashboard/hr-dashboard.interface';
import { HrDashboardService } from '../../../../service/dashboard/hr-dashboard.service';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { ActiveEmpDetailsComponent } from '../active-emp-details/active-emp-details.component';
const ChartHeaderHeight = 60;
@Component({
  selector: 'app-dashboard-active-emp-charts',
  templateUrl: './dashboard-active-emp-charts.component.html',
  styleUrls: ['./dashboard-active-emp-charts.component.scss'],
})
export class DashboardActiveEmpChartsComponent implements OnInit {
  filterHeight = 100;
  chartResponseData!: ChartResponseData;
  chartResult: ChartResult[] = [];
  chartResultPreviousYearMonth: ChartResult[] = [];
  currYear = '';
  previousYear!: number;
  currMonth!: number;
  monthName = '';
  lblCharts: string[] = [];
  activeEmpUp = true;
  activeEmpDown = false;
  Math = Math;

  // Active Employees : Start
  isLoadSpinner = false;
  public activeEmpLineChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public activeEmpCountData: number[] = [];
  public activeEmpLineChartLabels: Label[] = this.lblCharts;
  public activeEmpLineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#3087bc',
        // anchor: 'end',
        align: 'end',
        font: {
          size: 9,
          //  weight: 'bold'
        },
      },
    },
    scales: {
      xAxes: [
        {
          display: true,
          gridLines: {
            display: false,
            color: 'rgba(0, 0, 0, 0)',
          },
          ticks: {
            beginAtZero: false,
            fontSize: 10,
            fontColor: '#2d85b9',
          },
        },
      ],
      yAxes: [
        {
          display: false,
          ticks: {
            beginAtZero: false,
            stepSize: 1100,
          },
          gridLines: {
            display: false,
            color: 'rgba(0, 0, 0, 0)',
          },
        },
      ],
    },
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    tooltips: {
      enabled: false,
      bodyFontSize: 16,
      bodyFontFamily: 'Arial, Helvetica, sans-serif',
      yPadding: 19,
      displayColors: false,
      mode: 'nearest',
      intersect: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 67;
        tooltipModel.width = 90;
        tooltipModel.titleMarginBottom = 8;
        tooltipModel.titleFontSize = 15;
      }.bind(this),
    },
  };
  public activeEmpLineChartColors: Color[] = [
    {
      borderColor: '#47A0D6',
      borderWidth: 1.5,
      backgroundColor: '#BCE5FF',
      pointBackgroundColor: '#47A0D6',
      pointHoverBackgroundColor: '#47A0D6',
      pointRadius: 3,
      pointHoverRadius: 3.5,
      pointStyle: 'circle',
    },
  ];
  public activeEmpLineChartLegend = false;
  public activeEmpLineChartType: ChartType = 'line';
  // Active Employees : End

  constructor(
    private hrDashboardService: HrDashboardService,
    private dialog: MatDialog,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.setDashboardChartData();
  }

  setDashboardChartData(): void {
    this.isLoadSpinner = true;
    const currDate = new Date();
    this.currYear = currDate?.getFullYear()?.toString();
    this.previousYear = currDate?.getUTCFullYear() - 1;
    this.currMonth = currDate?.getMonth();
    this.monthName = Months[this.currMonth];
    for (let i = 0; i <= this.currMonth; i++) {
      // this.lblCharts.push(Months[i]?.slice(0, 3) + ' ' + this.currYear);
      this.lblCharts.push(Months[i]?.slice(0, 3));
    }
    this.hrDashboardService.getHRDashboardChartData(this.currYear).subscribe(
      (data) => {
        this.chartResponseData = data?.result;
        this.chartResultPreviousYearMonth = data?.result?.result?.slice(0, 1);
        this.chartResult = data?.result?.result?.slice(1, 13);
        this.activeEmpCountData = this.chartResult?.map(
          (x) => x.activeEmployeeCount
        );
        this.activeEmpLineChartData = [
          { data: this.activeEmpCountData, label: 'Count' },
        ];
        this.setUpAndDownArrowForCharts();
        this.isLoadSpinner = false;
      },
      (err) => {
        this.isLoadSpinner = false;
        console.warn(err);
      }
    );
  }

  setUpAndDownArrowForCharts(): void {
    // Active Employees : Start
    if (
      // tslint:disable-next-line: no-non-null-assertion
      this.chartResponseData?.totalActiveEmployeesCount! >=
      // tslint:disable-next-line: no-non-null-assertion
      this.chartResultPreviousYearMonth[0]?.activeEmployeeCount!
    ) {
      this.activeEmpUp = true;
      this.activeEmpDown = false;
    }
    if (
      // tslint:disable-next-line: no-non-null-assertion
      this.chartResponseData?.totalActiveEmployeesCount! <
      // tslint:disable-next-line: no-non-null-assertion
      this.chartResultPreviousYearMonth[0]?.activeEmployeeCount!
    ) {
      this.activeEmpUp = false;
      this.activeEmpDown = true;
    }
    // Active Employees : End
  }

  activeEmployeesDetails(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '95%';
    this.dialogRef = this.dialog.open(ActiveEmpDetailsComponent, dialogConfig);
  }

  getChartHeight(): string {
    let sumheight;
    if (this.filterHeight) {
        sumheight = ChartHeaderHeight + this.filterHeight;
    } else {
        sumheight = ChartHeaderHeight;
    }
    return `calc(100% - ${sumheight}px)`;
}
}
