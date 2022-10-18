import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-candidate-details-panel',
  templateUrl: './candidate-details-panel.component.html',
  styleUrls: ['./candidate-details-panel.component.scss'],
})
export class CandidateDetailsPanelComponent implements OnInit {
  @Input() personId = '';
  @Input() personName = '';
  @Input() id = '';
  @Input() resumeDocumentId = '';
  @Input() displayName = '';
  constructor() {}

  ngOnInit(): void {}
}
