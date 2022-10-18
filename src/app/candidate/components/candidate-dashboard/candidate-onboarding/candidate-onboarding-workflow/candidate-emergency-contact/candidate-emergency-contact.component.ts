import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import {
  CandidateOnboardingEmergencyContactsResult,
  EmergencyContacts,
} from '../../../../../../shared/interface/candidate-onboarding-workflow.interface';
import { ContactAddresses } from '../../../../../../aura/search/interface/person.interface';
import { ConfirmationDialogComponent } from '../../../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LookupService } from '../../../../../../shared/service/lookup/lookup.service';
import { MatNotificationService } from '../../../../../../shared/service/mat-notification.service';
import { CandidateOnboardingWorkflowService } from '../../../../../../shared/service/candidate-workflow/candidate-onboarding-workflow.service';
import { Router } from '@angular/router';
import { GlobalVariables } from '../../../../../../shared/enums/global-variables.enum';

@Component({
  selector: 'app-candidate-emergency-contact',
  templateUrl: './candidate-emergency-contact.component.html',
  styleUrls: ['./candidate-emergency-contact.component.scss'],
})
export class CandidateEmergencyContactComponent implements OnInit {
  dialogConfirmRef!: MatDialogRef<ConfirmationDialogComponent>;
  @Input() employeeOnboardingId = '';
  emergencyContactsResult!: CandidateOnboardingEmergencyContactsResult;
  emergencyContacts!: EmergencyContacts[];

  @Input() stepper!: MatStepper;

  personId = GlobalVariables.DefaultGUID;
  errorMsg = '';
  isPrimaryStatus = [true, false];
  mapRelationTypes = new Map<number, string>();
  mapCountry = new Map<number, string>();
  mapState = new Map<number, string>();
  emergencyContactForm!: FormGroup;
  // tslint:disable-next-line: no-any
  hrComments: any[] = [];
  hrCommentsMap = new Map<string, string>();

  commentValue!: string;
  countKeysContactsInfo!: number;
  keysSectionWise: string[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private lookupService: LookupService,
    private matNotificationService: MatNotificationService,
    private candidateOnboardingWorkflowService: CandidateOnboardingWorkflowService,
    private dialogConfirm: MatDialog
  ) {}

