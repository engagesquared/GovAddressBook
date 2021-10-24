import { IDBEntity } from "./IDBEntity";
// [PartnerIncomingConnectionId] INT PRIMARY KEY IDENTITY (1, 1),

// [Name]  NVARCHAR (50) NOT NULL,
// [APIKey] NVARCHAR (50) NOT NULL,
// [WhitelistIPAddress] NVARCHAR (50) NOT NULL,

export interface IDBPartnerIncomingConnection extends IDBEntity {
    Name: string;
    APIKey: string;
    WhitelistIPAddress: string;
}