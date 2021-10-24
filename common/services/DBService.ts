import { config, ConnectionPool } from "mssql";
import { ISearchConnection } from "../models/api/ISearchConnection";
import { IUserFavourite } from "../models/api/IUserFavourite";
import { IDBCustomField } from "../models/db/IDBCustomField";
import { IDBEntity } from "../models/db/IDBEntity";
import { IDBFavoriteExternal } from "../models/db/IDBFavoriteExternal";
import { IDBFavoriteInternal } from "../models/db/IDBFavoriteInternal";
import { IDBPartnerIncomingConnection } from "../models/db/IDBPartnerIncomingConnection";
import { IDBPartnerOutgoingConnection } from "../models/db/IDBPartnerOutgoingConnection";
import { IDBUserProfileExternal } from "../models/db/IDBUserProfileExternal";
import { IDBUserProfileInternal } from "../models/db/IDBUserProfileInternal";
import { DBCustomFieldTable } from "../tables/DBCustomFieldTable";
import { DBFavoriteExternalTable } from "../tables/DBFavoriteExternalTable";
import { DBFavoriteInternalTable } from "../tables/DBFavoriteInternalTable";
import { DBPartnerIncomingConnectionTable } from "../tables/DBPartnerIncomingConnectionTable";
import { DBPartnerOutgoingConnectionTable } from "../tables/DBPartnerOutgoingConnectionTable";
import { DBUserProfileExternalTable } from "../tables/DBUserProfileExternalTable";
import { DBUserProfileInternalTable } from "../tables/DBUserProfileInternalTable";

export const TABLES = {
    USER_PROFILE_INT: "UserProfileInternal",
    USER_PROFILE_EXT: "UserProfileExternal",
    CUSTOM_FIELD: "CustomField",
    FAVORITE_INT: "FavoriteInternal",
    FAVORITE_EXT: "FavoriteExternal",
    INC_CONNECTION: "PartnerIncomingConnection",
    OUT_CONNECTION: "PartnerOutgoingConnection"
}

export class DBService {
    private config: config;
    private extLog?: (msg: string) => void;
    private userIntTable: DBUserProfileInternalTable;
    private userExtTable: DBUserProfileExternalTable;
    private incConnTable: DBPartnerIncomingConnectionTable;
    private outConnTable: DBPartnerOutgoingConnectionTable;
    private favExtTable: DBFavoriteExternalTable;
    private favIntTable: DBFavoriteInternalTable;
    private customFieldTable: DBCustomFieldTable;

    public constructor(config: config, logFunc?: (msg: string) => void){
        this.extLog = logFunc;
        this.log(`Constructor: ${JSON.stringify(config)}`);
        this.config = config;

        this.userIntTable = new DBUserProfileInternalTable(TABLES.USER_PROFILE_INT);
        this.userExtTable = new DBUserProfileExternalTable(TABLES.USER_PROFILE_EXT);
        this.incConnTable = new DBPartnerIncomingConnectionTable(TABLES.INC_CONNECTION);
        this.outConnTable = new DBPartnerOutgoingConnectionTable(TABLES.OUT_CONNECTION);
        this.favExtTable = new DBFavoriteExternalTable(TABLES.FAVORITE_EXT, TABLES.USER_PROFILE_EXT);
        this.favIntTable = new DBFavoriteInternalTable(TABLES.FAVORITE_INT, TABLES.USER_PROFILE_INT);
        this.customFieldTable = new DBCustomFieldTable(TABLES.CUSTOM_FIELD);
    }

