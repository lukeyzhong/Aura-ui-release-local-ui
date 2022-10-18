import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.component.html',
  styleUrls: ['./manage-employees.component.scss']
})
export class ManageEmployeesComponent implements OnInit {
  hostUrl = environment.hostUrl;
  constructor() { }

  ngOnInit(): void {
    window.open(
      `${this.hostUrl}/WebATS//Interface/Employee/EmployeeList.aspx?role=14&menu=ef803d16-31af-4e17-97ca-1a0fe06878ec&abbr=HR-M&`,
      '_self'
    );

  }

}
