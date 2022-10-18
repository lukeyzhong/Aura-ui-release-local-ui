import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  hostUrl = environment.hostUrl;
  constructor() { }

  ngOnInit(): void {
    window.open(
      `${this.hostUrl}WebATS//Interface/Reports/ReportsHome.aspx?TabId=d48ed411-40de-4d12-b6b9-2d3dcab5424d`,
      '_self'
    );
  }

}
