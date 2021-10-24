import { Int, Request } from "mssql";
import { IUserFavourite } from "../models/api/IUserFavourite";
import { IDBFavoriteInternal } from "../models/db/IDBFavoriteInternal";
import { IDBUserProfileInternal } from "../models/db/IDBUserProfileInternal";

export class DBFavoriteInternalTable {
    private tableName: string;
    private userTableName: string;

    constructor(tableName: string, userTableName: string) {
        this.tableName = tableName;
        this.userTableName = userTableName;
    }

    public async getByUserId(request: Request, userId: number): Promise<IUserFavourite[]> {
        const result = await request.query<IUserFavourite>(`\
            SELECT ${this.userTableName}.UserAadId, ${this.userTableName}.DisplayName, ${this.userTableName}.UserPrincipalName, ${this.userTableName}.JobTitle, ${this.userTableName}.UserProfileInternalId AS Id \
            FROM ${this.userTableName} \
                RIGHT JOIN (\
                    SELECT ${this.tableName}.UserProfileInternalFavoriteId \
                    FROM ${this.tableName} \
                    WHERE ${this.tableName}.UserProfileInternalId = ${userId} \
                ) as Favs \
            ON ${this.userTableName}.UserProfileInternalId = Favs.UserProfileInternalFavoriteId\
        `);
        return result.recordset;
    }

    public async create(request: Request, model: IDBFavoriteInternal): Promise<void> {
        await this.mapModel(request, model)
        .query(`\
        INSERT INTO ${this.tableName} \
        (\
            UserProfileInternalId, \
            UserProfileInternalFavoriteId\
        ) \
        VALUES \
        (\
            @UserProfileInternalId, \
            @UserProfileInternalFavoriteId\
        )`);
    }

    public async delete(request: Request, model: IDBFavoriteInternal): Promise<number> {
        const resp = await request.query(`\
            DELETE FROM ${this.tableName} \
            WHERE UserProfileInternalId = ${model.UserProfileInternalId} \
            AND UserProfileInternalFavoriteId = ${model.UserProfileInternalFavoriteId}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async deleteAllReferences(request: Request, userId: number): Promise<number> {
        const resp = await request.query(`\
            DELETE FROM ${this.tableName} \
            WHERE UserProfileInternalId = ${userId} \
            OR UserProfileInternalFavoriteId = ${userId}`);
        const result = resp.rowsAffected[0];
        return result;
    }

    private mapModel(request: Request, model: IDBFavoriteInternal): Request {
        return request
        .input("UserProfileInternalId", Int, model.UserProfileInternalId)
        .input("UserProfileInternalFavoriteId", Int, model.UserProfileInternalFavoriteId);
    }
}