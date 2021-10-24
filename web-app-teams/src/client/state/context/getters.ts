import { IClientEnvConfig, IDBUserProfileInternal, IUserFavourite } from "../../../../../common";
import { ITeamsColorSchema } from "../../utilities/teams";
import { useSelector } from 'react-redux';
import { IRootState } from "../provider";

export const stateSelectors = () => {

    const getIsMobile = (): boolean => {
        return useSelector<IRootState, boolean>(root => root.context.isMobile);
    }

    const getCurrentUser = (): IDBUserProfileInternal | undefined => {
        return useSelector<IRootState, IDBUserProfileInternal | undefined>(root => root.context.me);
    }

    const getFavourites = (): IUserFavourite[] => {
        return useSelector<IRootState, IUserFavourite[]>(root => root.context.favourites);
    }

    const getTeamsTheme = (): ITeamsColorSchema => {
        return useSelector<IRootState, ITeamsColorSchema>(root => root.context.theme);
    }    
    
    const getEnv = (): IClientEnvConfig => {
        return useSelector<IRootState, IClientEnvConfig>(root => root.context.env);
    }

    const getMeIsAdmin = (): boolean => {
        return useSelector<IRootState, boolean>(root => root.context.meIsAdmin);
    }

    const getMeHasTeamsCalling = (): boolean => {
        return useSelector<IRootState, boolean>(root => root.context.meHasTeamsCalling);
    }

    return {
        getIsMobile,
        getCurrentUser,
        getFavourites,
        getTeamsTheme,
        getEnv,
        getMeIsAdmin,
        getMeHasTeamsCalling
    }
}