import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.component.scss'],
})
export class QuickLinksComponent implements OnInit {
  @Input() infoType = '';
  hostUrl = environment.hostUrl;
  index = 0;
  isMovingForward = true;
  isMovingBackward = true;
  quickLinkName: string[] = [];
  quickLinkImage: string[] = [];
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.quickLinkName.push('Benefits');
    this.quickLinkImage.push('benefits.svg');
    this.quickLinkName.push('Payroll');
    this.quickLinkImage.push('payday.svg');
    this.quickLinkName.push('Reports');
    this.quickLinkImage.push('analysis.svg');
    this.quickLinkName.push('Timesheet');
    this.quickLinkImage.push('schedule.svg');
    this.quickLinkName.push('All Documents');
    this.quickLinkImage.push('folder.svg');

    if (this.quickLinkName.length === 4) {
      this.isMovingForward = false;
      this.isMovingBackward = false;
    }
    if (this.quickLinkName.length > 4) {
      this.isMovingForward = true;
      this.isMovingBackward = false;
    }
  }

  movingBackward(): void {
    this.isMovingForward = true;
    this.index = this.index - 1;
    if (this.index === 0) {
      this.isMovingBackward = false;
    }
  }

  movingForkward(): void {
    this.isMovingBackward = true;
    this.index = this.index + 1;
    if (this.index === this.quickLinkName.length - 4) {
      this.isMovingForward = false;
    }
  }

  goToExternalUrl(urlName: string): void {
    switch (urlName) {
      case 'Benefits':
        window.open(
          'https://app.maxwellhealth.com/hr/v2/login?#/team/members',
          '_blank'
        );
        break;
      case 'Payroll':
        window.open(
          'https://online.adp.com/signin/v1/?APPID=Pin4NAS&productId=80e309c3-709e-bae1-e053-3505430b5495&returnURL=https://login.adp.com&callingAppId=landing&TARGET=-SM-https://login.adp.com/ee/getProducts?event=Next&userSelected=anActiveEmployee&transId=67M-958-6J3PP3',
          '_blank'
        );
        break;
      case 'Reports':
        window.open(
          `${this.hostUrl}WebATS//Interface/Reports/ReportsHome.aspx?TabId=d48ed411-40de-4d12-b6b9-2d3dcab5424d`,
          '_blank'
        );
        break;
      case 'Timesheet':
        if (this.infoType === 'HR') {
          window.open(
            `${this.hostUrl}WebATS//Interface/Reports/DueTimesheets.aspx?rpageid=ece72042-c6d4-4260-8ba2-75125fea87ed#`,
            '_blank'
          );
        } else if (this.infoType === 'Employee') {
          window.open(
            `${this.hostUrl}WebATS//Interface/TimeSheet/TimesheetList.aspx`,
            '_blank'
          );
        }
        break;
    }
  }
  goToDocuments(): void {
    this.router.navigate(['/aura/home/my-documents']);
  }
}
