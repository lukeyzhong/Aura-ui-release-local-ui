export interface ComponentLevelPermissionsResponse {
  errorCode: number;
  errorMessage: string;
  result: ComponentLevelPermissionsResult[];
}
export interface ComponentLevelPermissionsResult {
  name: string;
  displayOrder: number;
  code: string;
}

export enum HRDashboardComponents {
  InnerTAEDataGraph = 'InnerTAEDataGraph',

  InnerTNHDataGraph = 'InnerTNHDataGraph',

  InnerATTRDataGraph = 'InnerATTRDataGraph',

  ProjectOnboardings = 'ProjectOnboardings',
  TasksCount = 'TasksCount',
  OnboardingList = 'OnboardingList',
  PayrollCalendar = 'PayrollCalendar',
  ViewBirthdays = 'ViewBirthdays',
  ViewAnniversaries = 'ViewAnniversaries',

  TotalCounts = 'TotalCounts',
  HRDashQuickLinks = 'HRDashQuickLinks',
  ViewHolidays = 'ViewHolidays',
}
export enum HRDashboardMenus {
  Dashboard = '0a23fa4d-e935-46d9-9a02-7d811f718861',
}

export enum EmployeeDashboardComponents {
  EmployeeQuickView = 'EmployeeQuickView',
  EMPDashEditQuickView = 'EMPDashEditQuickView',

  EMPDashTasks = 'EMPDashTasks',
  EMPDashPayrollCalendar = 'EMPDashPayrollCalendar',
  EMPDashTHWWidget = 'EMPDashTHWWidget',
  EMPDashPTOWidget = 'EMPDashPTOWidget',
  EMPDashInterviewsWidget = 'EMPDashInterviewsWidget',
  EMPDashHolidaysWidget = 'EMPDashHolidaysWidget',
  EMPDashQuickLinks = 'EMPDashQuickLinks',
  EMPDashTimeSheetGrid = 'EMPDashTimeSheetGrid',
  EMPDashRecentActivity = 'EMPDashRecentActivity',

  // EMPDashNotes = 'EMPDashNotes',
}
export enum EmployeeDashboard {
  Me = '9ABFF869-186D-441E-90E2-920A936C1A44',
}

export enum CandidateDashboard {
  Me = '40CBF859-444C-44AF-91D9-2784964082B6',
}
