import express from "express";
import dotenv from "dotenv";
import sql from "mssql";
import morgan from "morgan";
import * as appInsights from "applicationinsights";
import compression from "compression";
import api from "./api";
import { IAuthServiceSettings, IAzSearchServiceSettings } from "../common";

// INIT TOKENS FROM .env
dotenv.config();

export const dbConfig: sql.config = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    server: process.env.DATABASE_SERVER || ""
};

export const azSearchConfig: IAzSearchServiceSettings = {
    url: process.env.AZURE_SEARCH_URL?.trim() || "",
    key: process.env.AZURE_SEARCH_KEY?.trim() || ""
};

export const authConfig: IAuthServiceSettings = {
    clientId: process.env.REG_APP_ID?.trim() || "",
    certThumbprint: process.env.REG_APP_CERT_THUMBPRINT?.trim() || "",
    keyVaultName: process.env.KEY_VAULT_SECRET_NAME?.trim() || "",
    keyVaultUrl: process.env.KEY_VAULT_URL?.trim() || "",
    scopes: (process.env.REG_APP_SCOPES || "").split(","),
    authUrl: `${process.env.REG_APP_AUTHORITYHOSTURL?.trim()}/${process.env.REG_APP_TENANTID?.trim()}/`
}

export const GRAPH = {
    API_URL: process.env.GRAPH_API_URL?.trim() || ""
}

export const SELF_EXTERNAL_API = {
    KEY: process.env.SELF_EXTERNAL_API_KEY?.trim() || ""
}

const app = express();
app.use(express.json());


const port = process.env.PORT || 3005;

// REQUEST BODY PARSER
app.use(express.json({
    verify: (req, res, buf: Buffer, encoding: string): void => {
        (req as any).rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// LOGGER
app.use(morgan("tiny", { stream: { write: msg => console.info(msg) } }));

// COMPRESSION
app.use(compression());

// API
app.use('/api', api);

// AZURE APP INSIGHTS
appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .start();

app.listen(port, () => console.log(`App listen on PORT ${port}`))