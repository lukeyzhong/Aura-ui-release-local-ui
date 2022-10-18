import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
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

@Component({
  selector: 'app-pto-chart',
  templateUrl: './pto-chart.component.html',
  styleUrls: ['./pto-chart.component.scss'],
})
export class PtoChartComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() employeeId = '';
  @Input() roleCode = '';
  empKey = 'EmployeeId';
  empValue = '';
  ptoChartData!: EmployeeChartsData;
  ptoChartResult!: EmployeeChartsResult[];
  countText!: this;
  inValue = '';

  // PTO Chart : Start
  isLoadPTOChartSpinner = false;
  public empPTODoughnutChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public ptoCountData: number[] = [];
  public empPTODoughnutChartLabels: Label[] = [];
  public empPTODoughnutChartOptions: ChartOptions = {
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
  public empPTODoughnutChartColors: Color[] = [
    {
      backgroundColor: [
        '#3275c3',
        '#ea7272',
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
  public empPTODoughnutChartLegend = true;
  public empPTODoughnutChartType: ChartType = 'doughnut';
  // PTO Chart : End

  constructor(private employeeDashboardService: EmployeeDashboardService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.employeeId && changes?.employeeId?.currentValue) {
      this.empValue = changes.employeeId?.currentValue;
      this.getPTOChart();
    }
  }

  ngAfterViewInit(): void {
    this.countText = this;
    this.doughnutChartPlugins = [
      this.returnObjectdoughnutChartPlugins(this.countText),
    ];
  }

  getPTOChart(): void {
    this.isLoadPTOChartSpinner = true;
    this.employeeDashboardService
      .getEmployeeDashboardPTOCharts(this.empKey, this.empValue)
      .subscribe(
        (data) => {
          this.ptoChartData = data?.result;
          this.inValue = Math.round(this.ptoChartData?.totalCount)?.toString();

          if (this.ptoChartData?.totalCount === 0) {
            this.empPTODoughnutChartLegend = false;
          } else {
            this.empPTODoughnutChartLegend = true;
          }
          this.ptoChartResult = data?.result?.result;
          this.empPTODoughnutChartLabels = this.ptoChartResult?.map(
            (x) => x.description
          );
          this.ptoCountData = this.ptoChartResult?.map((x) => x.count);
          this.empPTODoughnutChartData = [
            { data: this.ptoCountData, label: 'Count' },
          ];
          this.isLoadPTOChartSpinner = false;
        },
        (err) => {
          this.isLoadPTOChartSpinner = false;
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
        if (txt === '0' || txt === 'NaN') {
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
