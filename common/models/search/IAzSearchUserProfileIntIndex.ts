import { IDBEntity } from "../..";

export interface IAzSearchUserProfileIntIndex extends IDBEntity {
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
}