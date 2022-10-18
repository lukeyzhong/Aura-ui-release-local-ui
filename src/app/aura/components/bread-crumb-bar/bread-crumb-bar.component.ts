import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bread-crumb-bar',
  templateUrl: './bread-crumb-bar.component.html',
  styleUrls: ['./bread-crumb-bar.component.scss'],
})
export class BreadCrumbBarComponent implements OnInit {
  @Input() moduleName = '';
  @Input() menuName: string[] = [];

  @Output() breadCrumbClicked = new EventEmitter();

  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToHome(moduleName: string, menuName: string): void {
    this.breadCrumbClicked.emit(moduleName + '/' + menuName);
  }

  goToModule(moduleName: string): void {
    this.moduleName = moduleName;

    if (moduleName.toLowerCase() === 'home') {
      this.breadCrumbClicked.emit(this.moduleName + '/me');
      this.menuName = ['Me'];
    } else {
      this.breadCrumbClicked.emit(this.moduleName);
      this.menuName = ['Dashboard'];
    }
    this.router.navigate([`/aura/${this.moduleName.toLowerCase()}`]);
  }
}
