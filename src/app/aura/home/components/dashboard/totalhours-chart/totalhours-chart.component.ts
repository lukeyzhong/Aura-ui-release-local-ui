import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  ChartDataSets,
  ChartOptions,
  ChartTooltipModel,
  ChartType,
} from 'chart.js';
import {
  Color,
  Label,
  PluginServiceGlobalRegistrationAndOptions,
} from 'ng2-charts';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  EmployeeChartsData,
  EmployeeChartsResult,
} from '../../../interface/employee-dashboard.interface';
import { EmployeeDashboardService } from '../../../service/dashboard/employee-dashboard.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-totalhours-chart',
  templateUrl: './totalhours-chart.component.html',
  styleUrls: ['./totalhours-chart.component.scss'],
})
export class TotalhoursChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() employeeId = '';
  @Input() roleCode = '';
  empKey = 'EmployeeId';
  empValue = '';
  yearKey = 'year';
  yearValue = '';
  totalHoursChartData!: EmployeeChartsData;
  totalHoursWorkedChartResult!: EmployeeChartsResult[];
  countText!: this;
  inValue = '';
  year: number[] = [];
  currYear = '';
  currDate!: Date;
  workYear = new FormControl([]);

  // Total Hours Worked Chart : Start
  isLoadTotalHoursChartSpinner = false;
  public empTotalHoursDoughnutChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public totalHoursCountData: number[] = [];
  public empTotalHoursDoughnutChartLabels: Label[] = [];
  public empTotalHoursDoughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 57,
    plugins: {
      datalabels: {
        color: '#FFFFFF',
        anchor: 'center',
        align: 'center',
        formatter: Math.round,
        font: {
          weight: 'bold',
        },
      },
      labels: {
        render: [ChartDataLabels],
      },
    },
    legend: {
      position: 'right',
      onHover: (event, chartElement) => {
        (event.target as HTMLInputElement).style.cursor = 'pointer';
      },
      onLeave: (event, chartElement) => {
        (event.target as HTMLInputElement).style.cursor = 'default';
      },
    },
    tooltips: {
      bodyFontSize: 14,
      yPadding: 11,
      displayColors: false,
      // tslint:disable-next-line: only-arrow-functions
      custom: function(tooltipModel: ChartTooltipModel): void {
        tooltipModel.height = 33;
        tooltipModel.backgroundColor = '#000';
        tooltipModel.title = [];
      }.bind(this),
    },
  };
  public empTotalHoursDoughnutChartColors: Color[] = [
    {
      backgroundColor: [
        '#3275c3',
        '#5a96e2',
        '#FFFFFF',
        '#0390fc',
        '#03dffc',
        '#32a852',
      ],
      borderColor: [
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
  public doughnutChartPlugins: PluginServiceGlobalRegistrationAndOptions[] = [
    {},
  ];
  public totalHoursDoughnutChartPlugins = [
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
      //  tslint:disable-next-line: typedef
       chart.legend.afterFit = function() {
         this.width += 25;
       };
     }
  }
  ];
  public empTotalHoursDoughnutChartLegend = true;
  public empTotalHoursDoughnutChartType: ChartType = 'doughnut';
  // Total Hours Worked : End

  constructor(private employeeDashboardService: EmployeeDashboardService) {}

  ngOnInit(): void {
    this.currDate = new Date();
    this.currYear = this.currDate.getFullYear().toString();
    this.yearValue = this.currYear;
    for (let i = 0; i <= 4 ; i++){
      this.year.push(this.currDate?.getUTCFullYear() - i);
    }
    this.workYear.setValue(this.currDate?.getUTCFullYear());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.employeeId && changes?.employeeId?.currentValue) {
      this.empValue = changes.employeeId?.currentValue;
      this.getTotalHoursWorkedChart();
    }
  }

  ngAfterViewInit(): void {
    this.countText = this;
    this.doughnutChartPlugins = [
      this.returnObjectdoughnutChartPlugins(this.countText),
    ];
  }

  workYearSelection(): void{
    this.yearValue = this.workYear.value;
    this.getTotalHoursWorkedChart();
  }

  getTotalHoursWorkedChart(): void {
    this.isLoadTotalHoursChartSpinner = true;
    this.employeeDashboardService
      .getEmployeeDashboardTotalHoursWorkedCharts(this.empKey, this.empValue, this.yearKey, this.yearValue)
      .subscribe(
        (data) => {
          this.totalHoursChartData = data?.result;
          this.inValue = Math.round(this.totalHoursChartData?.totalCount)?.toString();

          if (this.totalHoursChartData.totalCount === 0) {
            this.empTotalHoursDoughnutChartLegend = false;
          } else {
            this.empTotalHoursDoughnutChartLegend = true;
          }
          this.totalHoursWorkedChartResult = data?.result?.result;
          this.empTotalHoursDoughnutChartLabels = this.totalHoursWorkedChartResult?.map(
            (x) => x.description
          );
          this.totalHoursCountData = this.totalHoursWorkedChartResult?.map((x) => x.count);
          this.empTotalHoursDoughnutChartData = [
            { data: this.totalHoursCountData, label: 'Count' },
          ];
          this.isLoadTotalHoursChartSpinner = false;
        },
        (err) => {
          this.isLoadTotalHoursChartSpinner = false;
          console.warn(err);
        }
      );
  }

  // tslint:disable-next-line: no-any
  returnObjectdoughnutChartPlugins(countText: this): any {
    return {
      // tslint:disable-next-line: no-any
      beforeDraw(chart: any): void {
        const ctx = chart.ctx;
        let txt: string = countText.inValue?.toString();
        if (txt === '0'){
          txt = '';
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
        const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
        const fontSizeToUse = 2.5;
        ctx.font = `${fontSizeToUse}vh arial`;
        ctx.fillText(txt, centerX, centerY);
      },
    };
  }
}
