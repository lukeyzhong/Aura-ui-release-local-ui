import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import {
  ChartsPopupScreenData,
  ChartsPopupScreenResult,
} from '../../../interface/dashboard/hr-dashboard.interface';
import * as ChartDataLabels from 'chartjs-plugin-datalabels';
import { HrDashboardService } from '../../../service/dashboard/hr-dashboard.service';
import { ChartTypes } from '../../../enum/chartTypes.enum';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { TaskDetailsComponent } from './task-details/task-details.component';
@Component({
  selector: 'app-dashboard-mytasks',
  templateUrl: './dashboard-mytasks.component.html',
  styleUrls: ['./dashboard-mytasks.component.scss'],
})
export class DashboardMytasksComponent implements OnInit, AfterViewInit {
  taskChartResponseData!: ChartsPopupScreenData;
  taskChartResult!: ChartsPopupScreenResult[];
  currDate!: Date;
  currYear = '';
  type!: string;
  yearKey = 'year';
  fromDateKey = 'fromDate';
  fromDateValue: string | null = '';
  toDateKey = 'todate';
  toDateValue: string | null = '';
  dateFilter!: FormGroup;
  taskFromDate: string | null = '';
  taskToDate: string | null | Date = '';
  currentDate!: Date;
  toggleDiv = false;
  isLoadTaskCountSpinner = false;
  taskCountResult = new Map<string, number>();
  taskForm!: FormGroup;
  // tslint:disable-next-line: no-any
  taskCounts: any[] = [];
  index = 0;
  isTaskBackward = true;
  isTaskForward = true;
  countText!: this;
  inValue = '';

