import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { ThemePalette } from '@angular/material/core';
import { CandidateOnboardingService } from '../../../aura/hr/service/dashboard/candidate-onboarding.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-ats-aura-onboard-dialog',
  templateUrl: './ats-aura-onboard-dialog.component.html',
  styleUrls: ['./ats-aura-onboard-dialog.component.scss'],
})
export class AtsAuraOnboardDialogComponent {
  timer = 0;
  progress = 0;

  color: ThemePalette = 'primary';
  mode: ProgressSpinnerMode = 'determinate';

  // tslint:disable-next-line: no-any
  interval: any;
  constructor(
    private dialogRef: MatDialogRef<AtsAuraOnboardDialogComponent>,
    private router: Router,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    if (data?.obj?.timeLeft === -1) {
      this.progress = 0;
      setTimeout(() => {
        this.dialogRef.close({ status: 'cancel' });
        this.router.navigate(['/aura/hr']);
      }, 5000);
    } else {
      this.timer = data?.obj?.timeLeft * 1000;
      // this.timer = 1175 * 1000;
      this.progress = this.timer;
      const interval = setInterval(() => {
        this.timer = this.timer - 1000;
        this.progress = this.timer;
        if (this.timer === -1000) {
          this.progress = 0;
          clearInterval(interval);
          this.dialogRef.close({ status: 'cancel' });
          this.router.navigate(['/aura/hr']);
        }
      }, 1000);
    }
  }

  onCancel(e: Event): void {
    // clearInterval(this.interval);
    this.dialogRef.close({ status: 'cancel' });
    // this.dialogRef.close({ status: 'cancel', progress: this.progress });
    e.preventDefault();
  }
}
