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
import { AttritionDetailsComponent } from '../attrition-details/attrition-details.component';
const ChartHeaderHeight = 60;
@Component({
  selector: 'app-dashboard-attrition-emp-charts',
  templateUrl: './dashboard-attrition-emp-charts.component.html',
  styleUrls: ['./dashboard-attrition-emp-charts.component.scss'],
})
export class DashboardAttritionEmpChartsComponent implements OnInit {
  filterHeight = 100;
  chartResponseData!: ChartResponseData;
  chartResult: ChartResult[] = [];
  chartResultPreviousYearMonth: ChartResult[] = [];
  currYear = '';
  previousYear!: number;
  currMonth!: number;
  monthName = '';
  lblCharts: string[] = [];
  attritionUp = false;
  attritionDown = true;
  isLoadSpinner = false;
  Math = Math;

  // Attrition Employees : Start
  public attritionLineChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public attritionCountData: number[] = [];
  public attritionLineChartLabels: Label[] = this.lblCharts;
  public attritionLineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        display: true,
        color: '#DD6464',
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
            fontColor: '#DD6464',
          },
        },
      ],
      yAxes: [
        {
          display: false,
          ticks: {
            beginAtZero: false,
            stepSize: 1450,
          },
          gridLines: {
            display: false,
            color: '#fff',
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
  public attritionLineChartColors: Color[] = [
    {
      borderColor: '#DD6464',
      borderWidth: 1.5,
      backgroundColor: '#FFD9DA',
      pointBackgroundColor: '#dd6464',
      pointHoverBackgroundColor: '#dd6464',
      pointRadius: 3,
      pointHoverRadius: 3.5,
      pointStyle: 'circle',
    },
  ];
  public attritionLineChartLegend = true;
  public attritionLineChartType: ChartType = 'line';
  // Attrition Employees : End

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
        this.attritionCountData = this.chartResult?.map(
          (x) => x.attritedEmployeeCount
        );
        this.attritionLineChartData = [
          { data: this.attritionCountData, label: 'Count' },
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
    // Attrition Employees : Start
    if (
      // tslint:disable-next-line: no-non-null-assertion
      this.chartResponseData?.totalAttritedEmployeeCount! >=
      this.chartResultPreviousYearMonth[0]?.attritedEmployeeCount
    ) {
      this.attritionUp = true;
      this.attritionDown = false;
    }
    if (
      // tslint:disable-next-line: no-non-null-assertion
      this.chartResponseData?.totalAttritedEmployeeCount! <
      this.chartResultPreviousYearMonth[0]?.attritedEmployeeCount
    ) {
      this.attritionUp = false;
      this.attritionDown = true;
    }
    // Attrition Employees : End
  }

  attritionDetails(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '95%';
    this.dialogRef = this.dialog.open(AttritionDetailsComponent, dialogConfig);
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
