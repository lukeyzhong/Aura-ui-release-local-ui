import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  Addresses,
  AddressType,
  ContactAddressType,
  PersonData,
  SocialMediaLinks,
} from '../../../aura/search/interface/person.interface';
import { DashboardProfileInfoResult } from '../../interface/generic-dashboard.interface';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
})
export class BasicInfoComponent implements OnInit, OnChanges {
  @Input() profileInfoResult!: DashboardProfileInfoResult;
  @Input() infoType = '';
  profileInfo!: DashboardProfileInfoResult;
  infoTypes = ['Employee'];
  email!: string;
  cellPhoneNumber!: string;
  livingAddress!: Addresses | null;
  livingAddrStateName = '';
  livingAddrCountryName = '';
  profilePic!: string;
  personData!: PersonData;
  onProject = false;
  socialMediaLinks!: SocialMediaLinks[];
  isLoading = false;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isLoading = true;
    if (
      changes?.profileInfoResult &&
      changes?.profileInfoResult?.currentValue
    ) {
      this.profileInfo = changes?.profileInfoResult?.currentValue;
      this.onProject = this.profileInfo?.onProject ? true : false;
      this.personData = this.profileInfo?.personData;
      this.socialMediaLinks = this.personData?.socialMediaLinks;
      this.setBasicInfo();
    }
    this.isLoading = false;
  }

  ngOnInit(): void {}

  setBasicInfo(): void {
    if (
      this.profileInfo?.profilePhoto &&
      this.profileInfo?.profilePhoto?.documentBytes
    ) {
      this.profilePic =
        'data:image/png;base64,' +
        this.profileInfo?.profilePhoto?.documentBytes;
    } else {
      this.profilePic = './assets/svg/candidate-dashboard/camera.svg';
    }
    if (
      this.profileInfo?.personData?.contactAddresses !== null &&
      this.profileInfo?.personData?.contactAddresses !== undefined
    ) {
      for (const contact of this.profileInfo?.personData?.contactAddresses) {
        switch (contact?.contactAddressTypeCode) {
          case ContactAddressType.Email:
            {
              this.email = contact?.contactAddress;
            }
            break;

          case ContactAddressType.Mobile:
            {
              this.cellPhoneNumber = this.parsePhoneNumber(
                contact?.countryCode,
                contact?.contactAddress
              );
            }
            break;
        }
      }
    }

    if (
      this.profileInfo?.personData?.addresses !== null &&
      this.profileInfo?.personData?.addresses !== undefined
    ) {
      for (const address of this.profileInfo?.personData?.addresses) {
        switch (address?.addressTypeCode) {
          case AddressType.Mailing:
            {
              this.livingAddress = address;
            }
            break;
        }
      }
    }
    this.isLoading = false;
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
}