    //////////////////
    // USERS START
    //////////////////
    public async getUserById(id: number): Promise<IDBUserProfileInternal> {
        const pool = await this.connectDB();
        try {
            this.log(`getUserById id:${id} ...`);
            const result: IDBUserProfileInternal = await this.userIntTable.getById(pool.request(), id);
            this.log(`getUserById id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getUserById id:${id} exception: ${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async getUserByAadId(id: string): Promise<IDBUserProfileInternal> {
        const pool = await this.connectDB();
        try {
            this.log(`getUserByAadId id:${id} ...`);
            const result = await this.userIntTable.getByAadId(pool.request(), id);
            this.log(`getUserByAadId id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getUserByAadId id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async createUser(user: IDBUserProfileInternal): Promise<IDBEntity> {
        const pool = await this.connectDB();
        try {
            this.log(`createUser user:${JSON.stringify(user)} ...`);
            const result = await this.userIntTable.create(pool.request(), user);
            this.log(`createUser user:${JSON.stringify(user)} executed`);
            return result;
        }
        catch (err) {
            this.log(`createUser user:${JSON.stringify(user)} exception:${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async updateUser(user: IDBUserProfileInternal): Promise<void> {
        const pool = await this.connectDB();
        try {
            this.log(`updateUser user:${JSON.stringify(user)} ...`);
            await this.userIntTable.update(pool.request(), user);
            this.log(`updateUser user:${JSON.stringify(user)} executed`);
        }
        catch (err) {
            this.log(`updateUser user:${JSON.stringify(user)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteUserById(id: number): Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteUserById id:${id} ...`);
            this.log(`deleteUserById id:${id} deleting all references from favorites ...`);
            await this.favIntTable.deleteAllReferences(pool.request(), id);
            this.log(`deleteUserById id:${id} favorites refs deleted`);

            this.log(`deleteUserById id:${id} deleting user ...`);
            const result = await this.userIntTable.deleteById(pool.request(), id);
            this.log(`deleteUserById id:${id} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteUserById id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async deleteUserByAadId(id: string): Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteUserByAadId id:${id} ...`);
            this.log(`deleteUserByAadId id:${id} retrieving from db ...`);
            const user = await this.userIntTable.getByAadId(pool.request(), id);
            let result = 0;
            if(user && user.Id){
                this.log(`deleteUserByAadId id:${id} retrieved from db`);
                this.log(`deleteUserByAadId id:${id} deleting all references from favorites ...`);
                await this.favIntTable.deleteAllReferences(pool.request(), user.Id);
                this.log(`deleteUserByAadId id:${id} favorites refs deleted`);

                this.log(`deleteUserById id:${id} deleting user ...`);
                result = await this.userIntTable.deleteById(pool.request(), user.Id);
            } else {
                this.log(`deleteUserById id:${id} user not found`);
                throw Error("User doesn't exist");
            }
            
            this.log(`deleteUserByAadId id:${id} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteUserByAadId id:${id} exception`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async getAllUsers(skip?: number, top?: number): Promise<IDBUserProfileInternal[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getAllUsers skip:${skip} top:${top} ...`);
            const result = await this.userIntTable.getAll(pool.request(), skip, top);
            this.log(`getAllUsers skip:${skip} top:${top} executed`);
            return result;
        }
        catch (err) {
            this.log(`getAllUsers skip:${skip} top:${top} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async getAllPublishedUsers(skip?: number, top?: number): Promise<IDBUserProfileInternal[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getAllPublishedUsers skip:${skip} top:${top} ...`);
            const result = await this.userIntTable.getAllPublished(pool.request(), skip, top);
            this.log(`getAllPublishedUsers skip:${skip} top:${top} executed`);
            return result;
        }
        catch (err) {
            this.log(`getAllPublishedUsers skip:${skip} top:${top} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async getAllUnPublishedUsers(skip?: number, top?: number): Promise<IDBUserProfileInternal[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getAllUnpublishedUsers skip:${skip} top:${top} ...`);
            const result = await this.userIntTable.getAllUnPublished(pool.request(), skip, top);
            this.log(`getAllUnpublishedUsers skip:${skip} top:${top} executed`);
            return result;
        }
        catch (err) {
            this.log(`getAllUnpublishedUsers skip:${skip} top:${top} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async updateUserOOF(id: number, oof: boolean): Promise<IDBUserProfileInternal[]> {
        const pool = await this.connectDB();
        try {
            this.log(`updateUserOOF id:${id} oof:${oof} ...`);
            const result = await this.userIntTable.updateUserOOF(pool.request(), id, oof);
            this.log(`updateUserOOF id:${id} oof:${oof} executed`);
            return result;
        }
        catch (err) {
            this.log(`updateUserOOF id:${id} oof:${oof} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async updateUserWTC(id: number, wtc: boolean): Promise<IDBUserProfileInternal[]> {
        const pool = await this.connectDB();
        try {
            this.log(`updateUserWTC id:${id} wtc:${wtc} ...`);
            const result = await this.userIntTable.updateUserWTC(pool.request(), id, wtc);
            this.log(`updateUserWTC id:${id} wtc:${wtc} executed`);
            return result;
        }
        catch (err) {
            this.log(`updateUserWTC id:${id} wtc:${wtc} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async updateUserPublished(id: number, isPublished: boolean): Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`updateUserPublished id:${id} published:${isPublished} ...`);
            const result = await this.userIntTable.updateUserPublished(pool.request(), id, isPublished);
            this.log(`updateUserPublished id:${id} published:${isPublished} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`updateUserPublished id:${id} wtc:${isPublished} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }
    // USERS END

    //////////////////
    // USERS EXT START
    //////////////////
    public async getExtUserByAadId(id: string): Promise<IDBUserProfileExternal> {
        const pool = await this.connectDB();
        try {
            this.log(`getExtUser id:${id} ...`);
            const result = await this.userExtTable.getByAadId(pool.request(), id);
            this.log(`getExtUser id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getExtUser id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async createExtUser(user: IDBUserProfileExternal): Promise<IDBEntity> {
        const pool = await this.connectDB();
        try {
            this.log(`createExtUser user:${JSON.stringify(user)} ...`);
            const result = await this.userExtTable.create(pool.request(), user);
            this.log(`createExtUser user:${JSON.stringify(user)} executed`);
            return result;
        }
        catch (err) {
            this.log(`createExtUser user:${JSON.stringify(user)} exception:${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }

    public async updateExtUser(user: IDBUserProfileExternal): Promise<void> {
        const pool = await this.connectDB();
        try {
            this.log(`updateExtUser user:${JSON.stringify(user)} ...`);
            await this.userExtTable.update(pool.request(), user);
            this.log(`updateExtUser user:${JSON.stringify(user)} executed`);
        }
        catch (err) {
            this.log(`updateExtUser user:${JSON.stringify(user)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteExtUserByAadId(aadId: string): Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteExtUser id:${aadId} ...`);
            const result = await this.userExtTable.deleteByAadId(pool.request(), aadId);
            this.log(`deleteExtUser id:${aadId} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteExtUser id:${aadId} exception:${JSON.stringify(err)}`);
            throw err;
        } 
        finally {
            pool.close();
        }
    }
    // USERS EXT END
    
    //////////////////
    // INC_CONN START
    //////////////////
    public async isRegisteredRequester(key: string, ip: string): Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`isRegisteredRequester key:${key} ip:${ip} ...`);
            const result = await this.incConnTable.hasAny(pool.request(), key, ip);
            this.log(`isRegisteredRequester key:${key} ip:${ip} executed`);
            return result;
        }
        catch (err) {
            this.log(`isRegisteredRequester key:${key} ip:${ip} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async tryGetFreeIncConnectionSlot(key: string): Promise<IDBPartnerIncomingConnection | undefined> {
        const pool = await this.connectDB();
        try {
            this.log(`tryGetFreeConnectionSlot key:${key} ...`);
            const result = await this.incConnTable.getFree(pool.request(), key);
            this.log(`tryGetFreeConnectionSlot key:${key} executed`);
            return result;
        }
        catch (err) {
            this.log(`tryGetFreeConnectionSlot key:${key} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async createIncConnection(model: IDBPartnerIncomingConnection):Promise<IDBEntity> {
        const pool = await this.connectDB();
        try {
            this.log(`createIncConnection model:${JSON.stringify(model)} ...`);
            const result = await this.incConnTable.create(pool.request(), model);
            this.log(`createIncConnection model:${JSON.stringify(model)} executed`);
            return result;
        }
        catch (err) {
            this.log(`createIncConnection model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async updateIncConnection(model: IDBPartnerIncomingConnection):Promise<any> {
        const pool = await this.connectDB();
        try {
            this.log(`updateIncConnection model:${JSON.stringify(model)} ...`);
            const result = await this.incConnTable.update(pool.request(), model);
            this.log(`updateIncConnection model:${JSON.stringify(model)} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`updateIncConnection model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteIncConnection(id: string):Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteIncConnection id:${id} ...`);
            const result = await this.incConnTable.delete(pool.request(), id);
            this.log(`deleteIncConnection id:${id} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteIncConnection id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async getAllIncConnections():Promise<IDBPartnerIncomingConnection[]> {
        const pool = await this.connectDB();
        try {
            this.log("getAllIncConnections ...");
            const result = await this.incConnTable.getAll(pool.request());
            this.log("getAllIncConnections executed");
            return result;
        }
        catch (err) {
            this.log(`getAllIncConnections exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }
    // INC_CONN END

    //////////////////
    // OUT_CONN START
    //////////////////
    public async getOutConnectionById(id: number):Promise<IDBPartnerOutgoingConnection> {
        const pool = await this.connectDB();
        try {
            this.log(`getOutConnectionById id:${id} ...`);
            const result = await this.outConnTable.getById(pool.request(), id);
            this.log(`getOutConnectionById id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getOutConnectionById id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async createOutConnection(model: IDBPartnerOutgoingConnection):Promise<IDBEntity> {
        const pool = await this.connectDB();
        try {
            this.log(`createOutConnection model:${JSON.stringify(model)} ...`);
            const result = await this.outConnTable.create(pool.request(), model);
            this.log(`createOutConnection model:${JSON.stringify(model)} executed`);
            return result;
        }
        catch (err) {
            this.log(`createOutConnection model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async updateOutConnection(model: IDBPartnerOutgoingConnection):Promise<any> {
        const pool = await this.connectDB();
        try {
            this.log(`updateOutConnection model:${JSON.stringify(model)} ...`);
            const result = await this.outConnTable.update(pool.request(), model);
            this.log(`updateOutConnection model:${JSON.stringify(model)} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`updateOutConnection model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteOutConnection(id: string):Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteOutConnection id:${id} ...`);
            const result = await this.outConnTable.delete(pool.request(), id);
            this.log(`deleteOutConnection id:${id} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteOutConnection id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async getAllOutConnections():Promise<IDBPartnerOutgoingConnection[]> {
        const pool = await this.connectDB();
        try {
            this.log("getAllOutConnections ...");
            const result = await this.outConnTable.getAll(pool.request());
            this.log("getAllOutConnections executed");
            return result;
        }
        catch (err) {
            this.log(`getAllOutConnections exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }
    // OUT_CONN END

    //////////////////
    // CONNECTIONS FOR SEARCH
    //////////////////
    public async getConnections():Promise<ISearchConnection[]> {
        const pool = await this.connectDB();
        try {
            this.log("getConnections ...");
            const result = await this.outConnTable.getAllShortened(pool.request());
            this.log("getConnections executed");
            return result;
        }
        catch (err) {
            this.log("getConnections exception");
            throw err;
        }
        finally {
            pool.close();
        }
    }

    //////////////////
    // FAV_EXT START
    //////////////////
    public async getFavExternal(id: number):Promise<IUserFavourite[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getFavExternal id:${id} ...`);
            const result = await this.favExtTable.getByUserId(pool.request(), id);
            this.log(`getFavExternal id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getFavExternal id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async createFavExternal(model: IDBFavoriteExternal):Promise<void> {
        const pool = await this.connectDB();
        try {
            this.log(`createFavExternal model:${JSON.stringify(model)} ...`);
            await this.favExtTable.create(pool.request(), model);
            this.log(`createFavExternal model:${JSON.stringify(model)} executed`);
        }
        catch (err) {
            this.log(`createFavExternal model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteFavExternal(model: IDBFavoriteExternal):Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteFavExternal model:${JSON.stringify(model)} ...`);
            const result = await this.favExtTable.delete(pool.request(), model);
            const hasAnyLinks = await this.favExtTable.hasAnyLinks(pool.request(), model.UserProfileExternalFavoriteId);
            if(!hasAnyLinks){
                this.log(`deleteFavExternal model:${JSON.stringify(model)} external user has no fav refs, removing from external users table ...`);
                await this.userExtTable.deleteById(pool.request(), model.UserProfileExternalFavoriteId);
                this.log(`deleteFavExternal model:${JSON.stringify(model)} removed from external users table ...`);
            }
            this.log(`deleteFavExternal model:${JSON.stringify(model)} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteFavExternal model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }
    // FAV_EXT END

    //////////////////
    // FAV_INT START
    //////////////////
    public async getFavInternal(id: number):Promise<IUserFavourite[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getFavInternal id:${id} ...`);
            const result = await this.favIntTable.getByUserId(pool.request(), id);
            this.log(`getFavInternal id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getFavInternal id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async createFavInternal(model: IDBFavoriteInternal):Promise<void> {
        const pool = await this.connectDB();
        try {
            this.log(`createFavInternal model:${JSON.stringify(model)} ...`);
            await this.favIntTable.create(pool.request(), model);
            this.log(`createFavInternal model:${JSON.stringify(model)} executed`);
        }
        catch (err) {
            this.log(`createFavInternal model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteFavInternal(model: IDBFavoriteInternal):Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteFavInternal model:${JSON.stringify(model)} ...`);
            const result = await this.favIntTable.delete(pool.request(), model);
            this.log(`deleteFavInternal model:${JSON.stringify(model)} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteFavInternal model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }
    // FAV_INT END

    //////////////////
    // CUSTOM_FIELD START
    //////////////////
    public async getCustomFields(id: number):Promise<IDBCustomField[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getCustomFields id:${id} ...`);
            const result = await this.customFieldTable.getByUserId(pool.request(), id);
            this.log(`getCustomFields id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getCustomFields id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async getPublicCustomFields(id: string):Promise<IDBCustomField[]> {
        const pool = await this.connectDB();
        try {
            this.log(`getPublicCustomFields id:${id} ...`);
            this.log(`getPublicCustomFields id:${id} retrieving user ...`);
            const user = await this.userIntTable.getByAadId(pool.request(), id);
            let result:IDBCustomField[] = [];
            if(user && user.Id){
                this.log(`getPublicCustomFields id:${id} user retrieved`);
                this.log(`getPublicCustomFields id:${id} retrieveing custom fields ...`);
                result = await this.customFieldTable.getPublicByUserId(pool.request(), user.Id);
            } else {
                this.log(`getPublicCustomFields id:${id} user not found`);
                throw Error("User doesn't exist");
            }
            
            this.log(`getPublicCustomFields id:${id} executed`);
            return result;
        }
        catch (err) {
            this.log(`getPublicCustomFields id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async createCustomField(model: IDBCustomField):Promise<IDBEntity> {
        const pool = await this.connectDB();
        try {
            this.log(`createCustomField model:${JSON.stringify(model)} ...`);
            const result = await this.customFieldTable.create(pool.request(), model);
            this.log(`createCustomField model:${JSON.stringify(model)} executed`);
            return result;
        }
        catch (err) {
            this.log(`createCustomField model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async updateCustomField(model: IDBCustomField):Promise<any> {
        const pool = await this.connectDB();
        try {
            this.log(`updateCustomField model:${JSON.stringify(model)} ...`);
            const result = await this.customFieldTable.update(pool.request(), model);
            this.log(`updateCustomField model:${JSON.stringify(model)} executed`);
            return result;
        }
        catch (err) {
            this.log(`updateCustomField model:${JSON.stringify(model)} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }

    public async deleteCustomField(id: number):Promise<boolean> {
        const pool = await this.connectDB();
        try {
            this.log(`deleteCustomField id:${id} ...`);
            const result = await this.customFieldTable.delete(pool.request(), id);
            this.log(`deleteCustomField id:${id} executed`);
            return !!result;
        }
        catch (err) {
            this.log(`deleteCustomField id:${id} exception:${JSON.stringify(err)}`);
            throw err;
        }
        finally {
            pool.close();
        }
    }
    // CUSTOM_FIELD END

    // COMMON
    private async connectDB(): Promise<ConnectionPool> {
        this.log('Connecting ...');
        const pool = new ConnectionPool(this.config);
        
        try {
            await pool.connect();
            this.log('Connected');
    
            return pool;
        }
        catch(err) {
            this.log(`Connection failed:${JSON.stringify(err)}`);
            throw err;
        }
    }

    private log(payload: string){
        const msg = `DBService::${payload}`
        this.extLog 
            ? this.extLog(msg)
            : console.log(msg);
    };
}