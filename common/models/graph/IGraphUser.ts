export interface IGraphUser {
    id: string;
    displayName: string;
    givenName?: string;
    surname?:string;
    mail?: string;
    userPrincipalName: string;
    jobTitle?:string;
    mobilePhone?:string;
    officeLocation?:string;
    department?: string;
    mailNickname?: string;
    businessPhones?: string[];
    accountEnabled?: boolean;
    deletedDateTime?: string;
}