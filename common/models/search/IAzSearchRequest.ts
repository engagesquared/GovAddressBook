import { SearchOptions } from "@azure/search-documents";
import { IAzSearchUserProfile } from "./IAzSearchUserProfile";

export interface IAzSearchRequest {
    query: string;
    options?: SearchOptions<keyof IAzSearchUserProfile>;
}