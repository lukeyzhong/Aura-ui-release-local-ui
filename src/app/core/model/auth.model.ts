export class User {
  emailAddress: string;
  fullName: string;
  avatarUrl: string;
  // tslint:disable-next-line: no-any
  features: any;
  userId: string;
  userName: string;
  rolecode: string;

  constructor({
    userId,
    userName,
    fullName,
    emailAddress,
    avatarUrl,
    rolecode,
    features,
  }: User) {
    this.userId = userId;
    this.userName = userName;
    this.fullName = fullName;
    this.emailAddress = emailAddress;
    this.avatarUrl = avatarUrl;
    this.rolecode = rolecode;
    this.features = features;
  }
}
