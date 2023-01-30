export type UserAttributes = {
  email: string
  phone_number: string
  sub: string
}

export type UserGroup = {
  GroupName: string
  Description: string
  UserPoolId: string
  Precedence: number
  CreationDate: Date
  LastModifiedDate: Date
}

export enum UserStatus {
  Confirmed = 'CONFIRMED',
  Unconfirmed = 'UNCONFIRMED',
  ExternalProvider = 'EXTERNAL_PROVIDER',
  Archived = 'ARCHIVED',
  Unknown = 'UNKNOWN',
  ResetRequired = 'RESET_REQUIRED',
  ForceChangePassword = 'FORCE_CHANGE_PASSWORD',
}

export type User = {
  Attributes: UserAttributes
  Groups: UserGroup[]
  Username: string
  UserStatus: UserStatus
  Enabled: boolean
  UserCreateDate: Date
  UserLastModifiedDate: Date
}
