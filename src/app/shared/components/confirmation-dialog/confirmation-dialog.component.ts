import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit {
  type = '';
 // fileId = '';
  positionID = '';
  errorCode!: number;
  error = '';
  constructor(
    private router: Router,
    public dialogConfirmRef: MatDialogRef<ConfirmationDialogComponent>,
     // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.type = data?.obj?.type;
  //  this.fileId = data?.obj?.fileId;
    this.positionID = data?.obj?.positionID;
    this.errorCode = data?.obj?.errorCode;
    this.error = data?.obj?.error;
  }

  public confirmMessage!: string;

  ngOnInit(): void {}

  afterCloseMsgBox(flag: boolean): void{
    this.dialogConfirmRef.close(flag);
    this.router.navigate(['/aura/hr/dashboard']);
  }
}
