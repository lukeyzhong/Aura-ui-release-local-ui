import { ElementRef, Inject } from '@angular/core';
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import SignaturePad from 'signature_pad';
import html2canvas from 'html2canvas';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CandidateOnboardingWorkflowService } from '../../service/candidate-workflow/candidate-onboarding-workflow.service';
import { ActiveUserInfoService } from '../../../core/service/active-user-info.service';
import { CandidateSignatureListResult } from '../../interface/candidate-onboarding-workflow.interface';
import { MatNotificationService } from '../../service/mat-notification.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { GenericProfileApiService } from '../../../../app/aura/search/service/generic-profile-api.service';

@Component({
  selector: 'app-digital-signature',
  templateUrl: './digital-signature.component.html',
  styleUrls: ['./digital-signature.component.scss'],
})
export class DigitalSignatureComponent implements OnInit, AfterViewInit {
  errorMessage = '';
  signaturePad!: SignaturePad;
  @ViewChild('drawCanvas') canvasEl!: ElementRef;

  isType = false;
  isDraw = false;
  isUpload = false;
  documentId!: string;

  file!: File;
  fileExt = ['jpg', 'jpeg', 'png', 'bmp'];
  formTypes = ['Documents', 'Tax', 'I9Form'];
  imageUrl!: string;
  userId!: string;
  isLoading = true;
  isLoadingSign = false;

  @ViewChild('typeSign') screen!: ElementRef;
  @ViewChild('canvas') canvas!: ElementRef;

  @ViewChild('signOptions') signOptionsGroup!: MatTabGroup;
  @ViewChild('typeSign') typeSign!: ElementRef;

  employeeOnboardingId!: string;
  formType!: string;
  signType!: string;
  isSignSaved = false;
  disableSaveSign = false;
  candidateSignatureListResult: CandidateSignatureListResult[] = [];
  candidateSignature!: CandidateSignatureListResult;
  activeSignature!: CandidateSignatureListResult | null;
  activeSignDocId!: string;
  totalSigns = 0;
  totalSignsAfterDelete = 0;
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  selectedSignBase64String!: string;

  constructor(
    private genericProfileApiService: GenericProfileApiService,
    private dialogConfirm: MatDialog,
    private matNotificationService: MatNotificationService,
    private dialogRef: MatDialogRef<DigitalSignatureComponent>,
    private activeUserInfo: ActiveUserInfoService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    // tslint:disable-next-line: no-any
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.employeeOnboardingId = data?.obj?.employeeOnboardingId;
    this.formType = data?.obj?.formType;
    this.signType = data?.obj?.signType;

    this.isSignSaved = this.formType === 'HR Sign' ? true : false;
    this.disableSaveSign = this.formType === 'HR Sign' ? true : false;
  }

  ngOnInit(): void {
    this.userId = this.activeUserInfo?.getActiveUserInfo()?.userId;
    this.setCandidateSignatures();
  }

  setCandidateSignatures(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCandidateSignatures(this.userId)
      .subscribe(
        // tslint:disable-next-line: no-any
        (data: any) => {
          if (data?.errorCode === 400) {
            this.errorMessage = 'login';
            this.isLoading = false;
          } else {
            this.isLoading = false;

            if (data?.errorCode === 28) {
              this.candidateSignatureListResult = data?.result;
              if (data?.result?.length === undefined) {
                this.candidateSignatureListResult = [];
              }

              for (let i = 0; i < 3; i++) {
                if (this.candidateSignatureListResult?.length < 3) {
                  this.candidateSignatureListResult.length =
                    this.candidateSignatureListResult?.length + 1;
                } else {
                  break;
                }
              }
            } else {
              this.candidateSignatureListResult = data?.result;

              this.totalSignsAfterDelete =
                this.candidateSignatureListResult?.length;

              for (let i = 0; i < 3; i++) {
                if (this.candidateSignatureListResult?.length < 3) {
                  this.candidateSignatureListResult.length =
                    this.candidateSignatureListResult?.length + 1;
                } else {
                  break;
                }
              }
            }
          }
        },
        (err) => {
          this.isLoading = false;
          console.warn(err);
        }
      );
  }
  closePreview(): void {
    this.dialogRef.close('cancel');
  }

  ngAfterViewInit(): void {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }

