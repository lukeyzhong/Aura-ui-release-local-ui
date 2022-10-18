import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent implements OnInit {
  @ViewChild('content', { static: true })
  elementView!: ElementRef;
  @Input()
  diameter!: string;

  constructor() { }

  // tslint:disable-next-line: typedef
  ngOnInit() {
    if (!this.diameter) {
      this.diameter = Math.floor(
        +this.elementView.nativeElement.offsetHeight * 0.2
      ).toString();
    }
  }
}
