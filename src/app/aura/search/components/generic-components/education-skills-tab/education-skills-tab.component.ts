import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  SkillsAddPopupRecord,
  SkillsEditPopupRecord,
  SkillsResult,
} from '../../../interface/skills.interface';
import { AddEditSkillsComponent } from '../../generic-components/add-edit-skills/add-edit-skills.component';
import {
  EducationAddPopupRecord,
  EducationEditPopupRecord,
  EducationResult,
} from '../../../interface/education.interface';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { GenericProfileApiService } from '../../../service/generic-profile-api.service';
import { DocumentInformation } from '../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../shared/service/documents/documents.service';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { AddEditEducationComponent } from '../../generic-components/add-edit-education/add-edit-education.component';
import { saveAs } from 'file-saver';
import { PreviewDocumentComponent } from '../../../../../shared/components/preview-document/preview-document.component';

@Component({
  selector: 'app-education-skills-tab',
  templateUrl: './education-skills-tab.component.html',
  styleUrls: ['./education-skills-tab.component.scss'],
})
export class EducationSkillsTabComponent implements OnInit, OnChanges {
  @Input() personId = '';
  @Input() personName = '';
  @Input() id = '';

  // GET EDUCATION
  educationResult!: EducationResult[];
  major2: string | undefined = '';
  stemFlag = '';

  mapMajor = new Map<string, string>();
  mapMajor1 = new Map<string, string>();
  mapUniversity = new Map<string, string>();
  totalEducationDocs = 0;

  isLoading = false;
  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

  // GET SKILLS
  skillsResult!: SkillsResult[];
  totalSkills = 0;
  mapSkill = new Map<number, string>();
  mapSkillLevel = new Map<number, string>();

  educationMoreOrLess: boolean[] = [];
  btnMoreLessEduText: string[] = [];

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private lookupService: LookupService,
    private documentsService: DocumentsService
  ) {}

  ngOnChanges(change: SimpleChanges): void {
    if (change.personId && change.personId.currentValue) {
      this.setEducationByPersonId(change.personId.currentValue);
      this.setSkillsByPersonId(change.personId.currentValue);
      this.personId = change.personId.currentValue;
    }
  }

  ngOnInit(): void {
    this.lookupService.getUniversityByName().subscribe((data) => {
      this.mapUniversity = data?.result;
    });

    this.lookupService.getMajorByCode().subscribe((data) => {
      this.mapMajor = data?.result;
      this.mapMajor1 = data?.result;
    });

    this.lookupService.getSkillType().subscribe((data) => {
      for (const skill of data?.result) {
        this.mapSkill.set(skill?.lookupCode, skill?.description);
      }
    });

    this.lookupService.getSkillLevelType().subscribe((data) => {
      for (const skillLevel of data?.result) {
        this.mapSkillLevel.set(skillLevel?.lookupCode, skillLevel?.description);
      }
    });
  }

  setEducationByPersonId(personId: string): void {
    this.isLoading = true;
    this.genericProfileApiService.getEducationByPersonId(personId).subscribe(
      (data) => {
        this.isLoading = false;
        if (data?.result) {
          this.educationResult = data?.result;
          this.totalEducationDocs = this.educationResult?.length;
          for (let i = 0; i < this.totalEducationDocs; i++) {
            this.btnMoreLessEduText[i] = 'More';
            this.educationMoreOrLess[i] = true;
          }
        }
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
  }

  seteducationMoreOrLess(educationInfo: EducationResult): void {
    this.major2 = educationInfo?.majorType1;
    this.stemFlag = educationInfo?.stemFlag === true ? 'YES' : 'NO';
  }

  setSkillsByPersonId(personId: string): void {
    this.isLoading = true;
    this.genericProfileApiService.getSkillsByPersonId(personId).subscribe(
      (data) => {
        this.isLoading = false;
        if (data?.result) {
          this.skillsResult = data?.result;
          this.totalSkills = this.skillsResult?.length;
        }
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
  }

  // ADD SKILLS
  addSkillsInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: SkillsAddPopupRecord = {
      action: actionType,
      personId: this.personId,
      skillsData: this.skillsResult,
      mapSkill: this.mapSkill,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddEditSkillsComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setSkillsByPersonId(this.personId);
      }
    });
  }

  // EDIT SKILLS
  editSkillsInfo(actionType: string, i: number): void {
    const dialogConfig = new MatDialogConfig();
    const obj: SkillsEditPopupRecord = {
      action: actionType,
      personId: this.personId,
      skillsData: this.skillsResult[i],
      mapSkill: this.mapSkill,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddEditSkillsComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.setSkillsByPersonId(this.personId);
      }
    });
  }

  // ADD EDUCATION
  addEducationInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EducationAddPopupRecord = {
      action: actionType,
      personId: this.personId,
      educationData: this.educationResult,
      mapUniversity: this.mapUniversity,
      mapMajor: this.mapMajor,
      mapMajor1: this.mapMajor1,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddEditEducationComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setEducationByPersonId(this.personId);
      }
    });
  }

  // EDIT EDUCATION
  editEducationInfo(actionType: string, i: number): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EducationEditPopupRecord = {
      action: actionType,
      personId: this.personId,
      educationData: this.educationResult[i],
      mapUniversity: this.mapUniversity,
      mapMajor: this.mapMajor,
      mapMajor1: this.mapMajor1,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddEditEducationComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.setEducationByPersonId(this.personId);
      }
    });
  }

  downloadDocument(doc: DocumentInformation): void {
    if (doc) {
      this.documentsService.getDocumentFile(doc.documentId).subscribe(
        (data) => {
          const file = new Blob([data], { type: 'image/* | application/pdf' });
          const fileURL = URL.createObjectURL(file);
          let fileName = '';
          if (
            this.fileExt?.includes('.' + doc?.displayName?.split('.')[1]) ||
            doc?.displayName?.split('.')[1] === 'pdf'
          ) {
            fileName = doc?.displayName;
          } else {
            fileName = doc?.displayName + doc?.fileExtension;
          }
          saveAs(fileURL, fileName);
        },
        (err) => {
          console.warn(err);
        }
      );
    }
  }

  previewDocument(doc: DocumentInformation): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      personId: this.personId,
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(PreviewDocumentComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setEducationByPersonId(this.personId);
      }
    });
  }

  showMoreLessEducation(i: number): void {
    this.btnMoreLessEduText[i] =
      this.btnMoreLessEduText[i] === 'More' ? 'Less' : 'More';
  }
}
