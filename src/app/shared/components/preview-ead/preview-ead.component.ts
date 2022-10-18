import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EADInfo } from '../../interface/candidate-onboarding-workflow.interface';
import { LookupService } from '../../service/lookup/lookup.service';

@Component({
  selector: 'app-preview-ead',
  templateUrl: './preview-ead.component.html',
  styleUrls: ['./preview-ead.component.scss'],
})
export class PreviewEadComponent implements OnInit {
  displayedColumns: string[] = ['eadCode', 'eadName', 'eadDescription'];
  eadInfoList: EADInfo[] = [];
  dataSource: EADInfo[] = [];
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<PreviewEadComponent>,
    private lookupService: LookupService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.lookupService.getEADCategoryType().subscribe(
      (data) => {
        let eadInfo: EADInfo;
        for (const ead of data?.result) {
          eadInfo = {
            eadCode: ead.abbr,
            eadName: ead.name,
            eadDescription: ead.description,
          };
          this.eadInfoList.push(eadInfo);
        }
        this.dataSource = this.eadInfoList;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        console.warn(error);
      }
    );
  }
  closePreview(): void {
    this.dialogRef.close('cancel');
  }
}
