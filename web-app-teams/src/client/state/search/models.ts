
import { IAzSearchResult, ISearchConnection } from "../../../../../common";
import { IRefinerSet, ISelectedRefiners } from "../../components/pages/SearchPage/SearchRefiner";

export interface ISearchState {
    connections: ISearchConnection[];
    selectedConnection: ISearchConnection | undefined;
    refiners: IRefinerSet | {};
    selectedRefiners: ISelectedRefiners | {};
    queryString: string | undefined;
    searchResult: IAzSearchResult | undefined;
    step: number;
    pageNumber: number;
}

export const defaultSearchState: ISearchState = {
    connections: [],
    selectedConnection: undefined,
    refiners: {},
    selectedRefiners: {},
    queryString: undefined,
    searchResult: undefined,
    step: 20,
    pageNumber: 0,
}