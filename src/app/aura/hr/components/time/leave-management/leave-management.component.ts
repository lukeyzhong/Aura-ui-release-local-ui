import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-leave-management',
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss'],
})
export class LeaveManagementComponent implements OnInit {
  hostUrl = environment.hostUrl;
  employeeId = '';
  constructor() {}

  ngOnInit(): void {
    if (localStorage.id) {
      this.employeeId = localStorage.id;
      window.open(
        `${this.hostUrl}/WebATS//Interface/TimeSheet/ApplyPTO.aspx?EmployeeId=${this.employeeId}&rpageid=24b5abd6-5185-43ab-af7e-4a883c05a7a1&TabId=ffa07769-5e02-4ea1-9781-5ce50db363cc`,
        '_self'
      );
    }
  }
}
