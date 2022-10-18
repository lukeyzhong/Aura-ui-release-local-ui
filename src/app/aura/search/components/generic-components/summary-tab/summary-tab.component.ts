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
  PassportResult,
  PassportAddPopupRecord,
  PassportEditPopupRecord,
} from '../../../interface/passport.interface';
import { GenericProfileApiService } from '../../../service/generic-profile-api.service';
import { DocumentInformation } from '../../../../../shared/interface/document-info.interface';
import { DocumentsService } from '../../../../../shared/service/documents/documents.service';
import { LookupService } from '../../../../../shared/service/lookup/lookup.service';
import { AddEditDrivinglicenseComponent } from '../../generic-components/add-edit-drivinglicense/add-edit-drivinglicense.component';
import { AddEditPassportComponent } from '../../generic-components/add-edit-passport/add-edit-passport.component';
import { saveAs } from 'file-saver';
import { PreviewDocumentComponent } from '../../../../../shared/components/preview-document/preview-document.component';
import { SSNResult } from '../../../interface/ssn.interface';
import {
  DrivingLicenseAddPopupRecord,
  DrivingLicenseEditPopupRecord,
  DrivingLicenseResult,
  LocationResult,
} from '../../../interface/driving-license.interface';
import { SummaryMoreOrLess } from '../../../enum/summary.enum';

@Component({
  selector: 'app-summary-tab',
  templateUrl: './summary-tab.component.html',
  styleUrls: ['./summary-tab.component.scss'],
})
export class SummaryTabComponent implements OnInit, OnChanges {
  // GET SSN
  ssnResult!: SSNResult;
  ssnDocumentInfo!: DocumentInformation[];

  // GET DRIVING LICENSE
  drivingLicenseResult!: DrivingLicenseResult[];
  previousDrivingLicenseResult!: DrivingLicenseResult[];
  latestDrivingLicenseInfo!: DrivingLicenseResult;

  // GET PASSPORT
  passportResult!: PassportResult[];
  previousPassportResult!: PassportResult[];
  latestPassportInfo!: PassportResult;

  latestDLLocation = '';

  @Input() personId = '';
  @Input() personName = '';
  @Input() id = '';

  previousPassportDocumentsLength = 0;
  previousDrivingLicenseDocumentsLength = 0;

  ssn = '';

  totalSSNFiles = 0;
  totalPassportDocs = 0;
  totalDLDocs = 0;

  isLoading = false;

  fileExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

  toggleMoreLess = true;
  btnMoreLessText = 'More';
  toggleMoreLessSSN = true;
  btnMoreLessSSNText = 'More';

  passportMoreOrLess: boolean[] = [];
  btnMoreLessPassportText: string[] = [];
  toggleMoreLessPassport = true;
  btnMoreLessPassText = 'More';

  dlMoreOrLess: boolean[] = [];
  btnMoreLessDLText: string[] = [];
  toggleMoreLessDL = true;
  btnMoreLessDrivLText = 'More';

