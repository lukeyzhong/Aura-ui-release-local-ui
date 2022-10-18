import { Inject, Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-resume-fullview',
  templateUrl: './resume-fullview.component.html',
  styleUrls: ['./resume-fullview.component.scss'],
})
export class ResumeFullviewComponent implements OnInit {
  docURL = '';
  errorMessage = '';
  // tslint:disable-next-line: no-any
  elem: any;

  constructor(
    private dialogReffullView: MatDialogRef<ResumeFullviewComponent>,
    // tslint:disable-next-line: no-any
    @Inject(DOCUMENT) private document: any,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.docURL = data?.obj?.isdocURL;
  }

  ngOnInit(): void {
    this.elem = document.documentElement;
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } else if (this.elem.mozRequestFullScreen) {
      /* Firefox */
      this.elem.mozRequestFullScreen();
    } else if (this.elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.elem.webkitRequestFullscreen();
    } else if (this.elem.msRequestFullscreen) {
      /* IE/Edge */
      this.elem.msRequestFullscreen();
    }
  }

  closePreview(): void {
    if (document.fullscreenElement) {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
    this.dialogReffullView.close('cancel');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const keyPressed = event.key;
    if (keyPressed === 'Escape') {
      this.dialogReffullView.close('cancel');
    }
  }
}
