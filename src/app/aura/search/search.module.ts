import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { GlobalSearchResultAllComponent } from './components/global-search-result-all/global-search-result-all.component';
import { SearchResultPanelComponent } from './components/global-search-result-all/search-result-panel/search-result-panel.component';
import { SearchRoutingModule } from './search-routing.module';
import { EmployeeProfileComponent } from './components/employee-profile/employee-profile.component';
import { EmployeeEditProfileComponent } from './components/employee-edit-profile/employee-edit-profile.component';
import { MatDialogRef } from '@angular/material/dialog';
import { EmployeeImmigrationTabComponent } from './components/employee-profile/employee-details-panel/employee-immigration-tab/employee-immigration-tab.component';
import { AddEditImmigrationComponent } from './components/employee-profile/employee-details-panel/employee-immigration-tab/add-edit-immigration/add-edit-immigration.component';
import { EmployeeDetailsPanelComponent } from './components/employee-profile/employee-details-panel/employee-details-panel.component';
import { EmployeeVacationTabComponent } from './components/employee-profile/employee-details-panel/employee-vacation-tab/employee-vacation-tab.component';
import { VacationHistoryPanelComponent } from './components/employee-profile/employee-details-panel/employee-vacation-tab/vacation-history-panel/vacation-history-panel.component';
import { DatePipe } from '@angular/common';

import { EmployeeContractsTabComponent } from './components/employee-profile/employee-details-panel/employee-contracts-tab/employee-contracts-tab.component';
import { EmployeeEmploymentAggreementTabComponent } from './components/employee-profile/employee-details-panel/employee-employment-aggreement-tab/employee-employment-aggreement-tab.component';
import { UserActivityComponent } from './components/generic-components/user-activity/user-activity.component';
import { CandidateProfileComponent } from './components/candidate-profile/candidate-profile.component';
import { CandidateDetailsPanelComponent } from './components/candidate-profile/candidate-details-panel/candidate-details-panel.component';
import { CandidateDocumentsTabComponent } from './components/candidate-profile/candidate-details-panel/candidate-documents-tab/candidate-documents-tab.component';
import { CandidateEditProfileComponent } from './components/candidate-edit-profile/candidate-edit-profile.component';
import { CandidateResumeTabComponent } from './components/candidate-profile/candidate-details-panel/candidate-resume-tab/candidate-resume-tab.component';
import { ResumeFullviewComponent } from './components/candidate-profile/candidate-details-panel/candidate-resume-tab/resume-fullview/resume-fullview.component';
import { AddEditPassportComponent } from './components/generic-components/add-edit-passport/add-edit-passport.component';
import { AddEditEducationComponent } from './components/generic-components/add-edit-education/add-edit-education.component';
import { AddEditDrivinglicenseComponent } from './components/generic-components/add-edit-drivinglicense/add-edit-drivinglicense.component';
import { AddEditEmploymentAgreementComponent } from './components/generic-components/add-edit-employment-agreement.component/add-edit-employment-agreement.component';
import { AddEditSkillsComponent } from './components/generic-components/add-edit-skills/add-edit-skills.component';
import { AddEditCertificationComponent } from './components/generic-components/add-edit-certification/add-edit-certification.component';
import { AddNotesComponent } from './components/generic-components/add-notes/add-notes.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SummaryTabComponent } from './components/generic-components/summary-tab/summary-tab.component';
import { EducationSkillsTabComponent } from './components/generic-components/education-skills-tab/education-skills-tab.component';
import { CertificationsTabComponent } from './components/generic-components/certifications-tab/certifications-tab.component';
import { NotesTabComponent } from './components/generic-components/notes-tab/notes-tab.component';
import { CandidateSubmissionsTabComponent } from './components/candidate-profile/candidate-details-panel/candidate-submissions-tab/candidate-submissions-tab.component';
import { CandidateSubmissionsTableComponent } from './components/candidate-profile/candidate-details-panel/candidate-submissions-tab/candidate-submissions-table/candidate-submissions-table.component';
import { ColumnsDetailsComponent } from './components/candidate-profile/candidate-details-panel/candidate-submissions-tab/columns-details/columns-details.component';
import { PreviewRTRDocumentComponent } from './components/candidate-profile/candidate-details-panel/candidate-submissions-tab/preview-rtr-document/preview-rtr-document.component';
import { EmployeeAdditionalDocumentsComponent } from './components/employee-profile/employee-details-panel/employee-additional-documents/employee-additional-documents.component';
import { I9EverifyComponent } from './components/employee-profile/employee-details-panel/employee-additional-documents/i9-everify/i9-everify.component';

@NgModule({
  declarations: [
    GlobalSearchResultAllComponent,
    SearchResultPanelComponent,
    EmployeeProfileComponent,
    EmployeeEditProfileComponent,
    EmployeeImmigrationTabComponent,
    AddEditImmigrationComponent,
    EmployeeDetailsPanelComponent,
    AddEditPassportComponent,
    AddEditEducationComponent,
    AddEditDrivinglicenseComponent,
    EmployeeContractsTabComponent,
    EmployeeEmploymentAggreementTabComponent,
    AddEditEmploymentAgreementComponent,
    UserActivityComponent,
    EmployeeVacationTabComponent,
    VacationHistoryPanelComponent,
    CandidateProfileComponent,
    CandidateDetailsPanelComponent,
    SummaryTabComponent,
    CandidateDocumentsTabComponent,
    CandidateEditProfileComponent,
    CandidateDetailsPanelComponent,
    CandidateResumeTabComponent,
    ResumeFullviewComponent,
    AddEditSkillsComponent,
    AddEditCertificationComponent,
    AddNotesComponent,
    EducationSkillsTabComponent,
    CertificationsTabComponent,
    NotesTabComponent,
    CandidateSubmissionsTabComponent,
    CandidateSubmissionsTableComponent,
    ColumnsDetailsComponent,
    PreviewRTRDocumentComponent,
    EmployeeAdditionalDocumentsComponent,
    I9EverifyComponent,
  ],
  imports: [SearchRoutingModule, CKEditorModule, SharedModule],
  providers: [
    DatePipe,
    {
      provide: MatDialogRef,
      useValue: {},
    },
  ],
})
export class SearchModule {}
