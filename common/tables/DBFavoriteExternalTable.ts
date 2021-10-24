import { Int, Request } from "mssql";
import { IUserFavourite } from "../models/api/IUserFavourite";
import { IDBFavoriteExternal } from "../models/db/IDBFavoriteExternal";

export class DBFavoriteExternalTable {
    private tableName: string;
    private userTableName: string;

    constructor(tableName: string, userTableName: string) {
        this.tableName = tableName;
        this.userTableName = userTableName;
    }

    public async hasAnyLinks(request: Request, extUserId: number): Promise<boolean> {
        const result = await request.query<{LinksFound: number}>(`\
            SELECT COUNT(UserProfileExternalFavoriteId) AS LinksFound\
            FROM ${this.tableName} \
            WHERE UserProfileExternalFavoriteId = '${extUserId}'\
        `);
        return !!result.recordset[0].LinksFound;
    }

    public async getByUserId(request: Request, userId: number): Promise<IUserFavourite[]> {
        const result = await request.query<IUserFavourite>(`\
            SELECT ${this.userTableName}.UserAadId, ${this.userTableName}.DisplayName, ${this.userTableName}.UserPrincipalName, ${this.userTableName}.JobTitle, ${this.userTableName}.PartnerOutgoingConnectionId, ${this.userTableName}.UserProfileExternalId AS Id \
            FROM ${this.userTableName} \
                RIGHT JOIN (\
                    SELECT ${this.tableName}.UserProfileExternalFavoriteId \
                    FROM ${this.tableName} \
                    WHERE ${this.tableName}.UserProfileInternalId = ${userId} \
                ) as Favs \
            ON ${this.userTableName}.UserProfileExternalId = Favs.UserProfileExternalFavoriteId\
        `);
        return result.recordset;
    }

    public async create(request: Request, model: IDBFavoriteExternal): Promise<void> {
        await this.mapModel(request, model)
        .query(`\
        INSERT INTO ${this.tableName} \
        (\
            UserProfileInternalId, \
            UserProfileExternalFavoriteId\
        ) \
        VALUES \
        (\
            @UserProfileInternalId, \
            @UserProfileExternalFavoriteId\
        )`);
    }

    public async delete(request: Request, model: IDBFavoriteExternal): Promise<number> {
        const resp = await request.query(`\
            DELETE FROM ${this.tableName} \
            WHERE UserProfileInternalId = ${model.UserProfileInternalId} \
            AND UserProfileExternalFavoriteId = ${model.UserProfileExternalFavoriteId}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    private mapModel(request: Request, model: IDBFavoriteExternal): Request {
        return request
        .input("UserProfileInternalId", Int, model.UserProfileInternalId)
        .input("UserProfileExternalFavoriteId", Int, model.UserProfileExternalFavoriteId);
    }
}