import { IDBEntity } from "./IDBEntity";

// [UserProfileInternalId] INT PRIMARY KEY IDENTITY (1, 1),

// [UserAadId] NVARCHAR (50) NOT NULL,
// [DisplayName] NVARCHAR (50) NOT NULL,
// [GivenName] NVARCHAR (50) NOT NULL,
// [SurName] NVARCHAR (50) NOT NULL,
// [PreferredPronoun] NVARCHAR (50) NULL,
// [UserPrincipalName] NVARCHAR (255) NOT NULL,
// [MailNickname] NVARCHAR (255) NOT NULL,
// [Mail]  NVARCHAR (255) NULL,
// [OfficePhone] NVARCHAR (50) NULL,
// [MobilePhone] NVARCHAR (50) NULL,
// [JobTitle] NVARCHAR (50) NULL,
// [DepartmentName] NVARCHAR (50) NULL,
// [OfficeLocation] NVARCHAR (50) NULL,
// [OutOfOffice] BIT NULL DEFAULT 0
// [WelcomeTourCompleted] BIT NULL DEFAULT 0
// [Published] BIT NULL DEFAULT 0

export interface IDBUserProfileInternal extends IDBEntity {
    UserAadId: string;
    DisplayName: string;
    GivenName: string;
    SurName: string;
    PreferredPronoun: string;
    UserPrincipalName: string;
    MailNickname: string;
    Mail: string;
    OfficePhone: string;
    MobilePhone: string;
    JobTitle: string;
    DepartmentName: string;
    OfficeLocation: string;
    OutOfOffice: boolean;
    WelcomeTourCompleted?: boolean;
    Published?: boolean;
}
