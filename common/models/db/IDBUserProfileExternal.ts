import { IDBEntity } from "./IDBEntity";
// [UserProfileExternalId] INT PRIMARY KEY IDENTITY (1, 1),

// [UserAadId] NVARCHAR (50) NOT NULL,
// [UserPrincipalName] NVARCHAR (255) NOT NULL,
// [DisplayName] NVARCHAR (50) NOT NULL,
// [GivenName]  NVARCHAR (50) NOT NULL,
// [SurName] NVARCHAR (50) NOT NULL,
// [JobTitle] NVARCHAR (50) NULL,
// [PartnerOutgoingConnectionId] INT NOT NULL,

export interface IDBUserProfileExternal extends IDBEntity {
    UserAadId: string;
    UserPrincipalName: string;
    DisplayName: string;
    GivenName: string;
    SurName: string;
    JobTitle: string;
    
    // lookup
    PartnerOutgoingConnectionId: number;
}
