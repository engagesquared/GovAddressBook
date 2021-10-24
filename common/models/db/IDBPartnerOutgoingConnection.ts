import { IDBEntity } from "./IDBEntity";
// [PartnerOutgoingConnectionId] INT PRIMARY KEY IDENTITY (1, 1),

// [Name]  NVARCHAR (50) NOT NULL,
// [APIKey] NVARCHAR (50) NOT NULL,
// [EndpointURLOrIPAddress] NVARCHAR (50) NOT NULL,

export interface IDBPartnerOutgoingConnection extends IDBEntity {
    Name: string;
    APIKey: string;
    EndpointURLOrIPAddress: string;
}
