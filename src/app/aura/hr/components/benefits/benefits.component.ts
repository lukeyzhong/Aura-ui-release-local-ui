import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-benefits',
  templateUrl: './benefits.component.html',
  styleUrls: ['./benefits.component.scss'],
})
export class BenefitsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    window.open(
      `https://app.maxwellhealth.com/hr/v2/login?#/team/members`,
      '_self'
    );
  }
}
