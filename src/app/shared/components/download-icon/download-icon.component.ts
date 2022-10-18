import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DownloadToExcelOrCSV } from '../../interface/document-info.interface';
import { DocumentsService } from '../../service/documents/documents.service';

@Component({
  selector: 'app-download-icon',
  templateUrl: './download-icon.component.html',
  styleUrls: ['./download-icon.component.scss'],
})
export class DownloadIconComponent implements OnInit {
  excelOrCSV!: DownloadToExcelOrCSV;
  @Output() downloadBtnClicked = new EventEmitter();

  constructor(private documentsService: DocumentsService) {}

  ngOnInit(): void {
    this.documentsService.getDownloadDetails().subscribe((detailsObj) => {
      this.excelOrCSV = detailsObj;
      this.exportToExcelOrCSV(this.excelOrCSV);
    });
  }

  download(downloadType: string): void {
    this.downloadBtnClicked.emit(downloadType);
  }

  exportToExcelOrCSV(excelOrCSV: DownloadToExcelOrCSV): void {
      this.documentsService
        .downloadToExcelOrCSV(
          excelOrCSV?.downloadType,
          excelOrCSV?.typeName,
          excelOrCSV?.format,
          String(excelOrCSV?.searchKey),
          String(excelOrCSV?.searchTerm),
          String(excelOrCSV?.key1),
          String(excelOrCSV?.value1),
          String(excelOrCSV?.key2),
          String(excelOrCSV?.value2)
        )
        .subscribe(
          (data) => {
            const file = new Blob([data], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const fileURL = URL.createObjectURL(file);
            saveAs(fileURL, excelOrCSV.typeName + '.' + excelOrCSV.format);
          },
          (err) => {
            console.warn(err);
          }
        );
  }
}
