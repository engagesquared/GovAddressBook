import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";
import axios from "axios";
import { LOCAL_STORAGE } from "../constants";
import { getCacheKey } from "../services/CacheService";

export const getClientSideToken = async (userAadId: string): Promise<string> => {
    let clientSideTokenExpirationTime: number | undefined;
    const cacheKey = getCacheKey(userAadId, LOCAL_STORAGE.CLIENT_TOKEN);    
    const token = localStorage.getItem(cacheKey);
    if (token) {
        const tokenDecoded = jwtDecode(token) as any;
        clientSideTokenExpirationTime = tokenDecoded.exp * 1000;
    }
    if (!token || !clientSideTokenExpirationTime || +clientSideTokenExpirationTime - +new Date() < 60 * 1000) {
        return new Promise((res) => {
            microsoftTeams.authentication.getAuthToken({
                successCallback: (newToken: string) => {
                    localStorage.setItem(cacheKey, newToken);
                    res(newToken);
                },
                failureCallback: (message: string) => {
                    localStorage.removeItem(cacheKey);
                    microsoftTeams.appInitialization.notifyFailure({
                        reason: microsoftTeams.appInitialization.FailedReason.AuthFailed,
                        message
                    });
                },
                // resources: [ENV.REG_APP_ID_URI as string]
            });
        });
    }

    return token;
}

export const getServerSideToken = async (userAadId: string): Promise<string> => {
    let serverSideTokenExpirationTime: number | undefined;
    const cacheKey = getCacheKey(userAadId, LOCAL_STORAGE.SERVER_TOKEN);
    let token: string = localStorage.getItem(cacheKey) || "";
    if (token) {
        const tokenDecoded = jwtDecode(token) as any;
        serverSideTokenExpirationTime = tokenDecoded.exp * 1000;
    }
    if (!token || !serverSideTokenExpirationTime || +serverSideTokenExpirationTime - +new Date() < 60 * 1000) {
        const clientSideToken = await getClientSideToken(userAadId);
        const res = await axios.post("/api/token", { ssoToken: clientSideToken });
        token = res.data;
        localStorage.setItem(cacheKey, token);
    }
    microsoftTeams.appInitialization.notifySuccess();
    return token;
}

