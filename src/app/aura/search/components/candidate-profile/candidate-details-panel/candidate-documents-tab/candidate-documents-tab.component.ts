import { GenericProfileApiService } from '../../../../service/generic-profile-api.service';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
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
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import {
  EmploymentAgreementResult,
  EmploymentAgreementAddPopupRecord,
  EmploymentAgreementEditPopupRecord,
} from '../../../../interface/employment-agreement-documents.interface';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { AddEditEmploymentAgreementComponent } from '../../../generic-components/add-edit-employment-agreement.component/add-edit-employment-agreement.component';
import { DocumentPurposeCode } from '../../../../enum/document-purpose-code.enum';

@Component({
  selector: 'app-candidate-documents-tab',
  templateUrl: './candidate-documents-tab.component.html',
  styleUrls: ['./candidate-documents-tab.component.scss'],
})
export class CandidateDocumentsTabComponent implements OnInit, OnChanges {
  // GET Employment Agreement
  candidateDocumentResult!: EmploymentAgreementResult;

  documentInformation!: DocumentInformation[];
  offerLetterList: DocumentInformation[] = [];
  codeAssessmentList: DocumentInformation[] = [];
  exclusivityAgreementList: DocumentInformation[] = [];

  mapDocumentType = new Map<number, string>();

  @Input() id = '';
  @Input() personId = '';
  @Input() personName = '';
  isLoading = false;
  docType = '';
  resourceTypeCode = 5;
  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  toggleMoreLessOL = true;
  btnMoreLessOLText = 'More';
  toggleMoreLessCA = true;
  btnMoreLessCAText = 'More';
  toggleMoreLessEA = true;
  btnMoreLessEAText = 'More';
  constructor(
    private genericProfileApiService: GenericProfileApiService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private documentsService: DocumentsService,
    private lookupService: LookupService
  ) {}

  ngOnChanges(change: SimpleChanges): void {
    if (
      (change.personId && change.personId.currentValue) ||
      (change.candidateId && change.candidateId.currentValue) ||
      (change.personName && change.personName.currentValue)
    ) {
      if (change.personId && change.personId.currentValue) {
        this.personId = change.personId?.currentValue;

        this.isLoading = true;
        this.lookupService.getCandidateDocumentType().subscribe(
          (data) => {
            for (const docType of data?.result) {
              this.mapDocumentType.set(
                docType?.lookupCode,
                docType?.description
              );
            }

            for (const [k, v] of this.mapDocumentType) {
              this.docType = this.docType + ',' + k;
            }

            this.setDocumentsByCandidateId(
              this.resourceTypeCode,
              this.id,
              this.docType.substr(1)
            );
            this.isLoading = false;
          },
          (error) => {
            console.warn(error);
            this.isLoading = false;
          }
        );
      }
      if (change?.candidateId && change?.candidateId?.currentValue) {
        this.id = change?.candidateId?.currentValue;
      }
      if (change?.personName && change?.personName?.currentValue) {
        this.personName = change?.personName?.currentValue;
      }
    }
  }

  ngOnInit(): void {}

  resetDocumentsList(): void {
    this.offerLetterList = [];
    this.codeAssessmentList = [];
    this.exclusivityAgreementList = [];
  }
  setDocumentsByCandidateId(
    resourceTypeCode: number,
    candidateId: string,
    docType: string
  ): void {
    this.isLoading = true;
    this.genericProfileApiService
      .getDocumentsByEmployeeOrCandidateId(
        resourceTypeCode,
        candidateId,
        docType
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.documentInformation = data?.result;
          this.resetDocumentsList();

          if (this.documentInformation) {
            for (const doc of this.documentInformation) {
              switch (doc?.documentPurposeCode) {
                case DocumentPurposeCode.OfferLetter:
                  this.offerLetterList?.push(doc);
                  break;
                case DocumentPurposeCode.CodeAssessment:
                  this.codeAssessmentList?.push(doc);
                  break;
                case DocumentPurposeCode.ExclusivityAgreement:
                  this.exclusivityAgreementList?.push(doc);
                  break;
              }
            }
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
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
        this.setDocumentsByCandidateId(
          this.resourceTypeCode,
          this.id,
          this.docType
        );
      }
    });
  }

  addCandidateDocumentInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EmploymentAgreementAddPopupRecord = {
      action: actionType,
      id: this.id,
      employmentAgreementData: this.candidateDocumentResult,
      mapDocType: this.mapDocumentType,
      title: 'Documents',
      resourceTypeCode: 5,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditEmploymentAgreementComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setDocumentsByCandidateId(
          this.resourceTypeCode,
          this.id,
          this.docType
        );
      }
    });
  }
  editCandidateDocumentInfo(
    actionType: string,
    documentInfo: DocumentInformation[]
  ): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EmploymentAgreementEditPopupRecord = {
      action: actionType,
      id: this.id,
      mapDocType: this.mapDocumentType,
      docPurposeCode: documentInfo[0]?.documentPurposeCode,
      documentInfo,
      title: 'Edit Documents',
      resourceTypeCode: 5,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditEmploymentAgreementComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setDocumentsByCandidateId(
          this.resourceTypeCode,
          this.id,
          this.docType.substr(1)
        );
      }
    });
  }

  showMoreLess(docPurposeCode: number): void {
    switch (docPurposeCode) {
      case DocumentPurposeCode.OfferLetter:
        {
          if (this.toggleMoreLessOL === true) {
            this.btnMoreLessOLText = 'Less';
            this.toggleMoreLessOL = false;
          } else {
            this.btnMoreLessOLText = 'More';
            this.toggleMoreLessOL = true;
          }
        }
        break;
      case DocumentPurposeCode.CodeAssessment:
        {
          if (this.toggleMoreLessCA === true) {
            this.btnMoreLessCAText = 'Less';
            this.toggleMoreLessCA = false;
          } else {
            this.btnMoreLessCAText = 'More';
            this.toggleMoreLessCA = true;
          }
        }
        break;
      case DocumentPurposeCode.ExclusivityAgreement: {
        if (this.toggleMoreLessEA === true) {
          this.btnMoreLessEAText = 'Less';
          this.toggleMoreLessEA = false;
        } else {
          this.btnMoreLessEAText = 'More';
          this.toggleMoreLessEA = true;
        }
      }
    }
  }

  isZeroDocuments(): boolean {
    const zeroDocs =
      this.offerLetterList.length === 0 &&
      this.codeAssessmentList.length === 0 &&
      this.exclusivityAgreementList.length === 0
        ? true
        : false;

    return zeroDocs;
  }
}
