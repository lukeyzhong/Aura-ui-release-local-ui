import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CandidateEditProfilePopupData,
  CandidateProfileResult,
} from '../../interface/candidate-profile/candidate-profile-api.interface';

import { CandidateProfileApiService } from '../../service/candidate/candidate-profile-api.service';
import { LookupService } from '../../../../shared/service/lookup/lookup.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DocumentsService } from '../../../../shared/service/documents/documents.service';
import {
  MatDialog,
  MatDialogRef,
  MatDialogConfig,
} from '@angular/material/dialog';
import { CandidateEditProfileComponent } from '../candidate-edit-profile/candidate-edit-profile.component';
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
import { GlobalVariables } from '../../../../shared/enums/global-variables.enum';

@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.scss'],
})
export class CandidateProfileComponent implements OnInit {
  id = '';
  candidateProfileResult!: CandidateProfileResult;
  livingAddress!: Addresses | null;
  personData!: PersonData;
  livingAddrStateName = '';
  isLoading = false;
  isLoadingImage = false;
  profileSrc = '';
  show = false;
  personId = '';
  personName = '';
  candidateId = '';
  resumeDocumentId = '';
  displayName = '';
  phoneNumber = new Map<number, string>();
  mobileNO = '';
  email = '';
  contactAddrExt = '';
  workExperience = '';
  securityClearances!: SecurityClearances[];
  socialMediaLinks!: SocialMediaLinks[];
  mapPolygraph = new Map<number, string>();

  constructor(
    private candidateProfileApiService: CandidateProfileApiService,
    private activatedRoute: ActivatedRoute,
    private lookupService: LookupService,
    private documentsService: DocumentsService,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    // tslint:disable-next-line: no-any
    private dialogRef: MatDialogRef<any>,
    private activeUserInfo: ActiveUserInfoService
  ) {}

  ngOnInit(): void {
    // tslint:disable-next-line: no-any
    this.activatedRoute.queryParamMap.subscribe((paramMap: any) => {
      const { id, searchText } = paramMap.params;

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

        this.updateCandidatePrimaryAndCandidateProfileDetails();
      }
    });
  }
  // updateCandidatePrimaryAndCandidateProfileDetails() FUNCTION
  updateCandidatePrimaryAndCandidateProfileDetails(): void {
    this.isLoading = true;
    this.candidateProfileApiService.getCandidateProfileById(this.id).subscribe(
      (data) => {
        if (data?.result) {
          this.candidateProfileResult = data?.result;
          this.setProfilePhoto(
            this.candidateProfileResult?.candidateProfilePhotoId
          );
          this.candidateId = this.candidateProfileResult?.candidateId;
          this.securityClearances =
            this.candidateProfileResult?.personData?.securityClearances;
          this.socialMediaLinks =
            this.candidateProfileResult?.personData?.socialMediaLinks;

          this.resumeDocumentId =
            // tslint:disable-next-line: no-non-null-assertion
            this.candidateProfileResult?.resumeDocument?.documentId!;
          this.displayName =
            this.candidateProfileResult?.resumeDocument?.displayName;
          if (data?.result?.personData !== null) {
            this.personData = data?.result?.personData;
            this.personId = this.personData?.personId;
            this.personName = this.activeUserInfo?.user?.fullName;

            if (data?.result?.personData?.addresses !== null) {
              for (const address of data?.result?.personData?.addresses) {
                if (address?.addressTypeCode === AddressType.Mailing) {
                  this.livingAddress = address;
                  this.findLivingAddressStateName(
                    this.livingAddress?.stateCode
                  );
                }
              }
            } else {
              this.livingAddress = null;
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

            this.parseWorkExperience(data?.result?.workExperience);
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
  parseWorkExperience(workExp: number): void {
    const years = Math.floor(workExp / 12);
    const months = workExp - years * 12;
    const monthsText = months === 1 ? ' Month' : ' Months';
    const yearsText = years === 1 ? ' Year' : ' Years';
    this.workExperience = years + yearsText + ' and ' + months + monthsText;
  }
  findLivingAddressStateName(stateCode: string): void {
    this.lookupService.getStateCode().subscribe(
      (data) => {
        for (const state of data?.result) {
          // tslint:disable-next-line: radix
          if (state?.lookupCode === parseInt(stateCode)) {
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

  showSSN(ssn: string): void {}
  zoomIn(): void {
    this.show = true;
  }
  zoomOut(): void {
    this.show = false;
  }

  editProfile(actionType: string): void {
    const dialogConfig = new MatDialogConfig();
    const obj: CandidateEditProfilePopupData = {
      action: actionType,
      profileData: this.candidateProfileResult,
      profileSrc: this.profileSrc,
    };
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = false;
    dialogConfig.data = {
      obj,
    };
    this.dialogRef = this.dialog.open(
      CandidateEditProfileComponent,
      dialogConfig
    );
    this.dialogRef.afterClosed().subscribe((result: string) => {
      if (result === 'success' || result === 'cancel') {
        this.updateCandidatePrimaryAndCandidateProfileDetails();
      }
    });
  }

  openUserActivity(): void {
    const dialogConfig = new MatDialogConfig();
    const obj = {
      id: this.id,
      pageName: 'Candidate',
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
        this.updateCandidatePrimaryAndCandidateProfileDetails();
      }
    });
  }

  getSecurityClearancePolyGraphTypes(polygrahTypes: string): string {
    const polyTypes = JSON.parse(
      polygrahTypes
        .split(':')[1]
        .substr(0, polygrahTypes?.split(':')[1].length - 1)
    );

    let securityClearancePolyTypes = '';
    for (const polyCode of polyTypes) {
      securityClearancePolyTypes +=
        this.mapPolygraph?.get(Number(polyCode)) + ', ';
    }
    return securityClearancePolyTypes.substr(
      0,
      securityClearancePolyTypes.length - 2
    );
  }
}
