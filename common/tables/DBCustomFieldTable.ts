import { Bit, Int, NVarChar, Request } from "mssql";
import { IDBCustomField } from "../models/db/IDBCustomField";
import { IDBEntity } from "../models/db/IDBEntity";


export class DBCustomFieldTable {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async getByUserId(request: Request, userId: number): Promise<IDBCustomField[]> {
        const result = await request.query<IDBCustomField>(`\
            SELECT *, CustomFieldId as Id \
            FROM ${this.tableName} \
            WHERE UserProfileInternalId = '${userId}'\
        `);
        return result.recordset;
    }

    public async getPublicByUserId(request: Request, userId: number): Promise<IDBCustomField[]> {
        const result = await request.query<IDBCustomField>(`\
            SELECT *, CustomFieldId as Id \
            FROM ${this.tableName} \
            WHERE UserProfileInternalId = '${userId}' AND Visibility = '1'\
        `);
        return result.recordset;
    }

    public async create(request: Request, model: IDBCustomField): Promise<IDBEntity> {
        const result = await this.mapModel(request, model)
        .query<IDBEntity>(`\
        INSERT INTO ${this.tableName} \
        (\
            Code, \
            DisplayName, \
            Value, \
            Visibility, \
            UserProfileInternalId\
        ) \
        OUTPUT INSERTED.CustomFieldId as [Id] \
        VALUES \
        (\
            @Code, \
            @DisplayName, \
            @Value, \
            @Visibility, \
            @UserProfileInternalId\
        )`);
        return result.recordset[0];
    }

    public async update(request: Request, model: IDBCustomField): Promise<any> {
        const result = await this.mapModel(request, model)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            Code = @Code, \
            DisplayName = @DisplayName, \
            Value = @Value, \
            Visibility = @Visibility, \
            UserProfileInternalId = @UserProfileInternalId \
            WHERE CustomFieldId = '${model.Id}'\
        `);
    
        return result.recordset;
    }

    public async delete(request: Request, id: number): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE CustomFieldId = ${id}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    private mapModel(request: Request, model: IDBCustomField): Request {
        return request
        .input("Code", NVarChar, model.Code)
        .input("DisplayName", NVarChar, model.DisplayName)
        .input("Value", NVarChar, model.Value)
        .input("Visibility", Bit, model.Visibility)
        .input("UserProfileInternalId", Int, model.UserProfileInternalId);
    }
}