  clearPad(): void {
    this.signaturePad.clear();
  }
  clearSign(): void {
    this.selectedSignBase64String = '';
    this.activeSignature = null;
    switch (this.formType) {
      case 'HR Sign':
        this.disableSaveSign = true;
        this.isSignSaved = true;
        break;
      case 'Candidate Sign':
        this.disableSaveSign = false;
        this.isSignSaved = false;
        break;
    }
  }
  saveCandidateSignature(): void {
    if (this.selectedSignBase64String === undefined) {
      this.matNotificationService.warn(
        ':: Please Choose or Add new signature.'
      );
    } else if (this.selectedSignBase64String || this.activeSignDocId) {
      if (this.formType === 'HR Sign') {
        this.saveHRSelectedSignature(this.activeSignDocId);
      } else {
        this.saveSelectedSignature(this.selectedSignBase64String);
      }
    } else {
      switch (this.signOptionsGroup.selectedIndex) {
        // TAB - TYPE
        case 0:
          {
            if (this.isSignSaved === true && this.totalSignsAfterDelete >= 3) {
              this.matNotificationService.warn(
                ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
              );
            } else {
              this.saveTypeSignature();
            }
          }
          break;
        // TAB - DRAW
        case 1:
          {
            if (this.isSignSaved === true && this.totalSignsAfterDelete >= 3) {
              this.matNotificationService.warn(
                ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
              );
            } else {
              this.saveDrawSignature();
            }
          }
          break;
        // TAB - UPLOAD
        case 2:
          {
            if (this.isSignSaved === true && this.totalSignsAfterDelete >= 3) {
              this.matNotificationService.warn(
                ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
              );
            } else {
              this.saveUploadSignature();
            }
          }
          break;
      }
    }
  }

  saveHRSelectedSignature(documentId: string): void {
    this.isLoading = true;
    this.isSignSaved = false;

    this.candidateOnboardingWorkflowService
      .generateAndSaveCandidateOfferLetter(
        this.employeeOnboardingId,
        documentId,
        this.isSignSaved,
        this.formType
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Selected HR Signature added successfully to Offer Letter.'
          );
          this.dialogRef.close('success');
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }
  // SELECTED SIGN
  saveSelectedSignature(base64String: string): void {
    const signatureImg = this.dataURItoBlob(base64String);
    this.file = new File([signatureImg], 'candidate-sign.png', {
      type: 'image/png',
    });

    if (this.formTypes?.includes(this.formType)) {
      this.dialogRef.close({
        status: 'success',
        docId: this.activeSignDocId,
        file: this.file,
        signType: this.signType,
        isSignSaved: this.isSignSaved,
      });
    } else {
      this.isLoading = true;
      this.isSignSaved = false;

      this.candidateOnboardingWorkflowService
        .generateAndSaveCandidateOfferLetter(
          this.employeeOnboardingId,
          this.file,
          this.isSignSaved,
          this.formType
        )
        .subscribe(
          (data) => {
            this.matNotificationService.success(
              ':: Selected Signature added successfully to Offer Letter.'
            );
            this.dialogRef.close('success');
            this.isLoading = false;
          },
          (err) => {
            console.warn(err);
            this.isLoading = false;
          }
        );
    }
  }
  // CANVAS/DRAW SAVE
  saveDrawSignature(): void {
    this.isLoadingSign = true;
    const base64Data = this.signaturePad.toDataURL();

    if (base64Data.length !== 2774) {
      const signatureImg = this.dataURItoBlob(base64Data);
      this.file = new File([signatureImg], 'candidate-sign.png', {
        type: 'image/png',
      });

      if (this.formTypes?.includes(this.formType)) {
        this.isLoadingSign = false;
        this.dialogRef.close({
          status: 'success',
          file: this.file,
          signType: this.signType,
          isSignSaved: this.isSignSaved,
        });
      } else {
        if (this.formType === 'HR Sign') {
          if (this.totalSignsAfterDelete >= 3) {
            this.matNotificationService.warn(
              ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
            );
          } else {
            this.isDraw = true;
          }
        } else if (this.formType === 'Candidate Sign') {
          this.isDraw = this.isSignSaved;
        } else {
          this.isDraw = this.isSignSaved;
        }

        this.candidateOnboardingWorkflowService
          .generateAndSaveCandidateOfferLetter(
            this.employeeOnboardingId,
            this.file,
            this.isDraw,
            this.formType
          )
          .subscribe(
            (data) => {
              this.isLoadingSign = false;
              this.matNotificationService.success(
                ':: Signature stored successfully'
              );
              this.dialogRef.close('success');
            },
            (err) => {
              this.isLoadingSign = false;
              console.warn(err);
            }
          );
      }
    } else {
      this.matNotificationService.warn(':: Please Draw the signature.');
      this.isLoadingSign = false;
    }
  }