  // Task Chart : Start
  isLoadTaskChartSpinner = false;
  public taskDoughnutChartData: ChartDataSets[] = [{ data: [], label: '' }];
  public taskCountData: number[] = [];
  public taskDoughnutChartLabels: Label[] = [];
  public taskDoughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutoutPercentage: 50,
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
  public taskDoughnutChartColors: Color[] = [
    {
      backgroundColor: [
        '#45b9e0',
        '#5a96e2',
        '#6671e3',
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
  public taskDoughnutChartLegend = true;
  public taskDoughnutChartType: ChartType = 'doughnut';
  // Task Chart : End

  constructor(
    private hrDashboardService: HrDashboardService,
    private datepipe: DatePipe,
    private dateFilterBuilder: FormBuilder,
    private fb: FormBuilder,
    private dialog: MatDialog,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>
  ) { }

  ngOnInit(): void {
    this.currDate = new Date();
    this.currYear = this.currDate.getFullYear().toString();
    this.dateFilter = this.dateFilterBuilder.group(
      {
        taskFromDate: [this.currentDate],
        taskToDate: [''],
      },
      { validator: this.validateProjectDates }
    );

    this.taskForm = this.fb.group({
      chkBoxProperty: this.fb.array([this.addchkBoxPropertyFormGroup()]),
    });

    if (this.index === 0) {
      this.isTaskBackward = false;
    }

    this.getTaskChart();
    this.getTaskCount();
  }

  ngAfterViewInit(): void {
    this.countText = this;
    this.doughnutChartPlugins = [
      this.returnObjectDoughnutChartPlugins(this.countText),
    ];
  }

  // tslint:disable-next-line: no-any
  returnObjectDoughnutChartPlugins(countText: this): any {
    return {
      // tslint:disable-next-line: no-any
      beforeDraw(chart: any): void {
        const ctx = chart.ctx;
        let txt: string = countText.inValue?.toString();
        if (txt === '0') {
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

  get chkBoxProperty(): FormArray {
    return this.taskForm.get('chkBoxProperty') as FormArray;
  }

  addchkBoxPropertyFormGroup(): FormGroup {
    return this.fb.group({
      checkBox: [''],
      chkBoxKey: [''],
      chkBoxValue: [''],
    });
  }

  setCheckBoxProperty(taskCountResult: Map<string, number>): FormArray {
    const formArray = new FormArray([]);
    Object.entries(taskCountResult).forEach((d) => {
      formArray.push(
        this.fb.group({
          checkBox: true,
          chkBoxKey: d[0],
          chkBoxValue: d[1],
        })
      );
    });
    return formArray;
  }

  // tslint:disable-next-line: no-any
  validateProjectDates(group: FormGroup): any {
    if (
      group.controls.taskToDate.value &&
      group.controls.taskToDate.value < group.controls.taskFromDate.value
    ) {
      return { notValid: true };
    }
    return null;
  }

  taskBackward(): void {
    this.isTaskForward = true;
    this.index = this.index - 1;
    if (this.index === 0) {
      this.isTaskBackward = false;
    }
  }

  taskForward(): void {
    this.isTaskBackward = true;
    this.index = this.index + 1;
    if (this.index === this.taskCounts.length - 3) {
      this.isTaskForward = false;
    }
  }

  getTaskChart(): void {
    this.isLoadTaskChartSpinner = true;
    this.type = ChartTypes[8];
    this.hrDashboardService
      .getDashboardTasksChart(
        this.type,
        this.yearKey,
        this.fromDateKey,
        // tslint:disable-next-line: no-non-null-assertion
        this.fromDateValue!,
        this.toDateKey,
        // tslint:disable-next-line: no-non-null-assertion
        this.toDateValue!
      )
      .subscribe(
        (data) => {
          this.taskChartResponseData = data?.result;
          this.inValue = this.taskChartResponseData?.totalCount.toString();

          if (this.taskChartResponseData.totalCount === 0) {
            this.taskDoughnutChartLegend = false;
          } else {
            this.taskDoughnutChartLegend = true;
          }
          this.taskChartResult = data?.result?.result;
          this.taskDoughnutChartLabels = this.taskChartResult?.map(
            (x) => x.description
          );
          this.taskCountData = this.taskChartResult?.map((x) => x.count);
          this.taskDoughnutChartData = [
            { data: this.taskCountData, label: 'Count' },
          ];
          this.isLoadTaskChartSpinner = false;
        },
        (err) => {
          this.isLoadTaskChartSpinner = false;
          console.warn(err);
        }
      );
  }

  getTaskCount(): void {
    this.isLoadTaskCountSpinner = true;
    this.hrDashboardService.getHRDashboardTaskCount().subscribe(
      (data) => {
        this.taskCountResult = data?.result;
        this.isLoadTaskCountSpinner = false;
        this.taskForm.setControl(
          'chkBoxProperty',
          this.setCheckBoxProperty(this.taskCountResult)
        );
        this.taskCounts = [];
        for (const chkVal of this.chkBoxProperty?.controls) {
          if (chkVal?.get('checkBox')?.value) {
            this.taskCounts.push({
              key: chkVal?.get('chkBoxKey')?.value,
              value: chkVal?.get('chkBoxValue')?.value,
            });
          }
        }
        if (this.taskCounts.length <= 3) {
          this.isTaskForward = false;
        }
      },
      (err) => {
        this.isLoadTaskCountSpinner = false;
        console.warn(err);
      }
    );
  }

  updateTaskChart(type: string): void {
    switch (type) {
      case 'start':
        {
          if (this.dateFilter.controls.taskFromDate.value === null) {
            this.toDateValue = '';
            this.fromDateValue = '';
            this.dateFilter.controls.taskToDate.setValue('');
          } else {
            const searchDate = this.datepipe.transform(
              this.dateFilter.controls.taskFromDate.value,
              'yyyy-MM-dd'
            );
            this.fromDateValue = searchDate;
            this.toDateValue =
              this.toDateValue === null || this.toDateValue === ''
                ? ''
                : this.datepipe.transform(this.toDateValue, 'yyyy-MM-dd');
          }
        }
        break;
      case 'end':
        {
          this.currentDate = new Date();
          if (this.dateFilter.controls.taskFromDate.value === null) {
            this.dateFilter.controls.taskFromDate.setValue(this.currentDate);
            this.fromDateValue = String(
              this.datepipe.transform(this.currentDate, 'yyyy-MM-dd')
            );
          }
          const searchDate = this.datepipe.transform(
            this.dateFilter.controls.taskToDate.value,
            'yyyy-MM-dd'
          );
          this.toDateValue =
            searchDate === null || searchDate === '' ? '' : searchDate;
        }
        break;
    }

    this.getTaskChart();
  }

  resetDates(): void {
    this.dateFilter.controls.taskFromDate.reset();
    this.dateFilter.controls.taskToDate.reset();
    this.fromDateValue = '';
    this.toDateValue = '';
    this.getTaskChart();
  }

  toggle(): void {
    this.toggleDiv = !this.toggleDiv;
  }

  saveCheckBoxSelection(): void {
    this.taskCounts = [];
    this.index = 0;
    for (const chkVal of this.chkBoxProperty?.controls) {
      if (chkVal?.get('checkBox')?.value) {
        this.taskCounts.push({
          key: chkVal?.get('chkBoxKey')?.value,
          value: chkVal?.get('chkBoxValue')?.value,
        });
      }
    }
    if (this.taskCounts.length <= 3) {
      this.isTaskForward = false;
    } else {
      this.isTaskForward = true;
    }
    if (this.index === 0) {
      this.isTaskBackward = false;
    }
    this.toggleDiv = !this.toggleDiv;
  }

  taskDetails(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '95%';
    this.dialogRef = this.dialog.open(TaskDetailsComponent, dialogConfig);
  }
}
