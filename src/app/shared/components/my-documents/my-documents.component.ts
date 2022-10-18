import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { OnboardingMyDocumentsResult } from '../../interface/document-info.interface';
import { DocumentsService } from '../../service/documents/documents.service';

@Component({
  selector: 'app-my-documents',
  templateUrl: './my-documents.component.html',
  styleUrls: ['./my-documents.component.scss'],
})
export class MyDocumentsComponent implements OnInit {
  onboardingMyDocumentsResult: OnboardingMyDocumentsResult[] = [];
  docURL = '';
  activeDocument!: OnboardingMyDocumentsResult;
  resourceName = '';
  currentDocIndex = 0;
  isLoading = false;
  noData!: boolean;
  employeeId!: string;
  isPdf = false;
  isImage = false;
  imageExt = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];

  constructor(
    private documentsService: DocumentsService,
    private domSanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.employeeId = localStorage.id;
    this.getOnboardingMyDocuments();
  }

  getOnboardingMyDocuments(): void {
    this.documentsService.getOnboardingMyDocuments(this.employeeId).subscribe(
      (data) => {
        if (data?.result) {
          this.noData = false;
          this.onboardingMyDocumentsResult = data?.result;
          this.activeDocument = this.onboardingMyDocumentsResult[0];
          this.currentDocIndex = 0;
          this.viewDocument(this.activeDocument, this.currentDocIndex);
        } else {
          this.noData = true;
        }
      },
      (error) => {
        console.warn(error);
      }
    );
  }

  viewDocument(doc: OnboardingMyDocumentsResult, i: number): void {
    if (this.imageExt.includes(doc.fileExtension)) {
      this.isImage = true;
      this.isPdf = false;
    } else {
      this.isImage = false;
      this.isPdf = true;
    }
    this.previewDoc(doc, i);
  }
  previewDoc(doc: OnboardingMyDocumentsResult, i: number): void {
    if (doc) {
      this.isLoading = true;
      let docType;
      if (doc.isTemplate) {
        docType = 41;
      } else {
        docType = 0;
      }
      this.documentsService.getDocumentFile(doc.resourceId, docType).subscribe(
        (data) => {
          const file = new Blob([data], { type: doc.contentType });
          const fileURL = URL.createObjectURL(file);
          if (this.isImage) {
            this.docURL = this.domSanitizer.bypassSecurityTrustUrl(
              fileURL
            ) as string;
          } else if (this.isPdf) {
            this.docURL = fileURL;
          }
          this.resourceName = doc?.resourceName;
          this.currentDocIndex = i;
          this.isLoading = false;
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
    }
  }
  downloadDocument(doc: OnboardingMyDocumentsResult): void {
    if (doc) {
      let docType;
      if (doc.isTemplate) {
        docType = 41;
      } else {
        docType = 0;
      }

      this.documentsService
        .downloadDocumentFile(doc?.resourceId, docType)
        .subscribe(
          (data) => {
            const file = new Blob([data], { type: doc.contentType });
            const fileURL = URL.createObjectURL(file);

            saveAs(fileURL, `${doc?.resourceName}.${doc?.fileExtension}`);
          },
          (err) => {
            console.warn(err);
          }
        );
    }
  }

  downloadAllDocuments(): void {
    this.documentsService
      .downloadOnboardingAllDocuments(this.employeeId)
      .subscribe(
        (data) => {
          const file = new Blob([data], { type: 'application/zip' });
          const fileURL = URL.createObjectURL(file);

          saveAs(fileURL, `AllDocuments.zip`);
          console.log(data);
        },
        (error) => {
          console.warn(error);
        }
      );
  }
}
