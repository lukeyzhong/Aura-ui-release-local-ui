import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-additional-documents',
  templateUrl: './employee-additional-documents.component.html',
  styleUrls: ['./employee-additional-documents.component.scss']
})
export class EmployeeAdditionalDocumentsComponent implements OnInit {
  @Input() personName = '';
  @Input() employeeId = '';
  constructor() { }

  ngOnInit(): void {
  }
}
