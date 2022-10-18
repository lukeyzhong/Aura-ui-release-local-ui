import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-columns-details',
  templateUrl: './columns-details.component.html',
  styleUrls: ['./columns-details.component.scss'],
})
export class ColumnsDetailsComponent implements OnInit {
  errorMsg = '';
  isLoading = false;
  headerText = '';
  description = '';
  constructor(
    private dialogRef: MatDialogRef<ColumnsDetailsComponent>,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.headerText = data?.obj?.headerText;
    this.description = data?.obj?.description;
  }

  ngOnInit(): void {}

  onCancel(e: Event): void {
    this.dialogRef.close('cancel');
    e.preventDefault();
  }
}
