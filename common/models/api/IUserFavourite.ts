import { IDBEntity } from "../db/IDBEntity";

export interface IUserFavourite extends IDBEntity {
    UserAadId: string;
    DisplayName: string;
    UserPrincipalName: string;
    JobTitle: string;
    PartnerOutgoingConnectionId?: number;
}