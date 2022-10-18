import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { debounceTime } from 'rxjs/operators';
import { GenericProfileApiService } from '../../../../search/service/generic-profile-api.service';
import { DocumentUploadInfo } from '../../../../../shared/abstract/DocumentUploadInfo';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import {
  SkillsAddEditRecord,
  SkillsResult,
} from '../../../interface/skills.interface';

@Component({
  selector: 'app-add-edit-skills',
  templateUrl: './add-edit-skills.component.html',
  styleUrls: ['./add-edit-skills.component.scss'],
})
export class AddEditSkillsComponent
  extends DocumentUploadInfo
  implements OnInit
{
  skillsForm!: FormGroup;
  skillsResult!: SkillsAddEditRecord;
  skillId = '';

  mapSkillLevel = new Map<number, string>();
  mapSkillName = new Map<string, string>();
  mapSkill = new Map<string, string>();
  skill!: FormControl;

  addSkillsDoc!: SkillsResult;

  last15Years!: number[];

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any,
    // tslint:disable-next-line: no-any
    dialogRef: MatDialogRef<any>,
    dialogConfirm: MatDialog,
    fb: FormBuilder
  ) {
    super(dialogRef, dialogConfirm, fb);
    this.skillsResult = data?.obj?.skillsData;
    this.personId = data?.obj?.personId;
    this.skillId = data?.obj?.eskillsData?.skillId;
    this.actionType = data?.obj?.action;
    this.mapSkill = data?.obj?.mapSkill;

    this.addSkillsDoc = {
      skillId: '',
      personId: '',
      skillCode: 0,
      skillLevelCode: 0,
      lastUsedYear: 0,
      skill: '',
      skillLevel: '',
    };
  }

  ngOnInit(): void {
    this.skillsForm = this.fb.group({
      skillLevel: ['', [Validators.required]],
      lastUsedYear: ['', [Validators.required]],
    });

    this.skill = new FormControl('', Validators.required);
    this.skill.setValue(this.skill.value);
    this.skill.valueChanges
      .pipe(debounceTime(500))
      .subscribe((searchString) => {
        if ((searchString as string).length >= 1) {
          if (searchString !== '') {
            this.lookupService.getSkillByName(searchString).subscribe(
              (data) => {
                this.mapSkillName = data?.result;
              },
              (err) => {
                console.warn(err);
              }
            );
          }
        }
      });

    this.isLoading = true;
    this.lookupService.getSkillLevelType().subscribe((data) => {
      for (const skillLevel of data?.result) {
        this.mapSkillLevel.set(skillLevel?.lookupCode, skillLevel?.description);
      }
      this.isLoading = false;
    });

    if (this.actionType === 'Add') {
      this.headerTitle = 'Add Skills';
    }
    if (this.actionType === 'Edit') {
      this.headerTitle = 'Edit Skills';

      this.skillsForm.patchValue({
        skillLevel: this.skillsResult?.skillLevelCode,
        lastUsedYear: this.skillsResult?.lastUsedYear,
      });
      this.skill.setValue(this.skillsResult?.skill);
    }

    this.last15Years = this.getLast15YearsWithCurrentYear();
  }

  getLast15YearsWithCurrentYear(): number[] {
    const max = new Date().getFullYear();
    const min = max - 14;
    const years = [];

    for (let i = max; i >= min; i--) {
      years.push(i);
    }
    return years;
  }

  // tslint:disable-next-line: no-any
  getKeyByValue(object: any, value: string): any {
    return Object?.keys(object)?.find((key) => object[key] === value);
  }

  saveSkills(): void {
    this.isLoading = true;
    this.addSkillsDoc.personId = this.personId;
    this.addSkillsDoc.skillId = this.skillsResult?.skillId;

    this.addSkillsDoc.skillCode =
      this.getKeyByValue(this.mapSkillName, this.skill?.value) === undefined
        ? this.getKeyByValue(this.mapSkillName, this.skill?.value)
        : // tslint:disable-next-line: radix
          parseInt(this.getKeyByValue(this.mapSkillName, this.skill?.value));

    this.addSkillsDoc.skill = this.skill?.value;

    this.addSkillsDoc.skillLevelCode =
      this.skillsForm?.controls?.skillLevel?.value;

    this.addSkillsDoc.skillLevel = this.mapSkillLevel.get(
      this.addSkillsDoc?.skillLevelCode
    ) as string;

    this.addSkillsDoc.lastUsedYear =
      this.skillsForm?.controls?.lastUsedYear?.value;

    if (
      this.getKeyByValue(this.mapSkillName, this.skill?.value) !== undefined
    ) {
      this.genericProfileApiService.saveSkills(this.addSkillsDoc).subscribe(
        (data) => {
          if (data.errorCode === 30) {
            this.matNotificationService.warn(
              ':: Duplicate Skills cannot be added'
            );
          } else {
            this.matNotificationService.success(
              ':: Information stored successfully'
            );
          }
          this.isLoading = false;
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
    } else {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Skill does not exist. Do you want to add same?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.genericProfileApiService.saveSkills(this.addSkillsDoc).subscribe(
            (data) => {
              this.matNotificationService.success(
                ':: Information stored successfully'
              );

              this.isLoading = false;
              this.dialogRef.close('success');
            },
            (err) => {
              this.errorMsg =
                '*There is problem with the service. Please try again later';
              console.warn(err);
              this.matNotificationService.warn(
                ':: Unable to store successfully'
              );
              this.isLoading = false;
            }
          );
        } else {
          this.isLoading = false;
        }
      });
    }
  }
}
