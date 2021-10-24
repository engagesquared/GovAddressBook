
import { IDBEntity } from "./IDBEntity";
// [CustomFieldId] INT PRIMARY KEY IDENTITY (1, 1),

// [Code]  NVARCHAR (50) NOT NULL,
// [DisplayName] NVARCHAR (50) NOT NULL,
// [Value]  NVARCHAR (255) NOT NULL,
// [Visibility]  BIT NULL DEFAULT 0,
// [UserProfileInternalId]  INT NULL

export interface IDBCustomField extends IDBEntity {
    Code: string;
    DisplayName: string;
    Value: string;
    Visibility: boolean;

    // lookup
    UserProfileInternalId: number;
}