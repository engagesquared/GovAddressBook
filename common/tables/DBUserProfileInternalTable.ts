import { Bit, NVarChar, Request } from "mssql";
import { IDBEntity } from "../models/db/IDBEntity";
import { IDBUserProfileInternal } from "../models/db/IDBUserProfileInternal";

export class DBUserProfileInternalTable {
    private tableName: string;
    private selectAllFields: string = `UserProfileInternalId AS Id, UserAadId, DisplayName, GivenName, SurName, PreferredPronoun, UserPrincipalName, MailNickname, Mail, OfficePhone, MobilePhone, JobTitle, DepartmentName, OfficeLocation, OutOfOffice, WelcomeTourCompleted, Published`;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    public async create(request: Request, model: IDBUserProfileInternal): Promise<IDBEntity> {
        const result = await this.mapModel(request, model)
        .query<IDBEntity>(`\
        INSERT INTO ${this.tableName} \
        (\
            UserAadId, \
            DisplayName, \
            GivenName, \
            SurName, \
            PreferredPronoun, \
            UserPrincipalName, \
            MailNickname, \
            Mail, \
            OfficePhone, \
            MobilePhone, \
            JobTitle, \
            DepartmentName, \
            OfficeLocation, \
            OutOfOffice\
        ) \
        OUTPUT INSERTED.UserProfileInternalId AS [Id] \
        VALUES \
        (\
            @UserAadId, \
            @DisplayName, \
            @GivenName, \
            @SurName, \
            @PreferredPronoun, \
            @UserPrincipalName, \
            @MailNickname, \
            @Mail,@OfficePhone, \
            @MobilePhone, \
            @JobTitle, \
            @DepartmentName, \
            @OfficeLocation, \
            @OutOfOffice\
        )`);

        return result.recordset[0];
    }

    public async update (request: Request, model: IDBUserProfileInternal): Promise<any> {
        const result = await this.mapModel(request, model)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            UserAadId = @UserAadId, \
            DisplayName = @DisplayName, \
            GivenName = @GivenName, \
            SurName = @SurName, \
            PreferredPronoun = @PreferredPronoun, \
            UserPrincipalName = @UserPrincipalName, \
            MailNickname = @MailNickname, \
            Mail = @Mail, \
            OfficePhone = @OfficePhone, \
            MobilePhone = @MobilePhone, \
            JobTitle = @JobTitle, \
            DepartmentName = @DepartmentName, \
            OfficeLocation = @OfficeLocation, \
            OutOfOffice = @OutOfOffice \
            WHERE UserProfileInternalId = '${model.Id}'\
        `);
    
        return result.recordset;
    }

    public async updateUserOOF(request: Request, userId: number, oof: boolean): Promise<any> {
        const result = await request
        .input("OutOfOffice", Bit, oof)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            OutOfOffice = @OutOfOffice \
            WHERE UserProfileInternalId = '${userId}'\
        `);
    
        return result.recordset;
    }

    public async updateUserWTC(request: Request, userId: number, wtc: boolean): Promise<any> {
        const result = await request
        .input("WelcomeTourCompleted", Bit, wtc)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            WelcomeTourCompleted = @WelcomeTourCompleted \
            WHERE UserProfileInternalId = '${userId}'\
        `);
    
        return result.recordset;
    }

    public async updateUserPublished(request: Request, userId: number, published: boolean): Promise<number> {
        const resp = await request
        .input("Published", Bit, published)
        .query<any>(`\
            UPDATE ${this.tableName} \
            SET \
            Published = @Published \
            WHERE UserProfileInternalId = '${userId}'\
        `);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async deleteById(request: Request, id: number): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE UserProfileInternalId = '${id}'`);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async deleteByAadId(request: Request, id: string): Promise<number> {
        const resp = await request.query(`DELETE FROM ${this.tableName} WHERE UserAadId = '${id}'`);
        const result = resp.rowsAffected[0];
        return result;
    }

    public async getById(request: Request, id: number): Promise<IDBUserProfileInternal>{
        const resp = await request.query<IDBUserProfileInternal>(`\
            SELECT TOP 1 ${this.selectAllFields} FROM ${this.tableName} WHERE UserProfileInternalId = '${id}'`);
        const result = resp.recordset[0];
        return result;
    }

    public async getByAadId(request: Request, id: string): Promise<IDBUserProfileInternal>{
        const resp = await request.query<IDBUserProfileInternal>(`\
            SELECT TOP 1 ${this.selectAllFields} FROM ${this.tableName} WHERE UserAadId = '${id}'`);
        const result = resp.recordset[0];
        return result;
    }

    public async getAll(request: Request, skip: number = 0, top: number = 100): Promise<IDBUserProfileInternal[]> {
        const resp = await request.query<IDBUserProfileInternal>(`\
            SELECT ${this.selectAllFields} \
            FROM ${this.tableName} \
            ORDER BY UserProfileInternalId \
            OFFSET ${skip} ROWS \
            FETCH NEXT ${top} ROWS ONLY`);
        const result = resp.recordset;
        return result;
    }

    public async getAllPublished(request: Request, skip: number = 0, top: number = 100): Promise<IDBUserProfileInternal[]> {
        const resp = await request.query<IDBUserProfileInternal>(`\
            SELECT ${this.selectAllFields} \
            FROM ${this.tableName} \
            WHERE Published = '1' \
            ORDER BY UserProfileInternalId \
            OFFSET ${skip} ROWS \
            FETCH NEXT ${top} ROWS ONLY`);
        const result = resp.recordset;
        return result;
    }

    public async getAllUnPublished(request: Request, skip: number = 0, top: number = 100): Promise<IDBUserProfileInternal[]> {
        const resp = await request.query<IDBUserProfileInternal>(`\
            SELECT ${this.selectAllFields} \
            FROM ${this.tableName} \
            WHERE Published IS NULL OR Published = '0' \
            ORDER BY UserProfileInternalId \
            OFFSET ${skip} ROWS \
            FETCH NEXT ${top} ROWS ONLY`);
        const result = resp.recordset;
        return result;
    }

    private mapModel(request: Request, model: IDBUserProfileInternal): Request {
        return request
        .input("UserAadId", NVarChar, model.UserAadId || "")
        .input("DisplayName", NVarChar, model.DisplayName || "")
        .input("GivenName", NVarChar, model.GivenName || "")
        .input("SurName", NVarChar, model.SurName || "")
        .input("PreferredPronoun", NVarChar, model.PreferredPronoun || "")
        .input("UserPrincipalName", NVarChar, model.UserPrincipalName || "")
        .input("MailNickname", NVarChar, model.MailNickname || "")
        .input("Mail", NVarChar, model.Mail || "")
        .input("OfficePhone", NVarChar, model.OfficePhone || "")
        .input("MobilePhone", NVarChar, model.MobilePhone || "")
        .input("JobTitle", NVarChar, model.JobTitle || "")
        .input("DepartmentName", NVarChar, model.DepartmentName || "")
        .input("OfficeLocation", NVarChar, model.OfficeLocation || "")
        .input("OutOfOffice", Bit, !!model.OutOfOffice);
    }
}