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
import { saveAs } from 'file-saver';
import { PreviewDocumentComponent } from '../../../../../shared/components/preview-document/preview-document.component';
import { GenericProfileApiService } from '../../../service/generic-profile-api.service';
import { DocumentInformation } from '../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../shared/service/documents/documents.service';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import {
  CertificationAddPopupRecord,
  CertificationEditPopupRecord,
  CertificationResult,
} from '../../../interface/certification.interface';
import { AddEditCertificationComponent } from '../../generic-components/add-edit-certification/add-edit-certification.component';

@Component({
  selector: 'app-certifications-tab',
  templateUrl: './certifications-tab.component.html',
  styleUrls: ['./certifications-tab.component.scss'],
})
export class CertificationsTabComponent implements OnInit, OnChanges {
  @Input() personId = '';
  @Input() personName = '';
  @Input() id = '';

  // GET CERTIFICATIONS
  certificationResult!: CertificationResult[];
  totalCertificationDocs = 0;
  mapCertificationAgency = new Map<string, string>();

  certificationMoreOrLess: boolean[] = [];
  btnMoreLessCertText: string[] = [];

  isLoading = false;

  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

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
      this.setCertificationsByPersonId(change.personId.currentValue);
      this.personId = change.personId.currentValue;
    }
  }

  ngOnInit(): void {
    this.lookupService.getCertificationAgencyByOrgName().subscribe((data) => {
      this.mapCertificationAgency = data?.result;
    });
  }
  downloadDocument(doc: DocumentInformation): void {
    if (doc) {
      this.documentsService.getDocumentFile(doc?.documentId).subscribe(
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
        this.setCertificationsByPersonId(this.personId);
      }
    });
  }

  setCertificationsByPersonId(personId: string): void {
    this.isLoading = true;
    this.genericProfileApiService
      .getCertificationsByPersonId(personId)
      .subscribe(
        (data) => {
          this.isLoading = false;
          if (data?.result) {
            this.certificationResult = data?.result;

            this.totalCertificationDocs = this.certificationResult?.length;
            for (let i = 0; i < this.totalCertificationDocs; i++) {
              this.btnMoreLessCertText[i] = 'More';
              this.certificationMoreOrLess[i] = true;
            }
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  // ADD CERTIFICATION
  addCertificationInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: CertificationAddPopupRecord = {
      action: actionType,
      personId: this.personId,
      certificationData: this.certificationResult,
      mapCertificationAgency: this.mapCertificationAgency,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditCertificationComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setCertificationsByPersonId(this.personId);
      }
    });
  }

  // EDIT CERTIFICATION
  editCertificationInfo(actionType: string, i: number): void {
    const dialogConfig = new MatDialogConfig();
    const obj: CertificationEditPopupRecord = {
      action: actionType,
      personId: this.personId,
      certificationData: this.certificationResult[i],
      mapCertificationAgency: this.mapCertificationAgency,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditCertificationComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.setCertificationsByPersonId(this.personId);
      }
    });
  }

  showMoreLessCertification(i: number): void {
    this.btnMoreLessCertText[i] =
      this.btnMoreLessCertText[i] === 'More' ? 'Less' : 'More';
  }
}