  ngOnInit(): void {
    this.setRelationshipTypes();
    this.setCountry();
    this.setState();

    this.emergencyContactForm = this.fb.group({
      employeeOnboardingId: [''],
      emergencyContactsDetails: this.fb.array([
        this.emergencyContactsFormGroup(),
      ]),
    });

    this.setEmergencyContactsInfo();
  }
  get emergencyContactsDetails(): FormArray {
    return this.emergencyContactForm?.get(
      'emergencyContactsDetails'
    ) as FormArray;
  }
  setCountry(): void {
    this.lookupService.getCountryCode().subscribe(
      (data) => {
        for (const country of data?.result) {
          this.mapCountry.set(country?.lookupCode, country?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  setState(): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          this.mapState.set(state?.lookupCode, state?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  getCountryCode(contactAddressTypeCode: number, index: number): string {
    let countryCode = '';
    if (this.emergencyContacts !== null) {
      if (this.emergencyContacts[index]?.contactAddresses !== null) {
        for (const eC of this.emergencyContacts[index]?.contactAddresses) {
          if (eC?.contactAddressTypeCode === contactAddressTypeCode) {
            // tslint:disable-next-line: no-non-null-assertion
            countryCode = eC?.countryCode!;
          }
        }
      }
    }

    return countryCode;
  }
  getContactAddress(contactAddressTypeCode: number, index: number): string {
    let contactAddress = '';

    if (this.emergencyContacts[index]?.contactAddresses !== null) {
      for (const eC of this.emergencyContacts[index]?.contactAddresses) {
        if (eC?.contactAddressTypeCode === contactAddressTypeCode) {
          // tslint:disable-next-line: no-non-null-assertion
          contactAddress = eC?.contactAddress!;
          break;
        }
      }
    }

    return contactAddress;
  }
  emergencyContactsFormGroup(): FormGroup {
    return this.fb.group({
      firstName: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      lastName: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      relationShipType: ['', [Validators.required]],

      addressLine1: ['', [Validators.maxLength(200)]],
      addressLine2: ['', [Validators.maxLength(200)]],
      country: [''],
      city: ['', [Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')]],
      state: [''],
      postalCode: ['', [Validators.pattern('[0-9]{5}')]],

      cellCountryCode: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
      ],
      cellContactAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      cellContactAddressTypeCode: [''],

      homeCountryCode: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      homeContactAddress: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      homeContactAddressTypeCode: [''],

      officeCountryCode: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      officeContactAddress: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      officeExt: ['', [Validators.pattern('^[0-9]{1,4}')]],
      officeContactAddressTypeCode: [''],

      emailContactAddress: ['', Validators.email],
      emailContactAddressTypeCode: [''],
    });
  }
  addEmergencyContacts(): FormGroup {
    return this.fb.group({
      firstName: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      lastName: [
        '',
        [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
      ],
      relationShipType: ['', [Validators.required]],

      addressLine1: ['', [Validators.maxLength(200)]],
      addressLine2: ['', [Validators.maxLength(200)]],
      country: [''],
      city: ['', [Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')]],
      state: [''],
      postalCode: ['', [Validators.pattern('[0-9]{5}')]],

      cellCountryCode: [
        '',
        [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
      ],
      cellContactAddress: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      cellContactAddressTypeCode: [''],

      homeCountryCode: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      homeContactAddress: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      homeContactAddressTypeCode: [''],

      officeCountryCode: ['', [Validators.pattern(/^[1-9]\d*$/)]],
      officeContactAddress: [
        '',
        [
          Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
          Validators.minLength(14),
        ],
      ],
      officeExt: ['', [Validators.pattern('^[0-9]{1,4}')]],
      officeContactAddressTypeCode: [''],

      emailContactAddress: ['', Validators.email],
      emailContactAddressTypeCode: [''],
    });
  }
  setRelationshipTypes(): void {
    this.lookupService.getRelationshipTypes().subscribe(
      (data) => {
        for (const rtype of data?.result) {
          this.mapRelationTypes.set(rtype?.lookupCode, rtype?.description);
        }
      },
      (err) => {
        console.warn(err);
      }
    );
  }
  setEmergencyContactsInfo(): void {
    this.isLoading = true;
    this.candidateOnboardingWorkflowService
      .getCandidateOnboardingEmergencyContacts(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result) {
            this.isLoading = false;
            this.emergencyContactsResult = data?.result;
            if (this.emergencyContactsResult?.emergencyContacts) {
              this.emergencyContacts =
                this.emergencyContactsResult?.emergencyContacts;
              this.getComments();
            } else {
              this.emergencyContacts = Object.assign(
                [],
                this.emergencyContacts
              );
              this.emergencyContactsResult.emergencyContacts = Object.assign(
                [],
                this.emergencyContacts
              );
            }
            this.setEmergencyContacts();
          }
        },
        (err) => {
          console.warn(err);
          this.isLoading = false;
        }
      );
  }
  setEmergencyContacts(): void {
    if (this.emergencyContacts) {
      this.emergencyContactForm.setControl(
        'emergencyContactsDetails',
        this.setEmergencyContactDetails(this.emergencyContacts)
      );
    }

    if (this.emergencyContacts?.length === 0) {
      this.emergencyContacts.length = this.emergencyContacts?.length + 2;
      this.emergencyContactsDetails.push(this.addEmergencyContacts());
      this.emergencyContactsDetails.push(this.addEmergencyContacts());
    } else if (this.emergencyContacts?.length === 1) {
      this.emergencyContacts.length = this.emergencyContacts?.length + 1;
      this.emergencyContactsDetails.push(this.addEmergencyContacts());
    }
  }
  setEmergencyContactDetails(
    emergencyContacts: EmergencyContacts[]
  ): FormArray {
    const formArray = new FormArray([]);
    emergencyContacts?.forEach((emContact, index) => {
      formArray.push(
        this.fb.group({
          firstName: [
            emContact?.firstName.trim(),
            [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
          ],
          lastName: [
            emContact?.lastName.trim(),
            [Validators.required, Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
          ],
          relationShipType: [
            emContact?.relationShipTypeCode,
            [Validators.required],
          ],

          addressLine1: [
            emContact?.address?.addressLine1,
            [Validators.maxLength(200)],
          ],
          addressLine2: [
            emContact?.address?.addressLine2,
            [Validators.maxLength(200)],
          ],
          country: [
            emContact?.address?.countryCode
              ? Number(emContact?.address?.countryCode)
              : emContact?.address?.countryCode,
          ],
          city: [
            emContact?.address?.city,
            [Validators.pattern('^[A-Za-z]+[A-Za-z ]*$')],
          ],
          state: [
            emContact?.address?.stateCode
              ? Number(emContact?.address?.stateCode)
              : emContact?.address?.stateCode,
          ],
          postalCode: [
            emContact?.address?.postalCode,
            [Validators.pattern('[0-9]{5}')],
          ],

          homeCountryCode: [
            this.getCountryCode(3, index) === ''
              ? ''
              : this.getCountryCode(3, index),
            [Validators.pattern(/^[1-9]\d*$/)],
          ],
          homeContactAddress: [
            this.parsePhoneNumberToShow(this.getContactAddress(3, index)),
            [
              Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
              Validators.minLength(14),
            ],
          ],
          homeContactAddressTypeCode: [3],

          cellCountryCode: [
            this.getCountryCode(2, index) === ''
              ? ''
              : this.getCountryCode(2, index),
            [Validators.required, Validators.pattern(/^[1-9]\d*$/)],
          ],
          cellContactAddress: [
            this.parsePhoneNumberToShow(this.getContactAddress(2, index)),
            [
              Validators.required,
              Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
              Validators.minLength(14),
            ],
          ],
          cellContactAddressTypeCode: [2],

          officeCountryCode: [
            this.getCountryCode(9, index) === ''
              ? ''
              : this.getCountryCode(9, index),
            [Validators.pattern(/^[1-9]\d*$/)],
          ],

          officeContactAddress: [
            this.parsePhoneNumberToShow(
              this.getContactAddress(9, index).split('|')[0]
            ),
            [
              Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
              Validators.minLength(14),
            ],
          ],
          officeExt: [
            this.getContactAddress(9, index).split('|')[1],
            Validators.pattern('^[0-9]{1,4}'),
          ],
          officeContactAddressTypeCode: [9],

          emailContactAddress: [
            this.getContactAddress(1, index),
            Validators.email,
          ],
          emailContactAddressTypeCode: [1],
        })
      );
    });
    return formArray;
  }

  parsePhoneNumber(
    countryCode: string | undefined,
    phoneNumber: string
  ): string {
    let parsedPhoneNumber = '';
    if (phoneNumber) {
      if (phoneNumber === null) {
        parsedPhoneNumber = '-';
      } else {
        if (countryCode === null) {
          parsedPhoneNumber =
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        } else {
          parsedPhoneNumber =
            '+' +
            countryCode +
            ' (' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        }
      }
    }
    return parsedPhoneNumber;
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
  parsePhoneNumberToSave(phoneNumber: string): string {
    if (phoneNumber) {
      phoneNumber =
        phoneNumber.substr(1, 3) +
        phoneNumber.substr(6, 3) +
        phoneNumber.substr(10, 4);
    }
    return phoneNumber;
  }

  saveEmergencyContactsAndContinue(emergencyContactForm: FormGroup): void {
    if (emergencyContactForm.dirty && emergencyContactForm.valid) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Do you want to save the changes made?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onSaveEmergencyContactsInfo();
          emergencyContactForm.markAsPristine();
          this.stepper.next();
        }
      });
    } else if (emergencyContactForm.valid) {
      emergencyContactForm.markAsPristine();
      this.matNotificationService.success(':: No changes made.');
      this.stepper.next();
    }
  }

  addContactAddess(i: number): ContactAddresses[] {
    const contactAddresses: ContactAddresses[] = [];

    if (
      this.emergencyContactsDetails?.controls[i]?.get('cellContactAddress')
        ?.value !== ''
    ) {
      contactAddresses?.push({
        countryCode:
          this.emergencyContactsDetails?.controls[i]?.get('cellCountryCode')
            ?.value,
        contactAddress: this.parsePhoneNumberToSave(
          this.emergencyContactsDetails?.controls[i]?.get('cellContactAddress')
            ?.value
        ),
        contactAddressId: GlobalVariables.DefaultGUID,
        contactAddressTypeCode: 2,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    if (
      this.emergencyContactsDetails?.controls[i]?.get('homeContactAddress')
        ?.value !== ''
    ) {
      contactAddresses?.push({
        countryCode:
          this.emergencyContactsDetails?.controls[i]?.get('homeCountryCode')
            ?.value,
        contactAddress: this.parsePhoneNumberToSave(
          this.emergencyContactsDetails?.controls[i]?.get('homeContactAddress')
            ?.value
        ),
        contactAddressId: GlobalVariables.DefaultGUID,
        contactAddressTypeCode: 3,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    if (
      this.emergencyContactsDetails?.controls[i]?.get('officeContactAddress')
        ?.value !== ''
    ) {
      contactAddresses?.push({
        countryCode:
          this.emergencyContactsDetails?.controls[i]?.get('officeCountryCode')
            ?.value,
        contactAddress:
          this.parsePhoneNumberToSave(
            this.emergencyContactsDetails?.controls[i]?.get(
              'officeContactAddress'
            )?.value
          ) +
          '|' +
          this.emergencyContactsDetails?.controls[i]?.get('officeExt')?.value,
        contactAddressId: GlobalVariables.DefaultGUID,
        contactAddressTypeCode: 9,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    if (
      this.emergencyContactsDetails?.controls[i]?.get('emailContactAddress')
        ?.value !== ''
    ) {
      contactAddresses?.push({
        contactAddress: this.emergencyContactsDetails?.controls[i]?.get(
          'emailContactAddress'
        )?.value,
        contactAddressId: GlobalVariables.DefaultGUID,
        contactAddressTypeCode: 1,
        entityTypeCode: 1,
        contactAddressPurposeCode: 1,
        entityId: this.personId,
      });
    }

    return contactAddresses;
  }
  onSaveEmergencyContactsInfo(): void {
    const emContacts: EmergencyContacts[] = [];
    let emContact: EmergencyContacts;
    let addressId: string = GlobalVariables.DefaultGUID;
    for (let i = 0; i < this.emergencyContactsDetails?.controls?.length; i++) {
      if (
        this.emergencyContactsResult !== null &&
        this.emergencyContactsResult?.emergencyContacts[i]?.address?.addressId
      ) {
        addressId =
          this.emergencyContactsResult?.emergencyContacts[i]?.address
            ?.addressId;
      }
      emContact = {
        firstName: this.emergencyContactsDetails?.controls[i]
          ?.get('firstName')
          ?.value.trim(),
        lastName: this.emergencyContactsDetails?.controls[i]
          ?.get('lastName')
          ?.value.trim(),
        relationShipTypeCode:
          this.emergencyContactsDetails?.controls[i]?.get('relationShipType')
            ?.value,
        isPrimary: this.isPrimaryStatus[i],
        address: {
          addressLine1:
            this.emergencyContactsDetails?.controls[i]?.get('addressLine1')
              ?.value,
          addressLine2:
            this.emergencyContactsDetails?.controls[i]?.get('addressLine2')
              ?.value,
          countryCode: String(
            this.emergencyContactsDetails?.controls[i]?.get('country')?.value
          ),
          stateCode: String(
            this.emergencyContactsDetails?.controls[i]?.get('state')?.value
          ),
          city: this.emergencyContactsDetails?.controls[i]?.get('city')?.value,
          postalCode:
            this.emergencyContactsDetails?.controls[i]?.get('postalCode')
              ?.value,
          addressId,
          addressTypeCode: 3,
          addressPurposeCode: 1,
          entityTypeCode: 1,
          entityId: this.emergencyContactsResult?.emergencyContacts[i]?.address
            ?.entityId
            ? this.emergencyContactsResult?.emergencyContacts[i]?.address
                ?.entityId
            : this.personId,
        },
        contactAddresses: this.addContactAddess(i),
      };

      emContacts.push(emContact);
    }

    this.emergencyContactsResult.emergencyContacts = emContacts;

    this.candidateOnboardingWorkflowService
      .saveCandidateOnboardingEmergencyContacts(this.emergencyContactsResult)
      .subscribe(
        (data) => {
          this.matNotificationService.success(
            ':: Emergency Contacts details updated successfully'
          );
          this.emergencyContactForm.markAsPristine();
          this.setEmergencyContactsInfo();
        },
        (error) => {
          this.errorMsg =
            '*There is problem with the service. Please try again later';
          this.matNotificationService.warn(':: Unable to update successfully');
          console.warn(error);
        }
      );
  }

  onRestoreEmergencyContactsInfo(
    e: Event,
    emergencyContactForm: FormGroup
  ): void {
    if (emergencyContactForm.dirty && emergencyContactForm.valid) {
      this.dialogConfirmRef = this.dialogConfirm.open(
        ConfirmationDialogComponent,
        {
          disableClose: false,
        }
      );

      this.dialogConfirmRef.componentInstance.confirmMessage =
        'Are you sure, you want to discard the changes?';
      this.dialogConfirmRef.afterClosed().subscribe((result) => {
        if (result) {
          this.setEmergencyContactsInfo();
          emergencyContactForm.markAsPristine();
        }
      });
      e.preventDefault();
    } else {
      this.setEmergencyContactsInfo();
    }
  }

  onPrevious(): void {
    this.stepper.selectedIndex = 0;
  }

  getComments(): void {
    this.candidateOnboardingWorkflowService
      .getHRValidationCommentsByEmpOnboardingId(this.employeeOnboardingId)
      .subscribe(
        (data) => {
          if (data?.result && data?.result !== '{}') {
            this.hrComments = JSON.parse(data?.result);
            this.hrCommentsMap = new Map(Object?.entries(this.hrComments));
            // get the comment for specific section : start
            this.keysSectionWise = [];
            if (this.hrComments) {
              for (const key of Object.keys(this.hrComments)) {
                if (key.toString().includes('emergencyContacts')) {
                  this.keysSectionWise.push(key);
                }
              }
            }
            this.countKeysContactsInfo = this.keysSectionWise.length;
            // get the comment for specific section : end
          }
        },
        (err) => {
          console.warn(err);
        }
      );
  }

  showHRComment(key: string): void {
    Object?.entries(this.hrComments)?.forEach((comments) => {
      if (comments[0] === key) {
        this.commentValue = comments[1];
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/candidate/dashboard']);
  }
}
