import { TableColumns } from '../../../search/interface/table.interface';

export interface PayrollMapByPayDate {
  [payDate: string]: PayrollCalendarResult;
}

// PayrollCalendarResponse interface
export interface PayrollCalendarResponse {
  errorCode: number;
  errorMessage: string;
  result: PayrollCalendarResult[];
}

// PayrollCalendarResult
export interface PayrollCalendarResult {
  payperiodId: string;
  year: number;
  payperiodNumber: number;
  startDate: string;
  endDate: string;
  payDate: string;
  lastDayToSubmit: string;
}

export interface PayRollConfig {
  isLoading: boolean;
  columns: TableColumns[];
  displayedColumns: string[];
  tableData: PayrollCalendarResult[] | null;
  totalRows: number;
}

export interface PayrollCalendarList {
  payDateText: string;
  fromDateText: string;
  toDateText: string;
  submText: string;
}
