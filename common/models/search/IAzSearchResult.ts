import { FacetResult } from "@azure/search-documents";
import { IAzSearchUserProfile } from "./IAzSearchUserProfile";

export interface IAzSearchResult {
    values: IAzSearchUserProfile[];
    facets: { [propertyName: string]: FacetResult[];} | undefined;
    count?: number | undefined;
    coverage?: number | undefined;
}