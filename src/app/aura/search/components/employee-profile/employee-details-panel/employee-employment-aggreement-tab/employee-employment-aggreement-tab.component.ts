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
import {
  EmploymentAgreementResult,
  EmploymentAgreementAddPopupRecord,
  EmploymentAgreementEditPopupRecord,
} from '../../../../interface/employment-agreement-documents.interface';
import { GenericProfileApiService } from '../../../../service/generic-profile-api.service';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { AddEditEmploymentAgreementComponent } from '../../../generic-components/add-edit-employment-agreement.component/add-edit-employment-agreement.component';
import { DocumentPurposeCode } from '../../../../enum/document-purpose-code.enum';

@Component({
  selector: 'app-employee-employment-aggreement-tab',
  templateUrl: './employee-employment-aggreement-tab.component.html',
  styleUrls: ['./employee-employment-aggreement-tab.component.scss'],
})
export class EmployeeEmploymentAggreementTabComponent
  implements OnInit, OnChanges
{
  toggleMoreLessNDL = true;
  btnMoreLessNDLText = 'More';

  toggleMoreLessONDA = true;
  btnMoreLessONDAText = 'More';

  toggleMoreLessEP = true;
  btnMoreLessEPText = 'More';

  toggleMoreLessJC = true;
  btnMoreLessJCText = 'More';

  toggleMoreLessHB = true;
  btnMoreLessHBText = 'More';

  toggleMoreLessEI = true;
  btnMoreLessEIText = 'More';

  // GET Employment Agreement
  employeeEmploymentAgreementResult!: EmploymentAgreementResult;

  documentInformation!: DocumentInformation[];
  nonDisclosureList: DocumentInformation[] = [];
  offerNDAList: DocumentInformation[] = [];
  employmentPackageList: DocumentInformation[] = [];
  jobChangeList: DocumentInformation[] = [];
  handbookList: DocumentInformation[] = [];
  exitInterviewList: DocumentInformation[] = [];
  mapDocumentType = new Map<number, string>();

  @Input() employeeId = '';
  @Input() personId = '';
  @Input() personName = '';
  isLoading = false;
  docType = '';
  resourceTypeCode = 7;
  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private dialog: MatDialog,
    private documentsService: DocumentsService,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService
  ) {}

  ngOnChanges(change: SimpleChanges): void {
    if (
      (change.personId && change.personId.currentValue) ||
      (change.employeeId && change.employeeId.currentValue) ||
      (change.personName && change.personName.currentValue)
    ) {
      if (change.personId && change.personId.currentValue) {
        this.personId = change.personId?.currentValue;

        this.isLoading = true;
        this.lookupService.getEmploymentAgreementDocumentType().subscribe(
          (data) => {
            for (const docType of data?.result) {
              this.mapDocumentType.set(
                docType?.lookupCode,
                docType?.description.substr(2)
              );
            }

            for (const [k, v] of this.mapDocumentType) {
              this.docType = this.docType + ',' + k;
            }

            this.setEmploymentAgreementByEmployeeId(
              this.resourceTypeCode,
              this.employeeId,
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
      if (change?.employeeId && change?.employeeId?.currentValue) {
        this.employeeId = change?.employeeId?.currentValue;
      }
      if (change?.personName && change?.personName?.currentValue) {
        this.personName = change?.personName?.currentValue;
      }
    }
  }

  ngOnInit(): void {}

  resetDocumentsList(): void {
    this.nonDisclosureList = [];
    this.offerNDAList = [];
    this.employmentPackageList = [];
    this.jobChangeList = [];
    this.handbookList = [];
    this.exitInterviewList = [];
  }
  setEmploymentAgreementByEmployeeId(
    resourceTypeCode: number,
    employeeId: string,
    docType: string
  ): void {
    this.isLoading = true;
    this.genericProfileApiService
      .getDocumentsByEmployeeOrCandidateId(
        resourceTypeCode,
        employeeId,
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
                case DocumentPurposeCode.EANonDisclosure:
                  this.nonDisclosureList?.push(doc);
                  break;
                case DocumentPurposeCode.EAOfferNDA:
                  this.offerNDAList?.push(doc);
                  break;
                case DocumentPurposeCode.EAEmploymentPackage:
                  this.employmentPackageList?.push(doc);
                  break;
                case DocumentPurposeCode.EAJobChange:
                  this.jobChangeList?.push(doc);
                  break;
                case DocumentPurposeCode.EAHandBook:
                  this.handbookList?.push(doc);
                  break;
                case DocumentPurposeCode.EAExitInterview:
                  this.exitInterviewList?.push(doc);
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
        this.setEmploymentAgreementByEmployeeId(
          this.resourceTypeCode,
          this.employeeId,
          this.docType
        );
      }
    });
  }

  addEmploymentAndAgreementInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EmploymentAgreementAddPopupRecord = {
      action: actionType,
      id: this.employeeId,
      employmentAgreementData: this.employeeEmploymentAgreementResult,
      mapDocType: this.mapDocumentType,
      title: 'Employment and Agreement',
      resourceTypeCode: 7,
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
        this.setEmploymentAgreementByEmployeeId(
          this.resourceTypeCode,
          this.employeeId,
          this.docType
        );
      }
    });
  }

  editEmploymentAndAgreementInfo(
    actionType: string,
    documentInfo: DocumentInformation[]
  ): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EmploymentAgreementEditPopupRecord = {
      action: actionType,
      id: this.employeeId,
      mapDocType: this.mapDocumentType,
      docPurposeCode: documentInfo[0]?.documentPurposeCode,
      documentInfo,
      title: 'Edit Employment and Agreement - ',
      resourceTypeCode: 7,
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
        this.setEmploymentAgreementByEmployeeId(
          this.resourceTypeCode,
          this.employeeId,
          this.docType.substr(1)
        );
      }
    });
  }

  showMoreLess(docPurposeCode: number): void {
    switch (docPurposeCode) {
      case DocumentPurposeCode.EANonDisclosure:
        {
          if (this.toggleMoreLessNDL === true) {
            this.btnMoreLessNDLText = 'Less';
            this.toggleMoreLessNDL = false;
          } else {
            this.btnMoreLessNDLText = 'More';
            this.toggleMoreLessNDL = true;
          }
        }
        break;
      case DocumentPurposeCode.EAOfferNDA:
        {
          if (this.toggleMoreLessONDA === true) {
            this.btnMoreLessONDAText = 'Less';
            this.toggleMoreLessONDA = false;
          } else {
            this.btnMoreLessONDAText = 'More';
            this.toggleMoreLessONDA = true;
          }
        }
        break;
      case DocumentPurposeCode.EAEmploymentPackage:
        {
          if (this.toggleMoreLessEP === true) {
            this.btnMoreLessEPText = 'Less';
            this.toggleMoreLessEP = false;
          } else {
            this.btnMoreLessEPText = 'More';
            this.toggleMoreLessEP = true;
          }
        }
        break;
      case DocumentPurposeCode.EAJobChange:
        {
          if (this.toggleMoreLessJC === true) {
            this.btnMoreLessJCText = 'Less';
            this.toggleMoreLessJC = false;
          } else {
            this.btnMoreLessJCText = 'More';
            this.toggleMoreLessJC = true;
          }
        }
        break;
      case DocumentPurposeCode.EAHandBook:
        {
          if (this.toggleMoreLessHB === true) {
            this.btnMoreLessHBText = 'Less';
            this.toggleMoreLessHB = false;
          } else {
            this.btnMoreLessHBText = 'More';
            this.toggleMoreLessHB = true;
          }
        }
        break;
      case DocumentPurposeCode.EAExitInterview: {
        if (this.toggleMoreLessEI === true) {
          this.btnMoreLessEIText = 'Less';
          this.toggleMoreLessEI = false;
        } else {
          this.btnMoreLessEIText = 'More';
          this.toggleMoreLessEI = true;
        }
      }
    }
  }

  isZeroDocuments(): boolean {
    const zeroDocs =
      this.nonDisclosureList.length === 0 &&
      this.offerNDAList.length === 0 &&
      this.employmentPackageList.length === 0 &&
      this.jobChangeList.length === 0 &&
      this.handbookList.length === 0 &&
      this.exitInterviewList.length === 0
        ? true
        : false;

    return zeroDocs;
  }
}
