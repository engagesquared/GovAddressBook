import { IAzSearchResult, ISearchConnection } from "../../../../../common";
import { IRefinerSet, ISelectedRefiners } from "../../components/pages/SearchPage/SearchRefiner";
import { useSelector } from 'react-redux';
import { IRootState } from "../provider";

export const stateSelectors = () => {

    const getСonnections = (): ISearchConnection[] => {
        return useSelector<IRootState, ISearchConnection[]>(root => root.search.connections);
    }

    const getSelСonnection = (): ISearchConnection | undefined => {
        return useSelector<IRootState, ISearchConnection | undefined>(root => root.search.selectedConnection);
    }

    const getRefiners = (): IRefinerSet | {} => {
        return useSelector<IRootState, IRefinerSet | {}>(root => root.search.refiners);
    }

    const getSelRefiners = (): ISelectedRefiners | {} => {
        return useSelector<IRootState, ISelectedRefiners | {}>(root => root.search.selectedRefiners);
    }

    const getQueryString = (): string | undefined => {
        return useSelector<IRootState, string | undefined>(root => root.search.queryString);
    }
    
    const getSearchResults = (): IAzSearchResult | undefined => {
        return useSelector<IRootState, IAzSearchResult | undefined>(root => root.search.searchResult);
    }

    const getStep = (): number => {
        return useSelector<IRootState, number >(root => root.search.step);
    }

    const getPageNumber = (): number => {
        return useSelector<IRootState, number >(root => root.search.pageNumber);
    }

    return {
        getСonnections,
        getSelСonnection,
        getRefiners,
        getSelRefiners,
        getQueryString,
        getSearchResults,
        getStep,
        getPageNumber
    }
}