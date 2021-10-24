import { config } from "mssql";
import { IAuthServiceSettings, IAzSearchServiceSettings, IClientEnvConfig } from "./../../../common";
import { REG_APP, AZ_SEARCH, DATABASE, KEY_VAULT, TEAMS_APP, TEAMS_TAB, CLIENT_CONFIG } from "./constants";

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

export const clientEnv: IClientEnvConfig = {
    REG_APP_ID_URI: REG_APP.ID_URI,
    TEAMS_APP_ID: TEAMS_APP.ID,
    TEAMS_TAB_ID_SEARCH: TEAMS_TAB.SEARCH.ID,
    TEAMS_TAB_ID_MYPROFILE: TEAMS_TAB.MYPROFILE.ID,
    TEAMS_TAB_ID_FAVOURITES: TEAMS_TAB.FAVOURITES.ID,
    TEAMS_TAB_ID_PARTNERCONNECTIONS: TEAMS_TAB.PARTNERCONNECTIONS.ID,
    TEAMS_TAB_ID_APIKEYS: TEAMS_TAB.APIKEYS.ID,
    MANUAL_MODE: CLIENT_CONFIG.MANUAL_MODE
}