import { NVarChar, Request } from "mssql";
import { IDBEntity } from "../models/db/IDBEntity";
import { IDBPartnerIncomingConnection } from "../models/db/IDBPartnerIncomingConnection";

export class DBPartnerIncomingConnectionTable {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async hasAny(request: Request, key: string, ip: string): Promise<boolean> {
        const resp = await request.query<{ConnectionFound: number}>(`\
            SELECT COUNT(PartnerIncomingConnectionId) AS ConnectionFound\
            FROM ${this.tableName} \
            WHERE APIKey = '${key}' AND WhitelistIPAddress = '${ip}'\
        `);
        const result = !!resp.recordset[0].ConnectionFound;
        return result;
    }

    public async getFree(request: Request, key: string): Promise<IDBPartnerIncomingConnection | undefined> {
        const resp = await request.query<IDBPartnerIncomingConnection>(`\
            SELECT TOP 1 *, PartnerIncomingConnectionId AS Id\
            FROM ${this.tableName} \
            WHERE APIKey = '${key}' AND WhitelistIPAddress = ''\
        `);
        const result = resp.recordset[0];
        return result;
    }

    public async getAll(request: Request): Promise<IDBPartnerIncomingConnection[]> {
        const resp = await request.query<IDBPartnerIncomingConnection>(`\
            SELECT TOP 100 *, PartnerIncomingConnectionId AS Id FROM ${this.tableName}`);
        const result = resp.recordset;
        return result;
    }

    public async create(request: Request, model: IDBPartnerIncomingConnection): Promise<IDBEntity> {
        const result = await this.mapModel(request, model)
        .query<IDBEntity>(`\
        INSERT INTO ${this.tableName} \
        (\
            Name, \
            APIKey, \
            WhitelistIPAddress\
        ) \
        OUTPUT INSERTED.PartnerIncomingConnectionId as [Id] \
        VALUES \
        (\
            @Name, \
            @APIKey, \
            @WhitelistIPAddress\
        )`);
        return {
            Id: result.recordset[0].Id
        };
    }

    public async update(request: Request, model: IDBPartnerIncomingConnection): Promise<any> {
        const resp = await this.mapModel(request, model)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            Name = @Name, \
            APIKey = @APIKey, \
            WhitelistIPAddress = @WhitelistIPAddress \
            WHERE PartnerIncomingConnectionId = '${model.Id}'\
        `);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async delete(request: Request, id: string): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE PartnerIncomingConnectionId = ${id}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    private mapModel(request: Request, model: IDBPartnerIncomingConnection): Request {
        return request
        .input("Name", NVarChar, model.Name)
        .input("APIKey", NVarChar, model.APIKey)
        .input("WhitelistIPAddress", NVarChar, model.WhitelistIPAddress || "");
    }
}