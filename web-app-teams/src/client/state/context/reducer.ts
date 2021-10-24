import { IClientEnvConfig, IDBUserProfileInternal, IUserFavourite } from "../../../../../common";
import { ITeamsColorSchema } from "../../utilities/teams";
import { defaultContext, IContextState } from "./models";

const SCOPE = "CONTEXT_";

export const ACTIONS = {
    SET_CURR_USER: SCOPE + "SET_CURR_USER",
    SET_CURR_USER_FAV: SCOPE + "SET_CURR_USER_FAV",
    SET_IS_MOBILE: SCOPE + "SET_IS_MOBILE",
    SET_TEAMS_THEME: SCOPE + "SET_TEAMS_THEME",
    SET_ENV: SCOPE + "SET_ENV",
    SET_CURR_USER_IS_ADMIN: SCOPE + "SET_CURR_USER_IS_ADMIN",
    SET_CURR_USER_HAS_TEAMS_CALLING: SCOPE + "SET_CURR_USER_HAS_TEAMS_CALLING",
}

export const stateReducer = (state: IContextState = defaultContext, action: { type: string; payload: any }) => {
    const newState = state;
    switch (action.type) {
        case ACTIONS.SET_CURR_USER: {
            newState.me = action.payload as IDBUserProfileInternal;
            break;
        }
        case ACTIONS.SET_CURR_USER_FAV: {
            newState.favourites = action.payload as IUserFavourite[];
            break;
        }
        case ACTIONS.SET_IS_MOBILE: {
            newState.isMobile = action.payload as boolean;
            break;
        }
        case ACTIONS.SET_TEAMS_THEME: {
            newState.theme = action.payload as (ITeamsColorSchema);
            break;
        }
        case ACTIONS.SET_ENV: {
            newState.env = action.payload as (IClientEnvConfig);
            break;
        }
        case ACTIONS.SET_CURR_USER_IS_ADMIN: {
            newState.meIsAdmin = action.payload as (boolean);
            break;
        }
        case ACTIONS.SET_CURR_USER_HAS_TEAMS_CALLING: {
            newState.meHasTeamsCalling = action.payload as (boolean);
            break;
        }
    }
    return newState;
}