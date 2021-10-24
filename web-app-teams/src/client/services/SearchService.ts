import { IAzSearchRequest, IAzSearchResult } from "../../../../common";
import { 
    search as searchApi,
    extSearch as extSearchApi
} from "../apis";

export default class SearchService {
    public static async searchUsers(request: IAzSearchRequest): Promise<IAzSearchResult | undefined> {
        try {
            const result = await searchApi(request);
            return result;
        } catch (error) {
            throw Error(error.message);
        }
    }

    public static async searchUsersExt(connectionId: number, request: IAzSearchRequest): Promise<IAzSearchResult | undefined> {
        try {
            const result = await extSearchApi(connectionId, request);
            return result;
        } catch (error) {
            throw Error(error.message);
        }
    }
}