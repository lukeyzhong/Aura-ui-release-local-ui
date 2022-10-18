import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { SnackbarNotificationComponent } from '../components/snackbar-notification/snackbar-notification.component';

@Injectable({
  providedIn: 'root'
})
export class MatNotificationService {
  constructor(private snackBar: MatSnackBar) { }

  config: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  public showSnackBarMessage(message: string, type: string, duration?: number): void {
    const snackType = type !== undefined ? type : 'success';

    this.snackBar.openFromComponent(SnackbarNotificationComponent, {
      duration: duration || 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      data: { message, snackType, snackBar: this.snackBar },
      panelClass: ['custom-snackbar']
    });
  }

  success(msg: string): void {
    this.config.panelClass = ['green-snackbar'];
    this.snackBar.open(msg, '', this.config);
  }

  warn(msg: string): void {
    this.config.panelClass = ['red-snackbar'];
    this.snackBar.open(msg, '', this.config);
  }
}