  // UPLOAD SAVE
  saveUploadSignature(): void {
    this.isLoadingSign = true;
    if (this.formTypes?.includes(this.formType)) {
      this.isLoadingSign = false;
      this.dialogRef.close({
        status: 'success',
        file: this.file,
        signType: this.signType,
        isSignSaved: this.isSignSaved,
      });
    } else {
      if (this.file) {
        if (this.formType === 'HR Sign') {
          if (this.totalSignsAfterDelete >= 3) {
            this.matNotificationService.warn(
              ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
            );
          } else {
            this.isUpload = true;
          }
        } else if (this.formType === 'Candidate Sign') {
          this.isUpload = this.isSignSaved;
        } else {
          this.isUpload = this.isSignSaved;
        }

        this.candidateOnboardingWorkflowService
          .generateAndSaveCandidateOfferLetter(
            this.employeeOnboardingId,
            this.file,
            this.isUpload,
            this.formType
          )
          .subscribe(
            (data) => {
              this.isLoadingSign = false;
              this.matNotificationService.success(
                ':: Signature stored successfully'
              );
              this.dialogRef.close('success');
            },
            (err) => {
              this.isLoadingSign = false;
              console.warn(err);
            }
          );
      } else {
        this.matNotificationService.warn(':: Please Upload the signature.');
        this.isLoadingSign = false;
      }
    }
  }

  // TYPE SAVE
  saveTypeSignature(): void {
    this.isLoadingSign = true;
    // tslint:disable-next-line: no-any
    html2canvas(this.screen.nativeElement).then((canvas: any) => {
      this.canvas.nativeElement.src = canvas.toDataURL();
      const signatureImg = this.dataURItoBlob(canvas.toDataURL());
      const file = new File([signatureImg], 'candidate-sign.png', {
        type: 'image/png',
      });
      if (canvas.toDataURL().length !== 482) {
        this.imageUrl = canvas.toDataURL();
        if (this.formTypes.includes(this.formType)) {
          this.isLoadingSign = false;
          this.dialogRef.close({
            status: 'success',
            file,
            signType: this.signType,
            isSignSaved: this.isSignSaved,
          });
        } else {
          if (this.formType === 'HR Sign') {
            if (this.totalSignsAfterDelete >= 3) {
              this.matNotificationService.warn(
                ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
              );
            } else {
              this.isType = true;
            }
          } else if (this.formType === 'Candidate Sign') {
            this.isType = this.isSignSaved;
          } else {
            this.isType = this.isSignSaved;
          }

          this.candidateOnboardingWorkflowService
            .generateAndSaveCandidateOfferLetter(
              this.employeeOnboardingId,
              file,
              this.isType,
              this.formType
            )
            .subscribe(
              (data) => {
                this.isLoadingSign = false;
                this.matNotificationService.success(
                  ':: Signature stored successfully'
                );
                this.dialogRef.close('success');
              },
              (err) => {
                this.isLoadingSign = false;
                console.warn(err);
              }
            );
        }
      } else {
        this.matNotificationService.warn(':: Please Type the signature.');
        this.isLoadingSign = false;
      }
    });
  }

