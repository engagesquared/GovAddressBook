import { IAzSearchResult, ISearchConnection } from "../../../../../common";
import { IRefinerSet, ISelectedRefiners } from "../../components/pages/SearchPage/SearchRefiner";
import { defaultSearchState, ISearchState } from "./models";

const SCOPE = "SEARCH_";

export const ACTIONS = {
    SET_CONNS: SCOPE + "SET_CONNS",
    SET_SEL_CONN: SCOPE + "SET_SEL_CONN",
    SET_REFINERS: SCOPE + "SET_REFINERS",
    SET_SEL_REFINERS: SCOPE + "SET_SEL_REFINERS",
    SET_QUERY: SCOPE + "SET_QUERY",
    SET_SEARCH_RES: SCOPE + "SET_SEARCH_RES",
    SET_STEP: SCOPE + "SET_STEP",
    SET_PAGENUMBER: SCOPE + "SET_PAGENUMBER",
}

export const stateReducer = (state: ISearchState = defaultSearchState, action: { type: string; payload: any }) => {
    const newState = {...state};
    switch (action.type) {
        case ACTIONS.SET_CONNS: {
            newState.connections = action.payload as ISearchConnection[];
            break;
        }
        case ACTIONS.SET_SEL_CONN: {
            newState.selectedConnection = action.payload as ISearchConnection;
            break;
        }
        case ACTIONS.SET_REFINERS: {
            newState.refiners = action.payload as (IRefinerSet | {});
            break;
        }
        case ACTIONS.SET_SEL_REFINERS: {
            newState.selectedRefiners = action.payload as (ISelectedRefiners | {});
            break;
        }
        case ACTIONS.SET_QUERY: {
            newState.queryString = action.payload as (string | undefined);
            break;
        }
        case ACTIONS.SET_SEARCH_RES: {
            newState.searchResult = action.payload as (IAzSearchResult | undefined);
            break;
        }
        case ACTIONS.SET_STEP: {
            newState.step = action.payload as (number);
            break;
        }
        case ACTIONS.SET_PAGENUMBER: {
            newState.pageNumber = action.payload as (number);
            break;
        }
    }
    return newState;
}