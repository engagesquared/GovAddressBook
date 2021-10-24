
import { config } from "mssql";
import { IAuthServiceSettings, IAzSearchServiceSettings } from "../common";
import { REG_APP, DATABASE, KEY_VAULT, AZ_SEARCH } from "./constants";

export const dbConfig: config = {
    user: DATABASE.USER,
    password: DATABASE.PASS,
    database: DATABASE.NAME,
    server: DATABASE.SERV
};

export const authConfig: IAuthServiceSettings = {
    clientId: REG_APP.ID,
    certThumbprint: REG_APP.THUMBPRINT,
    keyVaultName: KEY_VAULT.NAME,
    keyVaultUrl: KEY_VAULT.URL,
    scopes: REG_APP.SCOPES,
    authUrl: REG_APP.AUTH_URL
}

export const azSearchConfig: IAzSearchServiceSettings = {
    url: AZ_SEARCH.URL,
    key: AZ_SEARCH.KEY
}