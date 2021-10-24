import { Int, NVarChar, Request } from "mssql";
import { IDBEntity } from "../models/db/IDBEntity";
import { IDBUserProfileExternal } from "../models/db/IDBUserProfileExternal";

export class DBUserProfileExternalTable {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async getByAadId(request: Request, id: string): Promise<IDBUserProfileExternal>{
        const resp = await request.query<IDBUserProfileExternal>(`\
            SELECT ${this.tableName}.UserProfileExternalId AS Id, ${this.tableName}.UserAadId, ${this.tableName}.UserPrincipalName, ${this.tableName}.DisplayName, ${this.tableName}.GivenName, ${this.tableName}.SurName, ${this.tableName}.JobTitle \
            FROM ${this.tableName} \
            WHERE UserAadId = '${id}'`);
        const result = resp.recordset[0];
        return result;
    }

    public async create(request: Request, model: IDBUserProfileExternal): Promise<IDBEntity> {
        const result = await this.mapModel(request, model)
        .query<IDBEntity>(`\
        INSERT INTO ${this.tableName} \
        (\
            UserAadId, \
            UserPrincipalName, \
            DisplayName, \
            GivenName, \
            SurName, \
            JobTitle, \
            PartnerOutgoingConnectionId\
        ) \
        OUTPUT INSERTED.UserProfileExternalId AS [Id] \
        VALUES \
        (\
            @UserAadId, \
            @UserPrincipalName, \
            @DisplayName, \
            @GivenName, \
            @SurName, \
            @JobTitle, \
            @PartnerOutgoingConnectionId\
        )`);
        return result.recordset[0];
    }

    public async update(request: Request, model: IDBUserProfileExternal): Promise<any> {
        const result = await this.mapModel(request, model)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            UserAadId = @UserAadId, \
            UserPrincipalName = @UserPrincipalName, \
            DisplayName = @DisplayName, \
            GivenName = @GivenName, \
            SurName = @SurName, \
            JobTitle = @JobTitle, \
            PartnerOutgoingConnectionId = @PartnerOutgoingConnectionId \
            WHERE UserAadId = '${model.UserAadId}'\
        `);
    
        return result.recordset;
    }
    
    public async deleteById(request: Request, id: number): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE UserProfileExternalId = ${id}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async deleteByAadId(request: Request, aadId: string): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE UserAadId = ${aadId}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    private mapModel(request: Request, model: IDBUserProfileExternal): Request {
        return request
        .input("UserAadId", NVarChar, model.UserAadId)
        .input("UserPrincipalName", NVarChar, model.UserPrincipalName)
        .input("DisplayName", NVarChar, model.DisplayName)
        .input("GivenName", NVarChar, model.GivenName)
        .input("SurName", NVarChar, model.SurName)
        .input("JobTitle", NVarChar, model.JobTitle)
        .input("PartnerOutgoingConnectionId", Int, model.PartnerOutgoingConnectionId);
    }
}