import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { DashboardAssignmentsResult } from '../../interface/generic-dashboard.interface';

@Component({
  selector: 'app-generic-tasks',
  templateUrl: './generic-tasks.component.html',
  styleUrls: ['./generic-tasks.component.scss'],
})
export class GenericTasksComponent implements OnInit, OnChanges {
  @Input() dashboardAssignmentsResult!: DashboardAssignmentsResult[];
  @Input() infoType = '';
  @Input() onboardingId = '';
  @Input() jobTitle = '';
  assignmentsResult!: DashboardAssignmentsResult[];
  isLoading = false;
  totalAssignments = 0;
  assignmentDueDate!: string;
  linkExpired = false;

  constructor(private router: Router) { }

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;
    if (
      changes?.dashboardAssignmentsResult &&
      changes?.dashboardAssignmentsResult?.currentValue
    ) {
      this.assignmentsResult =
        changes?.dashboardAssignmentsResult?.currentValue;
      this.totalAssignments = this.assignmentsResult.length;
    }
    this.isLoading = false;
  }

  ngOnInit(): void { }

  goToOnboarding(task: DashboardAssignmentsResult): void {
    if (task?.assignmentTypeCode === 26) {
      this.assignmentDueDate = task?.assignmnetDueDate;
      const assignDueDate = new Date(Date.parse(this.assignmentDueDate));
      const assignDueDateUTC = assignDueDate + ' UTC';
      const assignDueDateIST = new Date(assignDueDateUTC);
      if (new Date(assignDueDateIST).getTime() > new Date().getTime()) {
        this.linkExpired = false;
        window.open(task?.url, '_self');
      } else {
        this.linkExpired = true;
      }
    }
    else {
      window.open(task?.url, '_self');
    }
  }
}
