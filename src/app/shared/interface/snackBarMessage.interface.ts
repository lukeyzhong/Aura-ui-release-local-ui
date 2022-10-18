import { MatSnackBar } from '@angular/material/snack-bar';

export interface SnackBarMessage {
    message: string;
    snackType: string;
    snackBar: MatSnackBar;
}
