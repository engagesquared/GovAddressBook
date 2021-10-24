import { IDBUserProfileExternal } from "../db/IDBUserProfileExternal";
import { IDBUserProfileInternal } from "../db/IDBUserProfileInternal";

export interface IUserProfile extends IDBUserProfileExternal, IDBUserProfileInternal {}