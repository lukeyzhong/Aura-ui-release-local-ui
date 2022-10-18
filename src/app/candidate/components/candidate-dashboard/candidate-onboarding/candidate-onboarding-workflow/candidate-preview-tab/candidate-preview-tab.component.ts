import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { PreviewDocumentComponent } from '../../../../../../shared/components/preview-document/preview-document.component';
import { DocumentInformation } from '../../../../../../shared/interface/document-info.interface';
import {
  BankPaycheckInfo,
  CandidateOnboardingEducationInformationResult,
  CandidateOnboardingIdentificationImmigrationInformationResult,
  CandidateOnboardingPersonalInformationResult,
  CandidateOnboardingTaxInformationResult,
  ImmigrationData,
  StateTax,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import {
  Addresses,
  AddressType,
  ContactAddressType,
} from '../../../../../../aura/search/interface/person.interface';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import {
  CandidateOnboardingEmergencyContactsResult,
  EmergencyContacts,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { DocumentsService } from '../../../../../../shared/service/documents/documents.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { OnBoardStatus } from '../../../../../../aura/hr/interface/dashboard/hr-dashboard.interface';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { HrDashboardService } from '../../../../../../aura/hr/service/dashboard/hr-dashboard.service';
import { Router } from '@angular/router';
import { EmployeeImmigrationAddEditRecord } from '../../../../../../aura/search/interface/employee-profile/employee-profile-immigration.interface';

@Component({
  selector: 'app-candidate-preview-tab',
  templateUrl: './candidate-preview-tab.component.html',
  styleUrls: ['./candidate-preview-tab.component.scss'],
})
export class CandidatePreviewTabComponent implements OnInit {
  @Input() stepper!: MatStepper;
  @Output() candidateSubmit = new EventEmitter();

  @Input() employeeOnboardingId = '';
  candidateOnboardingPersonalInfoResult!: CandidateOnboardingPersonalInformationResult;
  identificationImmigrationInformationResult!: CandidateOnboardingIdentificationImmigrationInformationResult;
  educationInformationResult!: CandidateOnboardingEducationInformationResult;
  immigrationData!: ImmigrationData[];

  email: string[] = [];
  cellPhoneNumber: string[] = [];
  cellCountry: string[] = [];
  homePhoneNumber: string[] = [];
  homeCountry: string[] = [];
  officePhoneNumber: string[] = [];
  officeCountry: string[] = [];
  officeExtension: string[] = [];

  livingAddress!: Addresses | null;
  livingAddrStateName = '';
  livingAddrCountryName = '';
  fileExtO = ['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp'];
  mapState = new Map<string, string>();
  stateName = '';
  refreshDocs = false;
  emergencyContactsResult!: CandidateOnboardingEmergencyContactsResult;
  emergencyContacts!: EmergencyContacts[];
  mapCountry = new Map<string, string>();

  bankPaycheckInfo!: BankPaycheckInfo[];
  docURL = '';
  i9DocURL = '';
  isLoadingI9Form = false;
  compName = 'CandidatePreviewTabComponent';
  i9DocId!: string;
  isLoadingTaxForm = false;

  federalTaxURL = '';
  taxFilingStatus!: string;
  stateTaxDetails!: StateTax;
  taxFormsUpdated: number[] = [];
  currentTaxFormIndex = 0;
  taxFormsList = ['Federal Tax Withholding', 'State Tax Withholding'];
  taxFormName = 'Federal Tax Withholding';
  taxInformationResult!: CandidateOnboardingTaxInformationResult;
  selectedIndex = 0;
  empType!: string;
  empTypes = ['1099', 'Unpaid Intern'];
  hideTaxTab = true;
  mapEADCategory = new Map<number, string>();

  profilePicStatus = true;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<PreviewDocumentComponent>,
    private lookupService: LookupService,
    private documentsService: DocumentsService,
    private hrDashboardService: HrDashboardService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private matNotificationService: MatNotificationService
  ) {}

  ngOnInit(): void {
    this.setPersonalInfo();
    this.setStateLookup();
    this.setEADCategory();
    this.setIdentificationInfo();
    this.setEducationInfo();

    this.setCountryLookup();
    this.setEmergencyContacts();

    this.setBanksAndPaychecksDetails();
    this.candidateOnboardingWorkflowService
      .getTaxFilingStatus()
      .subscribe((tax) => {
        this.taxFilingStatus = tax.taxFiling;
      });
    this.candidateOnboardingWorkflowService
      .getStateTaxDetails()
      .subscribe((taxObj) => {
        this.stateTaxDetails = taxObj.stateTax;
      });
    this.candidateOnboardingWorkflowService.getI9DocURL().subscribe((i9Doc) => {
      this.i9DocURL = i9Doc.docURL;
    });
    this.candidateOnboardingWorkflowService
      .getTaxDocURL()
      .subscribe((taxDoc) => {
        this.federalTaxURL = taxDoc.docURL;
      });

    this.setTaxInformation();
    this.candidateOnboardingWorkflowService
      .getEmpType()
      .subscribe((empTypeObj) => {
        this.empType = empTypeObj.empType;
        this.hideTaxTab = this.empTypes.includes(this.empType) ? false : true;
      });

    this.candidateOnboardingWorkflowService
      .getProfilePicStatus()
      .subscribe((status) => {
        this.profilePicStatus = status;
      });
  }
  setEADCategory(): void {
    this.lookupService.getEADCategoryType().subscribe(
      (data) => {
        for (const ead of data?.result) {
          this.mapEADCategory.set(ead?.lookupCode, ead?.abbr);
        }
      },
      (error) => {
        console.warn(error);
      }
    );
  }
  getEADCategoryName(code: number | undefined): string {
    return String(this.mapEADCategory.get(Number(code)));
  }
  setPersonalInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingPersonalInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          if (data?.result) {
            this.candidateOnboardingPersonalInfoResult = data?.result;

            if (data?.result?.contactAddresses !== null) {
              for (const contact of data?.result?.contactAddresses) {
                switch (contact?.contactAddressTypeCode) {
                  case ContactAddressType.Email:
                    {
                      this.email[0] = contact?.contactAddress;
                    }
                    break;
                  case ContactAddressType.Mobile:
                    {
                      this.cellPhoneNumber[0] = this.parsePhoneNumberToShow(
                        contact?.contactAddress
                      );
                      // tslint:disable-next-line: no-non-null-assertion
                      this.cellCountry[0] = contact?.countryCode!;
                    }
                    break;

                  case ContactAddressType.HomePhone:
                    {
                      this.homePhoneNumber[0] = this.parsePhoneNumberToShow(
                        contact?.contactAddress
                      );
                      // tslint:disable-next-line: no-non-null-assertion
                      this.homeCountry[0] = contact?.countryCode!;
                    }
                    break;

                  case ContactAddressType.WorkPhone:
                    {
                      this.officePhoneNumber[0] = this.parsePhoneNumberToShow(
                        contact?.contactAddress?.split('|')[0]
                      );
                      this.officeExtension[0] =
                        contact?.contactAddress?.split('|')[1];
                      // tslint:disable-next-line: no-non-null-assertion
                      this.officeCountry[0] = contact?.countryCode!;
                    }
                    break;
                }
              }
            }

            if (
              data?.result?.address?.addressTypeCode === AddressType.Mailing
            ) {
              this.livingAddress = data?.result?.address;
              this.findLivingAddressStateName(this.livingAddress?.stateCode);
              this.findLivingAddressCountryName(
                this.livingAddress?.countryCode
              );
            } else {
              this.livingAddress = null;
            }
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  setStateLookup(): void {
    this.lookupService.getStateCode().subscribe((data) => {
      for (const state of data?.result) {
        this.mapState.set(String(state?.lookupCode), state?.description);
      }
    });
  }
  setIdentificationInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingIdentificationImmigrationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          if (data?.result) {
            this.identificationImmigrationInformationResult = data?.result;
            this.immigrationData =
              this.identificationImmigrationInformationResult?.immigrationData;
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }
  setEducationInfo(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEducationInfoByEmpOnboardingId(
        this.employeeOnboardingId
      )
      .subscribe(
        (data) => {
          if (data?.result) {
            this.educationInformationResult = data?.result;
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setCountryLookup(): void {
    this.lookupService.getCountryCode().subscribe((data) => {
      for (const country of data?.result) {
        this.mapCountry.set(
          country?.lookupCode.toString(),
          country?.description
        );
      }
    });
  }

  setEmergencyContacts(): void {
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEmergencyContacts(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.emergencyContactsResult = data?.result;
            this.emergencyContacts =
              this.emergencyContactsResult?.emergencyContacts;
            if (this.emergencyContactsResult?.emergencyContacts) {
              for (const emergencyContact of this.emergencyContacts) {
                if (emergencyContact?.contactAddresses !== null) {
                  for (const contact of emergencyContact?.contactAddresses) {
                    switch (contact?.contactAddressTypeCode) {
                      case ContactAddressType.Email:
                        {
                          this.email.push(contact?.contactAddress);
                        }
                        break;
                      case ContactAddressType.Mobile:
                        {
                          this.cellPhoneNumber.push(
                            this.parsePhoneNumberToShow(contact?.contactAddress)
                          );
                          // tslint:disable-next-line: no-non-null-assertion
                          this.cellCountry.push(contact?.countryCode!);
                        }
                        break;

                      case ContactAddressType.HomePhone:
                        {
                          this.homePhoneNumber.push(
                            this.parsePhoneNumberToShow(contact?.contactAddress)
                          );
                          // tslint:disable-next-line: no-non-null-assertion
                          this.homeCountry.push(contact?.countryCode!);
                        }
                        break;

                      case ContactAddressType.WorkPhone:
                        {
                          this.officePhoneNumber.push(
                            this.parsePhoneNumberToShow(
                              contact?.contactAddress?.split('|')[0]
                            )
                          );
                          this.officeExtension.push(
                            contact?.contactAddress?.split('|')[1]
                          );
                          // tslint:disable-next-line: no-non-null-assertion
                          this.officeCountry.push(contact?.countryCode!);
                        }
                        break;
                    }
                  }
                }
              }
            }
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setBanksAndPaychecksDetails(): void {
    this.candidateOnboardingWorkflowService
      .getBanksAndPaychecks(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.bankPaycheckInfo = data?.result?.bankInfo;
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  setWorkEligibilityAndI9(): void {
    this.isLoadingI9Form = true;
    this.documentsService.getDocumentFile(this.i9DocId).subscribe(
      (data) => {
        const file = new Blob([data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);

        this.i9DocURL = fileURL;
        this.isLoadingI9Form = false;
      },
      (err) => {
        console.warn(err);
        this.isLoadingI9Form = false;
      }
    );
  }

  parsePhoneNumberToShow(phoneNumber: string): string {
    if (phoneNumber) {
      phoneNumber =
        '(' +
        phoneNumber.substr(0, 3) +
        ')' +
        ' ' +
        phoneNumber.substr(3, 3) +
        '-' +
        phoneNumber.substr(6, 4);
    }
    return phoneNumber;
  }

  findLivingAddressCountryName(countryCode: string): void {
    this.lookupService.getCountryCode().subscribe(
      (data) => {
        for (const country of data?.result) {
          if (country?.lookupCode === Number(countryCode)) {
            this.livingAddrCountryName = country?.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  findLivingAddressStateName(stateCode: string): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          if (state?.lookupCode === Number(stateCode)) {
            this.livingAddrStateName = state?.description;
            break;
          }
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }

  onPrevious(): void {
    this.stepper.selectedIndex = 5;
  }

  previewDocument(doc: DocumentInformation): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      currentDoc: doc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(PreviewDocumentComponent, dialogConfig);
  }

  redirectTo(index: number): void {
    this.stepper.selectedIndex = index;
  }

  parseNumberToString(code: number): string {
    return String(code);
  }

  showTaxForms(i: number): void {
    switch (i) {
      case 0:
        this.taxFormName = 'Federal Tax Withholding';
        this.currentTaxFormIndex = 0;
        break;
      case 1:
        this.taxFormName = 'State Tax Withholding';
        this.currentTaxFormIndex = 1;
        break;
    }
  }

  submitCandidateOnboarding(): void {
    if (this.profilePicStatus) {
      this.matNotificationService.warn(
        ':: You have not uploaded your profile picture.'
      );
    } else {
      const currentStatusType = 'HRVerify';
      const statusList: OnBoardStatus[] = [
        {
          Key: 'EmployeeOnboardingId',
          Value: this.employeeOnboardingId,
        },
        {
          Key: 'Comments',
          Value:
            'You have successfully completed your Candidate Onboarding Form.',
        },
      ];
      this.hrDashboardService
        .saveHROnboardingStatusesByEmployeeOnboardingIdAndStatusType(
          currentStatusType,
          statusList
        )
        .subscribe(
          (res) => {
            if (res?.errorCode === 0) {
              this.candidateSubmit.emit(true);
              this.matNotificationService.success(
                ':: You have successfully completed your Candidate Onboarding Form.'
              );
              this.router.navigate(['/candidate/dashboard']);
            } else {
              this.matNotificationService.warn(
                ':: Error: ' + res?.errorMessage
              );
            }
          },
          (error) => {
            console.log(error);
            this.matNotificationService.showSnackBarMessage(
              'Oops! Request has failed',
              error
            );
          }
        );
    }
  }

  setTaxInformation(): void {
    this.isLoadingTaxForm = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingTaxInformation(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.taxInformationResult = data?.result;
          }
          this.isLoadingTaxForm = false;
        },
        (err) => {
          console.warn(err);
          this.isLoadingTaxForm = false;
        }
      );
  }

  nextStep(): void {
    this.selectedIndex += 1;
  }

  previousStep(): void {
    this.selectedIndex -= 1;

    if (this.selectedIndex === -1) {
      --this.currentTaxFormIndex;
    }
  }
  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.selectedIndex = tabChangeEvent.index;
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }

  refreshDocuments(): void {
    this.refreshDocs = true;
  }
}