  dataURItoBlob(dataURI: string): Blob {
    const byteString = window.atob(
      dataURI.replace(/^data:image\/(png|jpeg|jpg);base64,/, '')
    );
    const arrayBuffer = new ArrayBuffer(byteString?.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString?.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
  }

  generateAndSaveCandidateOfferLetter(
    employeeOnboardingId: string,
    document: File,
    saveSign: boolean,
    formType: string
  ): void {
    this.candidateOnboardingWorkflowService
      .generateAndSaveCandidateOfferLetter(
        employeeOnboardingId,
        document,
        saveSign,
        formType
      )
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            '::Offer Letter generated successfully with candidate signature.'
          );
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  // tslint:disable-next-line: no-any
  uploadSignature(event: any): void {
    this.clearSign();
    this.file = event?.target?.files[0];
    if (this.fileExt.includes(this.file?.name?.split('.')[1])) {
      // Show image preview
      const reader = new FileReader();
      // tslint:disable-next-line: no-any
      reader.onload = (e: any) => {
        this.imageUrl = e?.target?.result;
      };
      reader.readAsDataURL(this.file);
    }
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    // reset all tabs sign
    this.clearSign();
    this.clearTypeSign();
    this.clearPad();
    this.imageUrl = '';
    if (this.formType === 'HR Sign') {
      this.isSignSaved = true;
      this.disableSaveSign = true;
    } else {
      this.isSignSaved = false;
      this.disableSaveSign = false;
    }
  }

  saveSignatureStatus(signType: string, event: MatCheckboxChange): void {
    switch (signType) {
      case 'Type':
        if (this.totalSignsAfterDelete >= 3) {
          this.matNotificationService.warn(
            ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
          );
          event.source.checked = false;
        } else {
          this.isType = event?.source?.checked;
          this.isSignSaved = event?.source?.checked;
        }
        break;

      case 'Draw':
        if (this.totalSignsAfterDelete >= 3) {
          this.matNotificationService.warn(
            ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
          );
          event.source.checked = false;
        } else {
          this.isDraw = event?.source?.checked;
          this.isSignSaved = event?.source?.checked;
        }
        break;

      case 'Upload':
        if (this.totalSignsAfterDelete >= 3) {
          this.matNotificationService.warn(
            ':: You cannot save more than 3 Signatures. Please delete one to store new one.'
          );
          event.source.checked = false;
        } else {
          this.isUpload = event?.source?.checked;
          this.isSignSaved = event?.source?.checked;
        }
        break;
    }
  }

  deleteSignature(documentId: string): void {
    const docId = [documentId];
    this.dialogConfirmRef = this.dialogConfirm.open(
      ConfirmationDialogComponent,
      {
        disableClose: false,
      }
    );

    this.dialogConfirmRef.componentInstance.confirmMessage =
      'Are you sure, you wants to delete the signature?';
    this.dialogConfirmRef.afterClosed().subscribe((result) => {
      if (result) {
        this.genericProfileApiService
          .deleteDocumentsOrSignaturesByDocumentId(docId)
          .subscribe(
            (data) => {
              if (data.errorCode === 24) {
                this.setCandidateSignatures();
                this.matNotificationService.success(
                  '::Selected signature deleted successfully.'
                );
                // reset all tabs sign
                this.clearTypeSign();
                this.clearPad();
                this.imageUrl = '';
                this.activeSignature = null;
                switch (this.formType) {
                  case 'HR Sign':
                    this.isSignSaved = true;
                    this.disableSaveSign = true;
                    break;
                  case 'Candidate Sign':
                    this.isSignSaved = false;
                    this.disableSaveSign = false;
                    break;
                  default:
                    this.isSignSaved = false;
                    this.disableSaveSign = false;
                    break;
                }
                this.selectedSignBase64String = '';
                this.activeSignDocId = '';
              }
            },
            (err) => {
              console.warn(err);
            }
          );
      } else {
        if (this.activeSignature) {
          this.isSignSaved = false;
          this.disableSaveSign = true;
        } else {
          switch (this.formType) {
            case 'HR Sign':
              this.isSignSaved = true;
              this.disableSaveSign = true;
              break;
            case 'Candidate Sign':
              this.isSignSaved = false;
              this.disableSaveSign = false;
              break;
          }
        }
      }
    });
  }

  selectSign(sign: CandidateSignatureListResult): void {
    this.activeSignature = sign;
    this.selectedSignBase64String = sign?.imageBase64String;
    this.activeSignDocId = sign?.documentId;

    // reset all tabs sign
    this.clearTypeSign();
    this.clearPad();
    this.imageUrl = '';
    this.isSignSaved = false;
    this.disableSaveSign = true;
  }

  clearTypeSign(): void {
    this.typeSign.nativeElement.innerText = '';
  }

  clearActiveSignSelection(): void {
    this.activeSignature = null;
    switch (this.formType) {
      case 'HR Sign':
        this.isSignSaved = true;
        this.disableSaveSign = true;
        break;
      case 'Candidate Sign':
        this.isSignSaved = false;
        this.disableSaveSign = false;
        break;
    }
  }
}
