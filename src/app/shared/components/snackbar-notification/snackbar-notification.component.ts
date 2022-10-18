import { Component, OnInit, Inject } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { SnackBarMessage } from '../../interface/snackBarMessage.interface';

@Component({
  selector: 'app-snackbar-notification',
  templateUrl: './snackbar-notification.component.html',
  styleUrls: ['./snackbar-notification.component.scss']
})
export class SnackbarNotificationComponent implements OnInit {
  matsnackBar!: MatSnackBar;
  message = '';
  email = '';

  constructor(@Inject(MAT_SNACK_BAR_DATA) private data: SnackBarMessage) {
  }

  ngOnInit(): void {
    if (this.data.message) {
      const splitMessage = this.data.message.split(':');
      this.message = splitMessage[0];
      this.email = splitMessage[1];
    }
  }

  // tslint:disable-next-line: typedef
  get MatIcon() {
    let data;
    switch (this.data.snackType) {
      case 'success':
        data = { type: this.data.snackType, icon: 'done' };
        break;
      case 'error':
        data = { type: this.data.snackType, icon: 'error' };
        break;
      case 'warn':
        data = { type: this.data.snackType, icon: 'warning' };
        break;
      case 'info':
        data = { type: this.data.snackType, icon: 'info' };
        break;
    }
    return data;
  }

  closeSnackbar(): void {
    this.data.snackBar.dismiss();
  }
}
