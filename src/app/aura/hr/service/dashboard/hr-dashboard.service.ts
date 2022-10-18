import {
  HttpParams,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, Subject } from 'rxjs';
import { PayrollCalendarResponse } from '../../interface/dashboard/payroll-calendar.interface';
import { ProjectOnboardingResponse } from '../../interface/dashboard/project-onboarding.interface';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  AnniversariesBirthdaysResponse,
  ChartResponse,
  DashboardOnboardingResponse,
  ChartsPopupScreenResponse,
  HolidaysResponse,
  ChartGetAllActiveEmpResponse,
  ChartGetNewHireEmpResponse,
  ChartGetAttritionEmpResponse,
  GetTaskResponse,
  OnBoardStatus,
  ADPResponse,
  USCISResponse,
  CountsDataGridsResponseData,
} from '../../interface/dashboard/hr-dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class HrDashboardService {
  baseUrl = environment.apiBaseUrl;

  constructor(private httpClient: HttpClient) { }

  getHRDashboardChartData(year: string): Observable<ChartResponse> {
    const httpParams = new HttpParams().set('year', year);
    const url = `${this.baseUrl}/Statistics/GetDataForGraphs`;
    return this.httpClient
      .get<ChartResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getAnniversaryData(
    fetchAll: boolean,
    search: string,
    currentMonth: number[]
  ): Observable<AnniversariesBirthdaysResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('fetchAll', fetchAll.toString());
    if (search !== '') {
      httpParams = httpParams.set('searchTerm', search);
    }
    if (currentMonth.length > 0) {
      for (let i = 0; i < currentMonth.length; i++) {
        httpParams = httpParams.set(`months[${i}]`, currentMonth[i].toString());
      }
    }
    const url = `${this.baseUrl}/Milestone/GetAnniversaries`;
    return this.httpClient
      .get<AnniversariesBirthdaysResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getBirthdayData(
    fetchAll: boolean,
    search: string,
    currentMonth: number[]
  ): Observable<AnniversariesBirthdaysResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('fetchAll', fetchAll.toString());
    if (search !== '') {
      httpParams = httpParams.set('searchTerm', search);
    }
    if (currentMonth.length > 0) {
      for (let i = 0; i < currentMonth.length; i++) {
        httpParams = httpParams.set(`months[${i}]`, currentMonth[i].toString());
      }
    }
    const url = `${this.baseUrl}/Milestone/GetBirthdays`;
    return this.httpClient
      .get<AnniversariesBirthdaysResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getHRDashboardHolidaysData(year: string): Observable<HolidaysResponse> {
    const httpParams = new HttpParams().set('year', year);
    const url = `${this.baseUrl}/Holiday/getbyyear`;
    return this.httpClient
      .get<HolidaysResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getDashboardChartsPopupScreenData(
    type: string,
    key: string,
    value: string
  ): Observable<ChartsPopupScreenResponse> {
    const httpParams = new HttpParams()
      .set('widgetParams[0].Key', key)
      .set('widgetParams[0].Value', value);
    const url = `${this.baseUrl}/Statistics/GetDataForWidget/${type}`;
    return this.httpClient
      .get<ChartsPopupScreenResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getExcelDocForWidgetPopupScreenData(
    downloadType: string,
    type: string,
    format: string,
    key: string,
    value: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', key)
      .set('inputParams[0].Value', value);
    const url = `${this.baseUrl}/Statistics/download/${downloadType}/${type}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getExcelToExcelForDataGridsData(
    type: string,
    key: string,
    value: string,
    searchKey: string,
    searchTerm: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', key)
      .set('inputParams[0].Value', value)
      .set('inputParams[1].Key', searchKey)
      .set('inputParams[1].Value', searchTerm);
    const url = `${this.baseUrl}/Export/datagrid/${type}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getExportToExcelForDataGridsData(
    downloadType: string,
    type: string,
    format: string,
    key: string,
    value: string,
    searchKey: string,
    searchTerm: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', key)
      .set('inputParams[0].Value', value)
      .set('inputParams[1].Key', searchKey)
      .set('inputParams[1].Value', searchTerm);
    const url = `${this.baseUrl}/Statistics/download/${downloadType}/${type}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }
  getAllActiveEmployeesData(
    year: string,
    searchTerm: string,
    pageNum: number = 1,
    pageSize: number = 10,
    sortColumn: string,
    sortDirection: string
  ): Observable<ChartGetAllActiveEmpResponse> {
    const httpParams = new HttpParams()
      .set('Year', year)
      .set('SearchTerm', searchTerm)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);
    const url = `${this.baseUrl}/Statistics/GetActiveEmployeesData`;
    return this.httpClient
      .get<ChartGetAllActiveEmpResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getNewHireEmployeesTableData(
    year: string,
    searchTerm: string,
    pageNum: number = 1,
    pageSize: number = 10,
    sortColumn: string,
    sortDirection: string
  ): Observable<ChartGetNewHireEmpResponse> {
    const httpParams = new HttpParams()
      .set('Year', year)
      .set('SearchTerm', searchTerm)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);
    const url = `${this.baseUrl}/Statistics/GetNewHireEmployeesData`;
    return this.httpClient
      .get<ChartGetNewHireEmpResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getAttritionEmployeesTableData(
    year: string,
    searchTerm: string,
    pageNum: number = 1,
    pageSize: number = 10,
    sortColumn: string,
    sortDirection: string
  ): Observable<ChartGetAttritionEmpResponse> {
    const httpParams = new HttpParams()
      .set('Year', year)
      .set('SearchTerm', searchTerm)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString())
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);
    const url = `${this.baseUrl}/Statistics/GetAttritedEmployeesData`;
    return this.httpClient
      .get<ChartGetAttritionEmpResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getHRDashboardOnboardingData(
    searchTerm: string
  ): Observable<DashboardOnboardingResponse> {
    const httpParams = new HttpParams().set('SearchTerm', searchTerm);
    const url = `${this.baseUrl}/Onboarding/GetOnboardingsForDashboard`;
    return this.httpClient
      .get<DashboardOnboardingResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  saveHROnboardingStatusesByEmployeeOnboardingIdAndStatusType(
    statusType: string,
    statusList: OnBoardStatus[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/Onboarding/SaveOnboardingStatus/${statusType}`;

    return this.httpClient
      .post<string[]>(`${url}`, statusList)
      .pipe(retry(1), catchError(this.handleError));
  }

  getDashboardTasksChart(
    type: string,
    yearKey: string,
    fromDateKey: string,
    fromDateValue: string,
    toDateKey: string,
    toDateValue: string
  ): Observable<ChartsPopupScreenResponse> {
    const httpParams = new HttpParams()
      .set('widgetParams[0].Key', yearKey)
      .set('widgetParams[1].Key', fromDateKey)
      .set('widgetParams[1].Value', fromDateValue)
      .set('widgetParams[2].Key', toDateKey)
      .set('widgetParams[2].Value', toDateValue);
    const url = `${this.baseUrl}/Statistics/GetDataForWidget/${type}`;
    return this.httpClient
      .get<ChartsPopupScreenResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getDashboardTasksDetails(
    searchTerm: string,
    fromDate: string,
    toDate: string,
    sortColumn: string,
    sortDirection: string
  ): Observable<GetTaskResponse> {
    const httpParams = new HttpParams()
      .set('SearchTerm', searchTerm)
      .set('FromDate', fromDate)
      .set('ToDate', toDate)
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection);
    const url = `${this.baseUrl}/Statistics/GetTasksList`;
    return this.httpClient
      .get<GetTaskResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  getHRDashboardTaskCount(): Observable<any> {
    const url = `${this.baseUrl}/Statistics/GetCounts`;
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .get<any>(`${url}`)
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  getHROnboardingDataByStatusCode(
    statusCode: number,
    pageNum: number = 1,
    pageSize: number = 10,
    searchText: string = ''
  ): Observable<DashboardOnboardingResponse> {
    const httpParams = new HttpParams()
      .set('EmployeeOnboardingStatusCode', statusCode?.toString())
      .set('SearchTerm', searchText)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString());
    const url = `${this.baseUrl}/Onboarding/GetOnboardings`;
    return this.httpClient
      .get<DashboardOnboardingResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getHROnboardingDataForExportToExcel(
    fetchType: string,
    searchText: string,
    sortColumn: string,
    sortDirection: string,
    titleCode: number
  ): Observable<DashboardOnboardingResponse> {
    const httpParams = new HttpParams()
      .set('FetchType', fetchType)
      .set('SearchTerm', searchText)
      .set('SortColumn', sortColumn)
      .set('SortDirection', sortDirection)
      .set('EmployeeOnboardingStatusCode', titleCode.toString());
    const url = `${this.baseUrl}/Onboarding/GetOnboardings`;
    return this.httpClient
      .get<DashboardOnboardingResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: no-any
  getOnboardingsCount(searchText: string): Observable<any> {
    const httpParams = new HttpParams().set('searchTerm', searchText);
    const url = `${this.baseUrl}/Onboarding/GetOnboardingsCount`;
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .get<any>(`${url}`, {
          params: httpParams,
        })
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  // Get Payroll By Year
  getPayRollCalendarByYear(year: number): Observable<PayrollCalendarResponse> {
    const url = `${this.baseUrl}/PayCalendar/${year}`;
    return this.httpClient
      .get<PayrollCalendarResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  // Get Project Onboarding
  getProjectOnboarding(
    fetchType: number = 0,
    pageNum: number = 1,
    pageSize: number = 10,
    searchTerm: string = '',
    startDate: string = '',
    endDate: string = '',
    sortColumn: string = 'ProjectStartDate',
    sortDirection: number = 1
  ): Observable<ProjectOnboardingResponse> {
    let url = `${this.baseUrl}/Milestone/GetOnboardings?fetchType=${fetchType}`;
    if (fetchType) {
      url += `&pageSize=${pageSize}&pageNum=${pageNum}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
      if (searchTerm) {
        url += `&searchTerm=${searchTerm}`;
      }
      if (startDate !== undefined || endDate !== undefined) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
    }
    return this.httpClient
      .get<ProjectOnboardingResponse>(`${url}`)
      .pipe(retry(1), catchError(this.handleError));
  }

  getADPFailedRecords(
    searchString: string,
    searchYear: string,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<ADPResponse> {
    const httpParams = new HttpParams()
      .set('SearchTerm', searchString)
      .set('Year', searchYear)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString());
    const url = `${this.baseUrl}/ADP/failedinfo`;
    return this.httpClient
      .get<ADPResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getUSCISPendingCases(
    searchString: string,
    searchYear: string,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<USCISResponse> {
    const httpParams = new HttpParams()
      .set('SearchTerm', searchString)
      .set('Year', searchYear)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString());
    const url = `${this.baseUrl}/USCIS/PendingCases`;
    return this.httpClient
      .get<USCISResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getUSCISClosedCases(
    searchString: string,
    searchYear: string,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<USCISResponse> {
    const httpParams = new HttpParams()
      .set('SearchTerm', searchString)
      .set('Year', searchYear)
      .set('PageNum', pageNum.toString())
      .set('PageSize', pageSize.toString());
    const url = `${this.baseUrl}/USCIS/ClosedCases`;
    return this.httpClient
      .get<USCISResponse>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  updateADPRecords(
    employeeOnboardingId: string,
    positionId: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/ADP/manual/adpInfo/update/${employeeOnboardingId}`;
    const formData = new FormData();
    formData.append('positionId', positionId);
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<any>(`${url}`, formData)
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  updateUSCISRecords(
    uscisList: OnBoardStatus[]
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const url = `${this.baseUrl}/USCIS/finalize`;
    return (
      this.httpClient
        // tslint:disable-next-line: no-any
        .post<any>(`${url}`, uscisList)
        .pipe(retry(1), catchError(this.handleError))
    );
  }

  getADPPendingCasesExportToExcel(
    searchKey: string,
    searchValue: string,
    yearKey: string,
    yearValue: string,
    format: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchValue)
      .set('inputParams[1].Key', yearKey)
      .set('inputParams[1].Value', yearValue);
    const url = `${this.baseUrl}/ADP/GetExcelForDataGrid/ADPFailedInfo/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getUSCISPendingCasesExportToExcel(
    searchKey: string,
    searchValue: string,
    yearKey: string,
    yearValue: string,
    format: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchValue)
      .set('inputParams[1].Key', yearKey)
      .set('inputParams[1].Value', yearValue);
    const url = `${this.baseUrl}/USCIS/GetExcelForDataGrid/PendingUSCISCases/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getUSCISClosedCasesExportToExcel(
    searchKey: string,
    searchValue: string,
    yearKey: string,
    yearValue: string,
    format: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchValue)
      .set('inputParams[1].Key', yearKey)
      .set('inputParams[1].Value', yearValue);
    const url = `${this.baseUrl}/USCIS/GetExcelForDataGrid/ClosedUSCISCases/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getPassportExpiringData(
    dataGridType: string,
    searchString: string,
    daysKey: string,
    daysValue: number,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<CountsDataGridsResponseData> {
    const httpParams = new HttpParams()
      .set('request.SearchTerm', searchString)
      .set('request.InputParams[0].Key', daysKey)
      .set('request.InputParams[0].Value', daysValue.toString())
      .set('request.PageNum', pageNum.toString())
      .set('request.PageSize', pageSize.toString());
    const url = `${this.baseUrl}/Statistics/GetDataForCountsDataGrids/${dataGridType}`;
    return this.httpClient
      .get<CountsDataGridsResponseData>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getStemOPTExpiringData(
    dataGridType: string,
    searchString: string,
    daysKey: string,
    daysValue: number,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<CountsDataGridsResponseData> {
    const httpParams = new HttpParams()
      .set('request.SearchTerm', searchString)
      .set('request.InputParams[0].Key', daysKey)
      .set('request.InputParams[0].Value', daysValue.toString())
      .set('request.PageNum', pageNum.toString())
      .set('request.PageSize', pageSize.toString());
    const url = `${this.baseUrl}/Statistics/GetDataForCountsDataGrids/${dataGridType}`;
    return this.httpClient
      .get<CountsDataGridsResponseData>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getOPTBenchData(
    dataGridType: string,
    searchString: string,
    daysKey: string,
    daysValue: number,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<CountsDataGridsResponseData> {
    const httpParams = new HttpParams()
      .set('request.SearchTerm', searchString)
      .set('request.InputParams[0].Key', daysKey)
      .set('request.InputParams[0].Value', daysValue.toString())
      .set('request.PageNum', pageNum.toString())
      .set('request.PageSize', pageSize.toString());
    const url = `${this.baseUrl}/Statistics/GetDataForCountsDataGrids/${dataGridType}`;
    return this.httpClient
      .get<CountsDataGridsResponseData>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getH1BVisaExpiringData(
    dataGridType: string,
    searchString: string,
    daysKey: string,
    daysValue: number,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<CountsDataGridsResponseData> {
    const httpParams = new HttpParams()
      .set('request.SearchTerm', searchString)
      .set('request.InputParams[0].Key', daysKey)
      .set('request.InputParams[0].Value', daysValue.toString())
      .set('request.PageNum', pageNum.toString())
      .set('request.PageSize', pageSize.toString());
    const url = `${this.baseUrl}/Statistics/GetDataForCountsDataGrids/${dataGridType}`;
    return this.httpClient
      .get<CountsDataGridsResponseData>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  getPOExpiringData(
    dataGridType: string,
    searchString: string,
    daysKey: string,
    daysValue: number,
    pageNum: number = 1,
    pageSize: number = 10
  ): Observable<CountsDataGridsResponseData> {
    const httpParams = new HttpParams()
      .set('request.SearchTerm', searchString)
      .set('request.InputParams[0].Key', daysKey)
      .set('request.InputParams[0].Value', daysValue.toString())
      .set('request.PageNum', pageNum.toString())
      .set('request.PageSize', pageSize.toString());
    const url = `${this.baseUrl}/Statistics/GetDataForCountsDataGrids/${dataGridType}`;
    return this.httpClient
      .get<CountsDataGridsResponseData>(`${url}`, {
        params: httpParams,
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  exportHolidaysData(
    format: string,
    year: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('year', year);
    const url = `${this.baseUrl}/Holiday/download/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Candidate Onboarding Export to Excel
  getOnboardingExportToExcel(
    searchKey: string,
    searchValue: string,
    statusKey: string,
    statusValue: string,
    format: string
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchValue)
      .set('inputParams[1].Key', statusKey)
      .set('inputParams[1].Value', statusValue);
    const url = `${this.baseUrl}/Onboarding/download/CandidateOnboarding/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  downloadBirthdayAnniversaryToExcelOrCSV(
    typeName: string,
    format: string,
    searchKey: string,
    searchTerm: string,
    key1: string,
    value1: string | Date | null,
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchTerm)
      .set('inputParams[1].Key', key1)
      .set('inputParams[1].Value', String(value1));
    const url = `${this.baseUrl}/Milestone/download/${typeName}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Project Onboarding download excel or csv
  downloadProjectOnboardingToExcelOrCSV(
    typeName: string,
    format: string,
    searchKey: string,
    searchTerm: string,
    key1: string,
    value1: string | Date | null,
    key2: string,
    value2: string | Date | null
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchTerm)
      .set('inputParams[1].Key', key1)
      .set('inputParams[1].Value', String(value1))
      .set('inputParams[2].Key', key2)
      .set('inputParams[2].Value', String(value2));
    const url = `${this.baseUrl}/Milestone/download/${typeName}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // Download Alerts Cards Data TO EXCEL OR CSV
  downloadAlertCardsDataToExcelOrCSV(
    downloadType: string,
    typeName: string,
    format: string,
    searchKey: string,
    searchTerm: string,
    key1: string,
    value1: string | Date | null
    // tslint:disable-next-line: no-any
  ): Observable<any> {
    const httpParams = new HttpParams()
      .set('inputParams[0].Key', searchKey)
      .set('inputParams[0].Value', searchTerm)
      .set('inputParams[1].Key', key1)
      .set('inputParams[1].Value', String(value1));
    const url = `${this.baseUrl}/Statistics/download/${downloadType}/${typeName}/${format}`;
    return this.httpClient
      .get(`${url}`, {
        params: httpParams,
        responseType: 'arraybuffer' as 'json',
      })
      .pipe(retry(1), catchError(this.handleError));
  }

  // tslint:disable-next-line: typedef
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
