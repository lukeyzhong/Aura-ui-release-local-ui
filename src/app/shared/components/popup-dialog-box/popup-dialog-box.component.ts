import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-dialog-box',
  templateUrl: './popup-dialog-box.component.html',
  styleUrls: ['./popup-dialog-box.component.scss']
})
export class PopupDialogBoxComponent implements OnInit {
  constructor(
    public dialogConfirmRef: MatDialogRef<PopupDialogBoxComponent>
  ) {}

  public confirmMessage!: string;

  ngOnInit(): void {}

}
