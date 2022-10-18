import { SearchResultPanelTitle } from '../enum/search.enum';

export interface TableConfig {
  title: SearchResultPanelTitle;
  isLoading: boolean;
  columns: TableColumns[];
  displayedColumns: string[];
  // tslint:disable-next-line: no-any
  tableData: any[] | null;
  type?: string;
  totalRows: number;
}

export interface TableColumns {
  headerDisplay: string;
  key: string;
}

export interface CurrentPage{
  pageIndex: number;
  pageSize: number;
  title: string;
  colName: string;
  sortDirection?: number;
}

export interface PageConfig {
  pageIndex: number;
  pageSize: number;
}
