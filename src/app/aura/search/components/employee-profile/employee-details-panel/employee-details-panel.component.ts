import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-details-panel',
  templateUrl: './employee-details-panel.component.html',
  styleUrls: ['./employee-details-panel.component.scss'],
})
export class EmployeeDetailsPanelComponent implements OnInit {
  @Input() personId = '';
  @Input() personName = '';
  @Input() id = '';

  constructor() {}

  ngOnInit(): void {}
}
