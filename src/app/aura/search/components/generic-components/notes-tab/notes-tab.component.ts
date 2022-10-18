import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { GenericProfileApiService } from '../../../service/generic-profile-api.service';
import {
  NotesAddPopupRecord,
  NotesResult,
} from '../../../interface/notes.interface';
import { AddNotesComponent } from '../../generic-components/add-notes/add-notes.component';

@Component({
  selector: 'app-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss'],
})
export class NotesTabComponent implements OnInit, OnChanges {
  @Input() personId = '';
  @Input() personName = '';
  @Input() id = '';

  isLoading = false;

  // GET NOTES
  notesResult!: NotesResult[];
  resourceType = 3;
  commentType = 9;
  totalNotes = 0;

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog
  ) {}

  ngOnChanges(change: SimpleChanges): void {
    if (change?.personId && change?.personId?.currentValue) {
      this.setNotesById(change?.id?.currentValue);
      this.personId = change?.personId?.currentValue;
    }
  }

  ngOnInit(): void {}

  setNotesById(id: string): void {
    this.isLoading = true;
    this.genericProfileApiService
      .getNotesById(this.resourceType, id, this.commentType)
      .subscribe(
        (data) => {
          this.isLoading = false;
          if (data?.result) {
            this.notesResult = data?.result;
            this.totalNotes = this.notesResult?.length;
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  // ADD NOTES
  addNotes(): void {
    const dialogConfig = new MatDialogConfig();
    const obj: NotesAddPopupRecord = {
      notesData: this.notesResult,
      id: this.id,
      personName: this.personName,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddNotesComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setNotesById(this.id);
      }
    });
  }
}
