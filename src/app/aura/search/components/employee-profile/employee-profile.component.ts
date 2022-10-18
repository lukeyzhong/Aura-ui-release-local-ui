import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { LookupService } from '../../../../shared/service/lookup/lookup.service';
import { DocumentsService } from 'src/app/shared/service/documents/documents.service';
import { EmployeeProfileApiService } from '../../service/employee/employee-profile-api.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { EmployeeEditProfileComponent } from '../employee-edit-profile/employee-edit-profile.component';
import { SearchSupervisorService } from '../../../../shared/service/search-supervisor/search-supervisor.service';
import {
  EmployeeEditProfilePopupData,
  EmployeeProfileResult,
  EmployeeTerminationDetails,
} from '../../interface/employee-profile/employee-profile-api.interface';

import { ActiveUserInfoService } from '../../../../core/service/active-user-info.service';
import {
  Addresses,
  AddressType,
  ContactAddressType,
  PersonData,
  SecurityClearances,
  SocialMediaLinks,
} from '../../interface/person.interface';
import { UserActivityComponent } from '../generic-components/user-activity/user-activity.component';
import { InitiateSeparationActionComponent } from '../../../../shared/components/initiate-separation-action/initiate-separation-action.component';
import { GlobalVariables } from '../../../../shared/enums/global-variables.enum';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.component.html',
  styleUrls: ['./employee-profile.component.scss'],
})
export class EmployeeProfileComponent implements OnInit {
  id = '';
  employeeProfileResult!: EmployeeProfileResult;
  livingAddress!: Addresses | null;
  workAddress!: Addresses | null;
  personData!: PersonData;
  workAddrStateName = '';
  livingAddrStateName = '';
  isLoading = false;
  isLoadingImage = false;
  profileSrc = '';
  show = false;
  personId = '';
  personName = '';
  employeeId = '';
  mapSuper = new Map<string, string>();
  searchStr = '';
  phoneNumber = new Map<number, string>();
  mobileNO = '';
  email = '';
  contactAddrExt = '';
  securityClearances!: SecurityClearances[];
  socialMediaLinks!: SocialMediaLinks[];
  mapPolygraph = new Map<number, string>();

  constructor(
    private employeeProfileApiService: EmployeeProfileApiService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private lookupService: LookupService,
    private documentsService: DocumentsService,
    private domSanitizer: DomSanitizer,
    private searchSupervisorService: SearchSupervisorService,
    private activeUserInfo: ActiveUserInfoService
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: no-any
    this.activatedRoute.queryParamMap.subscribe((paramMap: any) => {
      const { id, searchText } = paramMap?.params;

      if (id && searchText) {
        this.id = id;
        this.lookupService
          .getSecurityClearancePolygraphTypes()
          .subscribe((data) => {
            for (const polygraph of data?.result) {
              this.mapPolygraph.set(
                polygraph?.lookupCode,
                polygraph?.description
              );
            }
          });

        this.updateEmployeePrimaryAndEmployementDetails();
      }
    });

    this.searchSupervisorService.search(this.searchStr).subscribe((data) => {
      this.mapSuper = data?.result;
    });
  }
  // updateEmployeePrimaryAndEmployementDetails() FUNCTION
  updateEmployeePrimaryAndEmployementDetails(): void {
    this.isLoading = true;
    this.employeeProfileApiService.getEmployeeProfileById(this.id).subscribe(
      (data) => {
        if (data?.result) {
          this.employeeProfileResult = data?.result;
          this.setProfilePhoto(
            this.employeeProfileResult?.employeeProfilePhotoId
          );
          this.employeeId = this.employeeProfileResult?.employeeId;
          this.securityClearances =
            this.employeeProfileResult?.personData?.securityClearances;
          this.socialMediaLinks =
            this.employeeProfileResult?.personData?.socialMediaLinks;

          if (data?.result?.personData !== null) {
            this.personData = data?.result?.personData;
            this.personId = this.personData?.personId;
            this.personName = this.activeUserInfo?.user?.fullName;

            if (data?.result?.personData?.addresses !== null) {
              this.livingAddress = null;
              this.workAddress = null;
              for (const address of data?.result?.personData?.addresses) {
                if (address?.addressTypeCode === AddressType.Mailing) {
                  this.livingAddress = address;
                  this.findLivingAddressStateName(
                    // tslint:disable-next-line: no-non-null-assertion
                    this.livingAddress?.stateCode!
                  );
                }
                if (address?.addressTypeCode === AddressType.WorkLocation) {
                  this.workAddress = address;
                  // tslint:disable-next-line: no-non-null-assertion
                  this.findWorkddressStateName(this.workAddress?.stateCode!);
                }
              }
            } else {
              this.livingAddress = null;
              this.workAddress = null;
            }

            if (data?.result?.personData?.contactAddresses !== null) {
              this.phoneNumber.clear();
              for (const contact of data?.result?.personData
                ?.contactAddresses) {
                if (
                  contact?.contactAddressTypeCode === ContactAddressType.Email
                ) {
                  this.email = contact?.contactAddress;
                } else if (
                  contact?.contactAddressTypeCode ===
                    ContactAddressType.Mobile ||
                  contact?.contactAddressTypeCode ===
                    ContactAddressType.HomePhone
                ) {
                  this.parsePhoneNumber(
                    // tslint:disable-next-line: no-non-null-assertion
                    contact?.countryCode!,
                    contact?.contactAddress,
                    contact?.contactAddressTypeCode
                  );
                } else if (
                  contact?.contactAddressTypeCode ===
                  ContactAddressType.WorkPhone
                ) {
                  this.parsePhoneNumber(
                    // tslint:disable-next-line: no-non-null-assertion
                    contact?.countryCode!,
                    contact?.contactAddress,
                    contact?.contactAddressTypeCode,
                    contact?.contactAddressExt
                  );
                }
              }
            } else {
              this.email = '';
              this.phoneNumber.clear();
            }
          }
        }
        this.isLoading = false;
      },
      (err) => {
        console.warn(err);
        this.isLoading = false;
      }
    );
  }
  setProfilePhoto(photoId: string): void {
    this.isLoadingImage = true;
    if (photoId) {
      this.documentsService.getDocument(photoId).subscribe(
        (data) => {
          this.isLoadingImage = false;
          // 92 means 401 err, 94/93 means no doc
          const errorCodes = [92, 93, 94];
          if (errorCodes.includes(data?.byteLength)) {
            this.profileSrc = GlobalVariables?.DefaultProfilePic;
          } else {
            const file = new Blob([data], { type: 'image/jpeg' });
            const fileURL = URL.createObjectURL(file);
            this.profileSrc = this.domSanitizer.bypassSecurityTrustUrl(
              fileURL
            ) as string;
          }
        },
        (err) => {
          this.isLoadingImage = false;
          console.warn(err);
        }
      );
    } else {
      this.profileSrc = GlobalVariables?.DefaultProfilePic;
      this.isLoadingImage = false;
    }
  }

