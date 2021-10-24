export const DATABASE = {
    USER: process.env.DATABASE_USER?.trim() || "",
    PASS: process.env.DATABASE_PASSWORD?.trim() || "",
    NAME: process.env.DATABASE_NAME?.trim() || "",
    SERV: process.env.DATABASE_SERVER?.trim() || ""
}

export const GRAPH = {
    API_URL: process.env.GRAPH_API_URL?.trim() || ""
}

export const REG_APP = {
    ID: process.env.REG_APP_ID?.trim() || "",
    THUMBPRINT: process.env.REG_APP_CERT_THUMBPRINT?.trim() || "",
    SCOPES: (process.env.REG_APP_SCOPES || "").split(","),
    AUTH_URL: `${process.env.REG_APP_AUTHORITYHOSTURL?.trim()}/${process.env.REG_APP_TENANTID?.trim()}/`,
    ID_URI: process.env.REG_APP_ID_URI?.trim() || "",
}

export const KEY_VAULT = {
    NAME: process.env.KEY_VAULT_SECRET_NAME?.trim() || "",
    URL: process.env.KEY_VAULT_URL?.trim() || "",
}

export const AZ_SEARCH = {
    URL: process.env.AZURE_SEARCH_URL?.trim() || "",
    KEY: process.env.AZURE_SEARCH_KEY?.trim() || ""
}

export const TEAMS_APP = {
    ID: process.env.TEAMS_APP_ID?.trim() || "",
    TITLE: process.env.TEAMS_APP_TITLE?.trim() || ""
}

export const TEAMS_TAB = {
    MY_PROFILE: {
        ID: process.env.TEAMS_TAB_ID_MYPROFILE?.trim() || "",
        NAME: "My Profile",
        URL: "/tab/#/profile"
    }
}