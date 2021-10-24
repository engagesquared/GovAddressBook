import { NVarChar, Request } from "mssql";
import { ISearchConnection } from "../models/api/ISearchConnection";
import { IDBEntity } from "../models/db/IDBEntity";
import { IDBPartnerOutgoingConnection } from "../models/db/IDBPartnerOutgoingConnection";

export class DBPartnerOutgoingConnectionTable {
    private tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async getAll(request: Request): Promise<IDBPartnerOutgoingConnection[]> {
        const resp = await request.query<IDBPartnerOutgoingConnection>(`\
            SELECT TOP 100 *, PartnerOutgoingConnectionId AS Id FROM ${this.tableName}`);
        const result = resp.recordset;
        return result;
    }

    public async getAllShortened(request: Request): Promise<ISearchConnection[]> {
        const resp = await request.query<ISearchConnection>(`\
            SELECT TOP 100 Name, PartnerOutgoingConnectionId AS Id FROM ${this.tableName}`);
        const result = resp.recordset;
        return result;
    }

    public async getById(request: Request, id: number): Promise<IDBPartnerOutgoingConnection> {
        const resp = await request.query<IDBPartnerOutgoingConnection>(`\
            SELECT *, PartnerOutgoingConnectionId AS Id FROM ${this.tableName} WHERE PartnerOutgoingConnectionId = '${id}'`);
        const result = resp.recordset[0];
        return result;
    }

    public async create(request: Request, model: IDBPartnerOutgoingConnection): Promise<IDBEntity> {
        const result = await this.mapModel(request, model)
        .query<IDBEntity>(`\
        INSERT INTO ${this.tableName} \
        (\
            Name, \
            APIKey, \
            EndpointURLOrIPAddress\
        ) \
        OUTPUT INSERTED.PartnerOutgoingConnectionId AS [Id] \
        VALUES \
        (\
            @Name, \
            @APIKey, \
            @EndpointURLOrIPAddress\
        )`);
        return result.recordset[0];
    }

    public async update(request: Request, model: IDBPartnerOutgoingConnection): Promise<number> {
        const resp = await this.mapModel(request, model)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            Name = @Name, \
            APIKey = @APIKey, \
            EndpointURLOrIPAddress = @EndpointURLOrIPAddress \
            WHERE PartnerOutgoingConnectionId = '${model.Id}'\
        `);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async delete(request: Request, id: string): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE PartnerOutgoingConnectionId = ${id}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    private mapModel(request: Request, model: IDBPartnerOutgoingConnection): Request {
        return request
        .input("Name", NVarChar, model.Name)
        .input("APIKey", NVarChar, model.APIKey)
        .input("EndpointURLOrIPAddress", NVarChar, model.EndpointURLOrIPAddress);
    }
}