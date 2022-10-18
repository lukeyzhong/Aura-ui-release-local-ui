import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.scss']
})
export class ProgressSpinnerComponent implements OnInit {

  @Input() percentage = 0;
  @Input() radius = 15;
  @Input() status!: number;
  public strokeDashoffset = 0;
  public circumference!: number;

  ngOnInit(): void {
    this.circumference = 2 * Math.PI * this.radius;
    const offset = this.circumference - (this.percentage / 100) * this.circumference;
    this.strokeDashoffset = offset;
  }

}
