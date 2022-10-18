// PersonData interface
export interface PersonData {
  personId: string;
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  genderCode: number;
  gender: string;
  highestDegree: string;
  namePrefix: string;
  nameSuffix: string;
  dateOfBirth: string;
  title: string;
  preferredContactMethodCode: string;
  ethnicityCode: string;
  maidenName: string;
  inActiveDate: string;
  socialSecurityNumber: string;
  alias: string;
  maritalStatusCode: number;
  maritalStatus: string;
  contactAddresses: ContactAddresses[];
  addresses: Addresses[];
  securityClearances: SecurityClearances[];
  socialMediaLinks: SocialMediaLinks[];
}

// ContactAddresses interface
export interface ContactAddresses {
  contactAddressId: string;
  contactAddressTypeCode: number;
  entityTypeCode: number;
  contactAddress: string;
  contactAddressExt?: string;
  countryCode?: string;
  contactAddressPurposeCode: number;
  entityId: string;
  contactAddressType?: ContactAddressType;
  entityType?: string;
  contactAddressPurpose?: string;
}

// Addresses interface
export interface Addresses {
  addressId: string;
  addressTypeCode: number;
  addressPurposeCode: number;
  entityId: string;
  entityTypeCode: number;
  addressLine1: string;
  addressLine2: string;
  addressLine3?: string;
  unitOrApartmentNumber?: string;
  city: string;
  stateCode: string;
  state?: string;
  postalCode: number;
  countryCode: string;
  country?: string;
  longitude?: number;
  latitude?: number;
  urL1?: string;
  urL2?: string;
  addressType?: AddressType;
  addressPurpose?: string;
  entityType?: string;
}

export enum AddressType {
  Physical = 1,
  International = 2,
  Mailing = 3,
  WorkLocation = 4,
}
export enum ContactAddressType {
  Email = 1,
  Mobile = 2,
  HomePhone = 3,
  Fax = 4,
  PostalAddress = 5,
  Twitter = 6,
  LinkedIn = 7,
  Facebook = 8,
  WorkPhone = 9,
}

export interface SecurityClearances {
  securityClearanceId: string;
  personId: string;
  securityClearanceLevelCode: number;
  polygraphType: string;
  clearanceDate: string;
  expiryDate: string;
  creatorId: string;
  createdDateTime: string;
  lastUpdateId: string;
  lastUpdateDateTime: string;
  inActiveDate: string;
  securityClearanceLevel: string;
}
export interface SocialMediaLinks {
  socialMediaLinkId?: string;
  personId: string;
  socialMediaLinkCode: number;
  url: string;
  creatorId?: string;
  createdDateTime?: string;
  lastUpdateId?: string;
  lastUpdateDateTime?: string;
  inActiveDate?: string;
  socialMediaLink?: string;
}
