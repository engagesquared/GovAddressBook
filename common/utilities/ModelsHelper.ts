import { IDBUserProfileInternal, IGraphUser } from "..";
import { IAzSearchUserProfileExtIndex } from "../models/search/IAzSearchUserProfileExtIndex";
import { IAzSearchUserProfileIntIndex } from "../models/search/IAzSearchUserProfileIntIndex";

export const fieldsAlwaysGetFromDbModel:(keyof IDBUserProfileInternal)[] = [
    "Id", 
    "DisplayName", 
    "PreferredPronoun", 
    "OfficeLocation", 
    "OutOfOffice", 
    "WelcomeTourCompleted",
    "Published" 
]

export const fieldsToRemoveFromDbModelForIntIndexing:(keyof IDBUserProfileInternal)[] = [
    "WelcomeTourCompleted",
    "Published"

]

export const fieldsToRemoveFromDbModelForExtIndexing:(keyof IDBUserProfileInternal)[] = [
    "Id",
    "WelcomeTourCompleted",
    "Published" 
]

export class ModelsHelper {
    public static castGraphUserToDbUser(grUser: IGraphUser): IDBUserProfileInternal {
        const result: IDBUserProfileInternal = {
            UserAadId: grUser.id,
            DepartmentName: grUser.department || "",
            DisplayName: grUser.displayName,
            GivenName: grUser.givenName || "",
            JobTitle: grUser.jobTitle || "",
            Mail: grUser.mail || "",
            MailNickname: grUser.mailNickname || "",
            MobilePhone: grUser.mobilePhone || "",
            OfficeLocation: grUser.officeLocation || "",
            OfficePhone: (grUser.businessPhones || [])[0],
            OutOfOffice: false,
            PreferredPronoun: "",
            SurName: grUser.surname || "",
            UserPrincipalName: grUser.userPrincipalName
        };
        return result;
    }

    public static castDbUserToIntSearchIndex(dbUser: IDBUserProfileInternal): IAzSearchUserProfileIntIndex {
        const result = {...dbUser};
        for(var key of fieldsToRemoveFromDbModelForIntIndexing) {
            delete result[key];
        }
        return result;
    }

    public static castDbUserToExtSearchIndex(dbUser: IDBUserProfileInternal): IAzSearchUserProfileExtIndex {
        const result = {...dbUser};
        for(var key of fieldsToRemoveFromDbModelForExtIndexing) { 
            delete result[key];
        }
        return result;
    }

    public static mergeDbUserModels(targetModel: IDBUserProfileInternal, sourceModel: IDBUserProfileInternal, keys: (keyof IDBUserProfileInternal)[]): IDBUserProfileInternal {
        const result: IDBUserProfileInternal = {... targetModel};
        for(const key of keys){
            (result as any)[key] = sourceModel[key];
        }
        return result;
    }

    public static hasDifferenceUserModels(first: IDBUserProfileInternal, second: IDBUserProfileInternal, keys?: (keyof IDBUserProfileInternal)[]): boolean {
        let result: boolean = false;
        const keysToValidate = keys || Object.keys(first) as (keyof IDBUserProfileInternal)[];
        for(const key of keysToValidate){
            result = result || !this.isEqual(first[key], second[key]);
        }

        return result;
    }

    public static isEqual(v1: string | boolean | number | undefined | null, v2: string | boolean | number | undefined | null): boolean {
        const val1 = (v1 === undefined || v1 === null || v1 === "") ? "" : v1;
        const val2 = (v2 === undefined || v2 === null || v2 === "") ? "" : v2;
        return val1 === val2;
    }
}