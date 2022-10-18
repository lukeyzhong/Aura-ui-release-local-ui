import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  AddtionalDocuments,
  AllOnboardingDocumentsInfoResult,
  DocumentsInfoResult,
  WebFormAllDocumentsInfoResult,
} from '../../../interface/dashboard/candidate-onboarding.interface';
import { PreviewDocumentComponent } from '../../../../../shared/components/preview-document/preview-document.component';
import { MatNotificationService } from '../../../../../shared/service/mat-notification.service';
import { CandidateOnboardingService } from '../../../service/dashboard/candidate-onboarding.service';
import { ConfirmationDialogComponent } from '../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss'],
})
export class DocumentsTabComponent implements OnInit, OnChanges {
  documentsInfoForm!: FormGroup;
  webFormPanelOpenState = true;
  innerWebFormPanelOpenState = true;
  documentsPanelOpenState = false;

  status = false;
  additionalDocumentsPanelOpenState = false;
  additionalWebFormPanelOpenState = false;
  innerAdditionalWebFormPanelOpenState = false;

  documentsInfoResult!: DocumentsInfoResult;

  searchDocText = '';
  entityTypeCodeForDoc = 41;

  additionalDocs: AddtionalDocuments[] = [];

  searchWebFormText = '';
  entityTypeCodeForWebFormType = 40;

  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  @Input() stepper!: MatStepper;
  @Input() candidateId = '';
  @Input() candidateJobRequirementId = '';
  @Output() enableSideBarNav = new EventEmitter();

  allOnboardingDocumentsInfoResult!: AllOnboardingDocumentsInfoResult[];
  allOnboardingDocumentsInfoResultByCode!: AllOnboardingDocumentsInfoResult[];
  additionalAllOnboardingDocumentsInfoResultByCode!: AllOnboardingDocumentsInfoResult[];

  webFormAllDocumentsInfoResult!: WebFormAllDocumentsInfoResult[];
  webFormAllDocumentsInfoResultByCode!: WebFormAllDocumentsInfoResult[];
  additionalWebFormAllDocumentsInfoResultByCode!: WebFormAllDocumentsInfoResult[];

  pkgTypeCode = '';
  pkgTypeValue = '';

