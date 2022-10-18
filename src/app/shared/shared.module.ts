import { NgModule } from '@angular/core';
import { AntraUiModule } from 'antra-ui';
import { SpinnerComponent } from '../shared/components/spinner/spinner.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// angular material modules
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';

// Popover Module
import { MdePopoverModule } from '@material-extended/mde';
import { GlobalSearchComponent } from './components/global-search/global-search.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SnackbarNotificationComponent } from './components/snackbar-notification/snackbar-notification.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { ImageDragDirective } from './directives/ImageDrag';
import { PreviewDocumentComponent } from './components/preview-document/preview-document.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { ChartsModule } from 'ng2-charts';

import { InformationDialogComponent } from './components/information-dialog/information-dialog.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PhoneMaskDirective } from './directives/phone-mask.directive';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { PreviewCancelChequeComponent } from './components/preview-cancel-cheque/preview-cancel-cheque.component';
import { DigitalSignatureComponent } from './components/digital-signature/digital-signature.component';
import { UploadDocumentsComponent } from './components/upload-documents/upload-documents.component';
import { PreviewWithoutUploadComponent } from './components/preview-without-upload/preview-without-upload.component';
import { PopupDialogBoxComponent } from './components/popup-dialog-box/popup-dialog-box.component';
import { ProgressSpinnerComponent } from './components/progress-spinner/progress-spinner.component';
import { PreviewEadComponent } from './components/preview-ead/preview-ead.component';
import { BasicInfoComponent } from './components/basic-info/basic-info.component';
import { DonutChartComponent } from './components/donut-chart/donut-chart.component';
import { DigitalClockComponent } from './components/digital-clock/digital-clock.component';
import { GenericTasksComponent } from './components/generic-tasks/generic-tasks.component';
import { InitiateSeparationActionComponent } from './components/initiate-separation-action/initiate-separation-action.component';
import { DebugApiComponent } from './components/debug-api/debug-api.component';
import { AtsAuraOnboardDialogComponent } from './components/ats-aura-onboard-dialog/ats-aura-onboard-dialog.component';
import { DownloadIconComponent } from './components/download-icon/download-icon.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ChunkDaysPipe } from './pipes/chunk-days.pipe';
import { CustomCalendarComponent } from './components/custom-calendar/custom-calendar.component';
import { DataGridsResultsTblComponent } from './components/data-grids-results-tbl/data-grids-results-tbl.component';
// import { TextMaskModule } from 'angular2-text-mask';
import { MyDocumentsComponent } from './components/my-documents/my-documents.component';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import * as core from '@angular/material/core';

@NgModule({
  declarations: [
    ImageDragDirective,
    SpinnerComponent,
    GlobalSearchComponent,
    SnackbarNotificationComponent,
    ConfirmationDialogComponent,
    PreviewDocumentComponent,
    InformationDialogComponent,
    PhoneMaskDirective,
    PreviewCancelChequeComponent,
    DigitalSignatureComponent,
    UploadDocumentsComponent,
    PreviewWithoutUploadComponent,
    PopupDialogBoxComponent,
    ProgressSpinnerComponent,
    PreviewEadComponent,
    BasicInfoComponent,
    DonutChartComponent,
    DigitalClockComponent,
    GenericTasksComponent,
    InitiateSeparationActionComponent,
    DebugApiComponent,
    AtsAuraOnboardDialogComponent,
    DownloadIconComponent,
    ChunkDaysPipe,
    CustomCalendarComponent,
    DataGridsResultsTblComponent,
    MyDocumentsComponent,
  ],
  imports: [
    AntraUiModule,
    ChartsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MdePopoverModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatDatepickerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatTableModule,
    MatSortModule,
    ScrollingModule,
    MatSliderModule,
    MatRadioModule,
    MatSelectModule,
    MatSelectModule,
    GooglePlaceModule,
    // TextMaskModule,
  ],
  exports: [
    AntraUiModule,
    ChartsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatNativeDateModule,
    MdePopoverModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatCardModule,
    MatDatepickerModule,
    MatDatepickerModule,
    MatDialogModule,
    MatCheckboxModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSortModule,
    MatChipsModule,
    MatPaginatorModule,
    MatTableModule,
    MatStepperModule,
    ImageDragDirective,
    // TextMaskModule,
    SpinnerComponent,
    GlobalSearchComponent,
    SnackbarNotificationComponent,
    ConfirmationDialogComponent,
    PreviewDocumentComponent,
    ScrollingModule,
    PhoneMaskDirective,
    MatSliderModule,
    PreviewCancelChequeComponent,
    MatRadioModule,
    ProgressSpinnerComponent,
    BasicInfoComponent,
    DonutChartComponent,
    DigitalClockComponent,
    GenericTasksComponent,
    InitiateSeparationActionComponent,
    DebugApiComponent,
    AtsAuraOnboardDialogComponent,
    DownloadIconComponent,
    GooglePlaceModule,
    ChunkDaysPipe,
    CustomCalendarComponent,
    DataGridsResultsTblComponent,
  ],
  providers: [
    { provide: core.MAT_DATE_LOCALE, useValue: 'en-US' },
    {
      provide: core.DateAdapter,
      useClass: MomentDateAdapter,
      deps: [core.MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: core.MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class SharedModule {}
