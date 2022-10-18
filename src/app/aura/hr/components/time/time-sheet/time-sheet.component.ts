import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.scss']
})
export class TimeSheetComponent implements OnInit {
  hostUrl = environment.hostUrl;
  constructor() { }

  ngOnInit(): void {
    window.open(
      `${this.hostUrl}/WebATS//Interface/TimeSheet/TimesheetList.aspx`,
      '_self'
    );
  }

}
