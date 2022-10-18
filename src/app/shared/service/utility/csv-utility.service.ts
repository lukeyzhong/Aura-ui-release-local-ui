import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CsvUtilityService {

  constructor() { }

  // tslint:disable-next-line: no-any
  exportToCSV(excelTableData: any, displayedColumns: string[], title: string): void {
    const header = displayedColumns?.join(',') + '\n';
    // tslint:disable-next-line: no-any
    const rows = excelTableData?.map((rowObj: any) => {
        // tslint:disable-next-line: no-non-null-assertion
        return displayedColumns!
          // tslint:disable-next-line: no-any
          .map((col: any) => '"' + rowObj[col] + '"')
          .join(',');
      })
      .join('\n') ;
    const csvContent = 'data:text/csv;charset=utf-8,' + header + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title}.csv`);
    document.body.appendChild(link);
    link.click();
  }
}
