import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CandidateProfileApiService } from '../../../../service/candidate/candidate-profile-api.service';
import { CandidateSubmissionResults, PageConfig, SubmissionTable } from '../../../../../search/interface/candidate-profile/candidate-submission-interface';

@Component({
  selector: 'app-candidate-submissions-tab',
  templateUrl: './candidate-submissions-tab.component.html',
  styleUrls: ['./candidate-submissions-tab.component.scss']
})
export class CandidateSubmissionsTabComponent implements OnInit, OnChanges {
  @Input() personId = '';
  submissionDetails!: CandidateSubmissionResults[];
  total = 0;
  pageNum = 1;
  pageSize = 10;
  sortDirection = 1;
  sortColumn = 'SubmittedOn';
  searchString = '';
  perId = '';
  enableSearch = true;

  candidateSubmissionPanelConfig: SubmissionTable = {
    isLoading: true,
    displayedColumns: [
      'jobTitle',
      'submittedBy',
      'priorityType',
      'clientSubmissionBillRate',
      'submissionStatus',
      'vendorName',
      'endClientName',
      'endClientSubmissionBillRate',
      'actions'
    ],
    columns: [
      {
        headerDisplay: 'Job Title',
        key: 'jobTitle',
      },
      {
        headerDisplay: 'Submitted By',
        key: 'submittedBy',
      },
      {
        headerDisplay: 'Priority',
        key: 'priorityType',
      },
      {
        headerDisplay: 'Submission Bill Rate',
        key: 'clientSubmissionBillRate',
      },
      {
        headerDisplay: 'Status',
        key: 'submissionStatus',
      },
      {
        headerDisplay: 'Client',
        key: 'vendorName',
      },
      {
        headerDisplay: 'End Client',
        key: 'endClientName',
      },
      {
        headerDisplay: 'End Client Bill Rate',
        key: 'endClientSubmissionBillRate',
      }
    ],
    tableData: null,
    totalRows: 0,
  };

  constructor(private candidateProfileApiService: CandidateProfileApiService) { }

  ngOnInit(): void {
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change.personId && change.personId.currentValue) {
      this.perId = change.personId?.currentValue;
      this.getSubmissionByPersonId(this.perId);
    }
  }

  getSubmissionByPersonId(perId: string): void {
    this.candidateProfileApiService.getCandidateSubmissionByPersonId(perId, this.pageNum, this.pageSize,
       this.sortDirection, this.sortColumn, this.searchString).subscribe(
        (data) => {
          this.submissionDetails = data?.result?.results;
          this.total = data?.result?.virtualCount;
          if (this.total === 0){
            this.enableSearch = false;
          }
          this.candidateSubmissionResultParser(data?.result?.results);
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  getNextRecords(event: PageConfig): void {
    this.candidateProfileApiService.getCandidateSubmissionByPersonId(this.perId, event.pageIndex, event.pageSize,
      this.sortDirection, this.sortColumn, this.searchString)
        .subscribe(
          (data) => {
            this.submissionDetails = data?.result?.results;
            this.total = data?.result?.virtualCount;
            this.candidateSubmissionResultParser(data?.result?.results);
          },
          (err) => {
            console.warn(err);
          }
        );
  }

  candidateSubmissionResultParser(canSubmissions: CandidateSubmissionResults[]): void {
    this.candidateSubmissionPanelConfig.isLoading = false;
    this.candidateSubmissionPanelConfig.totalRows = this.total;
    this.candidateSubmissionPanelConfig.tableData = canSubmissions?.map(
      (item, index) => {
        return {
          ...item,
        };
      }
    );
}

performSearch(search: string): void {
  let searchValue = search;
  if (searchValue.length > 0){
    this.searchString = searchValue;
  }
  else{
    this.searchString = '';
    searchValue = '';
  }
  this.candidateSubmissionPanelConfig.isLoading = true;
  this.candidateProfileApiService.getCandidateSubmissionByPersonId(this.perId, this.pageNum, this.pageSize,
      this.sortDirection, this.sortColumn, searchValue)
      .subscribe(
       (data) => {
         this.submissionDetails = data?.result?.results;
         this.total = data?.result?.virtualCount;
         this.candidateSubmissionResultParser(data?.result?.results);
       },
       (err) => {
         console.warn(err);
       }
     );
}

}