  constructor(
    private router: Router,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingService: CandidateOnboardingService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialogConfirm: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pkgTypeCode && changes.pkgTypeCode.currentValue) {
      this.changeDocumentPackage(changes.pkgTypeCode.currentValue);
      this.setAllOnboardingDocumentsInformation();
      this.setWebFormDocsInformation();
    }
    this.candidateOnboardingService.getPkgTypeName().subscribe((pkgType) => {
      if (pkgType) {
        this.changeDocumentPackage(Number(pkgType.code));
        this.pkgTypeCode = pkgType.code;
        this.pkgTypeValue = pkgType.value;
      }
    });
  }

  ngOnInit(): void {
    this.candidateOnboardingService.getUpdatedState().subscribe((state) => {
      if (state) {
        this.changeDocumentPackage(Number(this.pkgTypeCode));
      }
    });
    this.candidateOnboardingService
      .getUpdatedWorkLocation()
      .subscribe((workLocation) => {
        if (workLocation) {
          this.changeDocumentPackage(Number(this.pkgTypeCode));
        }
      });
    this.setAllOnboardingDocumentsInformation();
    this.setWebFormDocsInformation();
  }

  setAllOnboardingDocumentsInformation(): void {
    this.candidateOnboardingService
      .getAllOnboardingDocumentsInformation(this.searchDocText)
      .subscribe(
        (data) => {
          this.allOnboardingDocumentsInfoResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setWebFormDocsInformation(): void {
    this.candidateOnboardingService
      .getAllWebFormDocInformation(this.searchWebFormText)
      .subscribe(
        (data) => {
          this.webFormAllDocumentsInfoResult = data?.result;
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  goToHrDashboard(): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Are you sure, you want to close?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.onSaveDocumentsInfo();
        this.router.navigate(['/aura/hr/dashboard']);
      }
    });
  }

  changeDocumentPackage(pkgTypeCode: number): void {
    this.candidateOnboardingService
      .getWebFormsAndDocumentsByPackageTypeCode(
        this.candidateId,
        this.candidateJobRequirementId,
        pkgTypeCode
      )
      .subscribe(
        (data) => {
          this.allOnboardingDocumentsInfoResultByCode = data?.result?.documents;
          this.webFormAllDocumentsInfoResultByCode = data?.result?.webForms;

          this.additionalAllOnboardingDocumentsInfoResultByCode = [];
          this.additionalWebFormAllDocumentsInfoResultByCode = [];
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  isWebFormExistsInDefaultPkgList(
    webForm: WebFormAllDocumentsInfoResult
  ): boolean {
    return this.webFormAllDocumentsInfoResultByCode?.find(
      (doc) => doc?.webformName === webForm?.webformName
    )
      ? true
      : false;
  }

  isDocumentsExistsInDefaultPkgList(
    docName: AllOnboardingDocumentsInfoResult
  ): boolean {
    return this.allOnboardingDocumentsInfoResultByCode?.find(
      (doc) => doc?.templateName === docName?.templateName
    )
      ? true
      : false;
  }

  addDocumentsToSave(
    event: MatCheckboxChange,
    doc: AllOnboardingDocumentsInfoResult
  ): void {
    this.additionalAllOnboardingDocumentsInfoResultByCode?.push(doc);
    const obj = {
      resourceTypeCode: this.entityTypeCodeForDoc,
      resourceValue: doc?.templateId,
    };
    this.additionalDocs?.push(obj);
  }

  addWebFormToSave(
    event: MatCheckboxChange,
    webForm: WebFormAllDocumentsInfoResult
  ): void {
    this.additionalWebFormAllDocumentsInfoResultByCode?.push(webForm);
    const obj = {
      resourceTypeCode: this.entityTypeCodeForWebFormType,
      resourceValue: webForm.webFormTypeId,
    };
    this.additionalDocs?.push(obj);
  }

  isWebFormExists(docName: WebFormAllDocumentsInfoResult): boolean {
    return this.additionalWebFormAllDocumentsInfoResultByCode?.includes(docName)
      ? true
      : false;
  }

  isDocExists(docName: AllOnboardingDocumentsInfoResult): boolean {
    return this.additionalAllOnboardingDocumentsInfoResultByCode?.includes(
      docName
    )
      ? true
      : false;
  }

  // SEARCH DOCUMENTS
  searchDocuments(searchText: string): void {
    this.searchDocText = '';
    this.searchDocText = searchText;
    this.setAllOnboardingDocumentsInformation();
  }
  // SEARCH WEBFORMS
  searchWebForms(searchText: string): void {
    this.searchWebFormText = '';
    this.searchWebFormText = searchText;
    this.setWebFormDocsInformation();
  }

  onSaveDocumentsInfo(): void {
    this.documentsInfoResult = {
      candidateId: this.candidateId,
      candidateJobRequirementId: this.candidateJobRequirementId,
      documentPackageCode: Number(this.pkgTypeCode),
      addtionalDocuments: this.additionalDocs,
    };

    this.candidateOnboardingService
      .saveDocumentsInformation(this.documentsInfoResult)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Documents Details updated successfully'
          );

          this.candidateOnboardingService.sendDocsUpdated(true);
          this.enableSideBarNav.emit('active');
          this.stepper.next();
        },
        (error) => {
          this.matNotificationService.warn(
            ':: Unable to update successfully ' + error
          );
        }
      );
  }

  // tslint:disable-next-line: no-any
  previewDocument(doc: any): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialogConfirm.open(
      PreviewDocumentComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.dialogRef.close('cancel');
      }
    });
  }

  deleteWebForm(doc: WebFormAllDocumentsInfoResult): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to remove this document?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        const index =
          this.additionalWebFormAllDocumentsInfoResultByCode?.indexOf(doc);

        this.additionalDocs = this.additionalDocs?.filter(
          (webForm) => webForm?.resourceValue !== doc?.webFormTypeId
        );

        if (index >= 0) {
          this.additionalWebFormAllDocumentsInfoResultByCode?.splice(index, 1);
        }
      }
    });
  }

  deleteDoc(docInfo: AllOnboardingDocumentsInfoResult): void {
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Do you really want to remove this document?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        const index =
          this.additionalAllOnboardingDocumentsInfoResultByCode?.indexOf(
            docInfo
          );

        this.additionalDocs = this.additionalDocs?.filter(
          (doc) => doc?.resourceValue !== docInfo?.templateId
        );

        if (index >= 0) {
          this.additionalAllOnboardingDocumentsInfoResultByCode?.splice(
            index,
            1
          );
        }
      }
    });
  }
}
