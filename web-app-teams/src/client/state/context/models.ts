import { teamsV2Theme } from "@fluentui/react-northstar";
import { IClientEnvConfig, IDBUserProfileInternal, IUserFavourite } from "../../../../../common";
import { ITeamsColorSchema } from "../../utilities/teams";
export interface IContextState {
    me: IDBUserProfileInternal | undefined;
    meIsAdmin: boolean;
    meHasTeamsCalling: boolean;
    favourites: IUserFavourite[];
    isMobile: boolean;
    theme: ITeamsColorSchema;
    env: IClientEnvConfig;
}

export const defaultContext: IContextState = {
    me: undefined,
    meIsAdmin: false,
    meHasTeamsCalling: false,
    favourites: [],
    isMobile: false,
    theme: teamsV2Theme.siteVariables.colorScheme,
    env: {} as IClientEnvConfig
}