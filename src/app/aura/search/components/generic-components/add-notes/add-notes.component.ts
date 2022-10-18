import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import {
  NotesAddRecord,
  NotesResult,
} from '../../../interface/notes.interface';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ActiveUserInfoService } from '../../../../../core/service/active-user-info.service';

@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.component.html',
  styleUrls: ['./add-notes.component.scss'],
})
export class AddNotesComponent extends DocumentUploadInfo implements OnInit {
  notesForm!: FormGroup;
  addComment!: NotesResult;
  notesResult!: NotesAddRecord;
  candidateId!: string;
  personName!: string;
  editor = ClassicEditor;
  name = 'Angular ';

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    // tslint:disable-next-line: no-any
    dialogRef: MatDialogRef<any>,
    dialogConfirm: MatDialog,
    fb: FormBuilder,
    private activeUserInfo: ActiveUserInfoService
  ) {
    super(dialogRef, dialogConfirm, fb);
    this.notesResult = data?.obj?.notesData;
    this.candidateId = data?.obj?.id;
    this.personName = data?.obj?.personName;

    this.addComment = {
      commentTypeCode: 9,
      resourceTypeCode: 3,
      resourceValue: '',
      comment: '',
    };
  }

  ngOnInit(): void {
    this.notesForm = this.fb.group({
      comment: ['', Validators.required],
    });
  }

  saveNotes(): void {
    this.isLoading = true;
    this.addComment.comment = this.notesForm?.controls?.comment?.value;
    this.addComment.resourceValue = this.candidateId;
    this.addComment.userId = this.activeUserInfo?.user?.userId;

    this.genericProfileApiService.saveNotes(this.addComment).subscribe(
      (data) => {
        this.isLoading = false;
        this.matNotificationService.success(
          ':: Information stored successfully'
        );
        this.dialogRef.close('success');
      },
      (err) => {
        this.errorMsg =
          '*There is problem with the service. Please try again later';
        console.warn(err);
        this.matNotificationService.warn(':: Unable to store successfully');
        this.isLoading = false;
      }
    );
  }
}
