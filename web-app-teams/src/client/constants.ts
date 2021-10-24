
export const LOCAL_STORAGE ={
    PREFIX: "e2_govaddressbook",
    ME_IS_ADMIN: "current_user_is_admin",
    ME_TEAMS_CALLING: "has_access_teams_calling_plan",
    CLIENT_TOKEN: "client-side-token",
    SERVER_TOKEN: "app-server-side-token",
    WELCOME_TOUR: "welcome-tour-hide-temp",
    HISTORY_SEARCH: "history-search",
    ENV: "env",
    ME: "current_user"
}

// export const ENV = {
//     TEAMS_APP_ID: process.env.TEAMS_APP_ID?.trim() || "",
//     REG_APP_ID_URI: process.env.REG_APP_ID_URI?.trim() || "",
//     MANUAL_MODE: process.env.MANUAL_MODE?.trim() || ""
// }

export const TEAMS_TAB = {
    SEARCH: {
        // ID: process.env.TEAMS_TAB_ID_SEARCH?.trim() || "",
        NAME: "Search",
        URL: "/tab/#/search"
    },
    MY_PROFILE: {
        // ID: process.env.TEAMS_TAB_ID_MYPROFILE?.trim() || "",
        NAME: "My Profile",
        URL: "/tab/#/profile"
    },
    FAVORITES: {
        // ID: process.env.TEAMS_TAB_ID_FAVOURITES?.trim() || "",
        NAME: "Favourites",
        URL: "/tab/#/favorites"
    },
    PARTNER_CONN: {
        // ID: process.env.TEAMS_TAB_ID_PARTNERCONNECTIONS?.trim() || "",
        NAME: "Partner Connections",
        URL: "/tab/#/outgoing"
    },
    API_KEYS: {
        // ID: process.env.TEAMS_TAB_ID_APIKEYS?.trim() || "",
        NAME: "API Keys",
        URL: "/tab/#/incoming"
    }
}

export const ROUTES = {
    SEARCH: "/search",
    MY_PROFILE: "/profile",
    MY_FAVORITES: "/favorites",
    ADMIN_INC_CONN: "/incoming",
    ADMIN_OUT_CONN: "/outgoing",
    USER_DETAILS: "/userDetails",
}