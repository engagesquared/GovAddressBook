import { useDispatch } from 'react-redux';
import { ACTIONS } from "./reducer";
import { IAzSearchResult, ISearchConnection } from "../../../../../common";
import { IRefinerSet, ISelectedRefiners } from "../../components/pages/SearchPage/SearchRefiner";

export const stateSetters = () => {
    const dispatch = useDispatch();

    const setConnections = (val: ISearchConnection[]) => {
        dispatch({ type: ACTIONS.SET_CONNS, payload: val });
    }

    const setSelConnection = (val: ISearchConnection | undefined) => {
        dispatch({ type: ACTIONS.SET_SEL_CONN, payload: val });
    }

    const setRefiners = (val: IRefinerSet | {}) => {
        dispatch({ type: ACTIONS.SET_REFINERS, payload: val });
    }

    const setSelRefiners = (val: ISelectedRefiners | {}) => {
        dispatch({ type: ACTIONS.SET_SEL_REFINERS, payload: val });
    }

    const setQueryString = (val: string | undefined) => {
        dispatch({ type: ACTIONS.SET_QUERY, payload: val });
    }
    
    const setSearchResults = (val: IAzSearchResult | undefined) => {
        dispatch({ type: ACTIONS.SET_SEARCH_RES, payload: val });
    }

    const setStep = (val: number) => {
        dispatch({ type: ACTIONS.SET_STEP, payload: val });
    }

    const setPageNumber = (val: number) => {
        dispatch({ type: ACTIONS.SET_PAGENUMBER, payload: val });
    }

    return {
        setConnections,
        setSelConnection,
        setRefiners,
        setSelRefiners,
        setQueryString,
        setSearchResults,
        setStep,
        setPageNumber
    }
}