  parsePhoneNumber(
    countryCode: string | undefined,
    phoneNumber: string,
    contactAddressTypeCode: number,
    contactAddressExt: string = ''
  ): void {
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
            countryCode +
            '(' +
            phoneNumber.substr(0, 3) +
            ') ' +
            phoneNumber.substr(3, 3) +
            '-' +
            phoneNumber.substr(6, 4);
        }
      }
    }

    switch (contactAddressTypeCode) {
      case ContactAddressType.Mobile:
        this.mobileNO = parsedPhoneNumber;
        break;
      case ContactAddressType.HomePhone:
        this.phoneNumber.set(contactAddressTypeCode, parsedPhoneNumber);
        break;
      case ContactAddressType.WorkPhone:
        this.contactAddrExt = contactAddressExt;
        this.phoneNumber.set(contactAddressTypeCode, parsedPhoneNumber);
        break;
    }
  }

  getBenefits(): string {
    let benefits = '';
    switch (this.employeeProfileResult?.withBenefits) {
      case true:
        benefits = 'True';
        break;
      case false:
        benefits = 'False';
        break;
    }
    return benefits;
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
        console.log(err);
      }
    );
  }
  findWorkddressStateName(stateCode: string): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          if (state?.lookupCode === Number(stateCode)) {
            this.workAddrStateName = state?.description;
            break;
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  showSSN(ssn: string): void {}

  zoomIn(): void {
    this.show = true;
  }
  zoomOut(): void {
    this.show = false;
  }

  editProfile(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: EmployeeEditProfilePopupData = {
      action: actionType,
      profileData: this.employeeProfileResult,
      profileSrc: this.profileSrc,
      mapSuper: this.mapSuper,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      EmployeeEditProfileComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.updateEmployeePrimaryAndEmployementDetails();
      }
    });
  }

  openUserActivity(): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      id: this.id,
      pageName: 'Employee',
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.width = '900px';
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(UserActivityComponent, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success') {
        this.updateEmployeePrimaryAndEmployementDetails();
      }
    });
  }

  getSecurityClearancePolyGraphTypes(polygrahTypes: string): string {
    const polyTypes = JSON.parse(
      polygrahTypes
        ?.split(':')[1]
        .substr(0, polygrahTypes?.split(':')[1].length - 1)
    );

    let securityClearancePolyTypes = '';
    for (const polyCode of polyTypes) {
      securityClearancePolyTypes +=
        this.mapPolygraph?.get(Number(polyCode)) + ', ';
    }
    return securityClearancePolyTypes.substr(
      0,
      securityClearancePolyTypes?.length - 2
    );
  }

  initiateSeparation(): void {
    const dialogConfig = new MatDialogConfig();

    const empDetails: EmployeeTerminationDetails = {
      employeeId: this.employeeProfileResult?.employeeId,
      employeeCode: this.employeeProfileResult?.employeeCode,
      firstName: this.employeeProfileResult?.personData?.firstName,
      lastName: this.employeeProfileResult?.personData?.lastName,
    };
    const obj = {
      empDetails,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      InitiateSeparationActionComponent,
      dialogConfig
    );
  }
}
