import { IClientEnvConfig, IDBUserProfileInternal, IUserFavourite } from "../../../../../common";
import { useDispatch } from 'react-redux';
import { ITeamsColorSchema } from "../../utilities/teams";
import { ACTIONS } from "./reducer";

export const stateSetters = () => {
    const dispatch = useDispatch();
    
    const setIsMobile = (val: boolean) => {
        dispatch({ type: ACTIONS.SET_IS_MOBILE, payload: val });
    }

    const setTeamsTheme = (val: ITeamsColorSchema) => {
        dispatch({ type: ACTIONS.SET_TEAMS_THEME, payload: val });
    }

    const setCurrentUser = (val: IDBUserProfileInternal) => {
        dispatch({ type: ACTIONS.SET_CURR_USER, payload: val });
    }

    const setFavourites = (val: IUserFavourite[]) => {
        dispatch({ type: ACTIONS.SET_CURR_USER_FAV, payload: val });
    }
    
    const setEnv = (val: IClientEnvConfig) => {
        dispatch({ type: ACTIONS.SET_ENV, payload: val });
    }
    
    const setMeIsAdmin = (val: boolean) => {
        dispatch({ type: ACTIONS.SET_CURR_USER_IS_ADMIN, payload: val });
    }
    
    const setMeHasTeamsCalling = (val: boolean) => {
        dispatch({ type: ACTIONS.SET_CURR_USER_HAS_TEAMS_CALLING, payload: val });
    }

    return {
        setIsMobile,
        setTeamsTheme,
        setCurrentUser,
        setFavourites,
        setEnv,
        setMeIsAdmin,
        setMeHasTeamsCalling
    }
}