  mapState = new Map<number, string>();

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
      this.setPassportByPersonId(change.personId.currentValue);
      this.setSSNByPersonId(change.personId.currentValue);
      this.setDrivingLicenseByPersonId(change.personId.currentValue);
      this.personId = change.personId.currentValue;
    }
  }

  ngOnInit(): void {
    this.lookupService.getStateCode().subscribe((data) => {
      for (const state of data?.result) {
        this.mapState.set(state?.lookupCode, state?.description);
      }
    });
  }

  getLocation(location: LocationResult): string {
    let currentLocation;
    if (location === null) {
      currentLocation = '-';
    } else {
      currentLocation =
        location?.city +
        ', ' +
        this.mapState.get(location?.stateCode) +
        ', ' +
        location?.zip;
    }
    return currentLocation;
  }
  setDrivingLicenseByPersonId(personId: string): void {
    this.isLoading = true;
    this.genericProfileApiService
      .getDrivingLicenseByPersonId(personId)
      .subscribe(
        (data) => {
          this.isLoading = false;
          if (data?.result) {
            this.drivingLicenseResult = data?.result;
            this.totalDLDocs = this.drivingLicenseResult?.length;
            this.latestDrivingLicenseInfo = this.drivingLicenseResult[0];

            const latestLocation =
              this.latestDrivingLicenseInfo?.location?.city +
              ', ' +
              this.mapState.get(
                this.latestDrivingLicenseInfo?.location?.stateCode
              ) +
              ', ' +
              this.latestDrivingLicenseInfo?.location?.zip;

            this.latestDLLocation = latestLocation?.includes('undefined')
              ? '-'
              : latestLocation;

            this.previousDrivingLicenseResult =
              this.drivingLicenseResult?.slice(1);

            this.previousDrivingLicenseDocumentsLength =
              this.drivingLicenseResult?.length - 1;

            for (let i = 0; i < this.totalDLDocs; i++) {
              this.btnMoreLessDLText[i] = 'More';
              this.dlMoreOrLess[i] = true;
            }
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }

  setSSNByPersonId(personId: string): void {
    this.isLoading = true;
    this.genericProfileApiService.getSSNByPersonId(personId).subscribe(
      (data) => {
        this.isLoading = false;
        if (data?.result) {
          this.ssnResult = data?.result;
          // tslint:disable-next-line: no-non-null-assertion
          this.ssnDocumentInfo = this.ssnResult?.documents!;
          this.totalSSNFiles = this.ssnDocumentInfo?.length;

          this.ssn = this.ssnResult?.socialSecurityNumber;
        }
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
  }

  setPassportByPersonId(personId: string): void {
    this.isLoading = true;
    this.genericProfileApiService.getPassportByPersonId(personId).subscribe(
      (data) => {
        this.isLoading = false;
        if (data?.result) {
          this.passportResult = data?.result;
          this.totalPassportDocs = this.passportResult?.length;
          this.latestPassportInfo = this.passportResult[0];

          this.previousPassportResult = this.passportResult?.slice(1);

          this.previousPassportDocumentsLength =
            this.passportResult?.length - 1;

          for (let i = 0; i < this.totalPassportDocs; i++) {
            this.btnMoreLessPassportText[i] = 'More';
            this.passportMoreOrLess[i] = true;
          }
        }
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
  }

  // ADD PASSPORT
  addPassportInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: PassportAddPopupRecord = {
      action: actionType,
      personId: this.personId,
      passportData: this.passportResult,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddEditPassportComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setPassportByPersonId(this.personId);
      }
    });
  }

  // EDIT PASSPORT
  editPassportInfo(actionType: string, passportResult: PassportResult): void {
    const dialogConfig = new MatDialogConfig();
    const obj: PassportEditPopupRecord = {
      action: actionType,
      personId: this.personId,
      passportData: passportResult,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(AddEditPassportComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.setPassportByPersonId(this.personId);
      }
    });
  }

  // ADD DRIVING LICENSE
  addDrivingLicenseInfo(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: DrivingLicenseAddPopupRecord = {
      action: actionType,
      personId: this.personId,
      drivingLicenseData: this.drivingLicenseResult,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditDrivinglicenseComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.setDrivingLicenseByPersonId(this.personId);
      }
    });
  }

  // EDIT DRIVING LICENSE
  editDrivingLicenseInfo(
    actionType: string,
    drivingLicenseResult: DrivingLicenseResult
  ): void {
    const dialogConfig = new MatDialogConfig();
    const obj: DrivingLicenseEditPopupRecord = {
      action: actionType,
      personId: this.personId,
      drivingLicenseData: drivingLicenseResult,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      AddEditDrivinglicenseComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.setDrivingLicenseByPersonId(this.personId);
      }
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
        this.setPassportByPersonId(this.personId);
      }
    });
  }

  showMoreLess(section: number): void {
    switch (section) {
      case SummaryMoreOrLess.Passport:
        {
          if (this.toggleMoreLessPassport === true) {
            this.btnMoreLessPassText = 'Less';
            this.toggleMoreLessPassport = false;
          } else {
            this.btnMoreLessPassText = 'More';
            this.toggleMoreLessPassport = true;
          }
        }
        break;
      case SummaryMoreOrLess.DL:
        {
          if (this.toggleMoreLessDL === true) {
            this.btnMoreLessDrivLText = 'Less';
            this.toggleMoreLessDL = false;
          } else {
            this.btnMoreLessDrivLText = 'More';
            this.toggleMoreLessDL = true;
          }
        }
        break;
      case SummaryMoreOrLess.SSN:
        {
          if (this.toggleMoreLessSSN === true) {
            this.btnMoreLessSSNText = 'Less';
            this.toggleMoreLessSSN = false;
          } else {
            this.btnMoreLessSSNText = 'More';
            this.toggleMoreLessSSN = true;
          }
        }
        break;
    }
  }

  showMoreLessPassport(i: number): void {
    this.btnMoreLessPassportText[i] =
      this.btnMoreLessPassportText[i] === 'More' ? 'Less' : 'More';
  }
  showMoreLessDrivingLicense(i: number): void {
    this.btnMoreLessDLText[i] =
      this.btnMoreLessDLText[i] === 'More' ? 'Less' : 'More';
  }
}
