import * as React from "react";
import {
  IAzSearchRequest,
  IAzSearchResult,
  IUserFavourite
} from "../../../../../../common";
import SearchService from "../../../services/SearchService";
import UserService from "../../../services/UserService";
import { useErrorHandling } from "../../controls/ErrorBoundary/ErrorBoundary";
import { Avatar, Button, Text, Flex, Popup } from "@fluentui/react-northstar";
import { useClasses } from "./SearchPage.styles";
import { ISearchConnection } from "../../../../../../common/models/api/ISearchConnection";
import ConnectionService from "../../../services/ConnectionService";
import { SearchResults } from "./SearchResults";
import { IRefinerSet, ISelectedRefiners, SearchRefiner } from "./SearchRefiner";
import { SearchBox } from "./SearchBox";
import { TEAMS_TAB, LOCAL_STORAGE } from "../../../constants";
import { useContextGetters, useContextSetters, useSearchGetters, useSearchSetters } from "../../../state";
import { debounce } from "../../../utilities/debounce";
import DeepLinkService from "../../../../../../common/services/DeepLinkService";
import executeDeepLink from "../../../utilities/deepLinkExe";
import { buildFilter, buildFuzzQuery } from "../../../utilities/search";
import { CustomAvatar } from "../../controls/CustomAvatar/CustomAvatar";
import { getCacheKey } from "../../../services/CacheService";

let queryLocked: boolean = false;
export const SearchPage = () => {
  const { setFavourites } = useContextSetters();
  const { getCurrentUser, getIsMobile, getFavourites, getEnv } = useContextGetters();
  const { setConnections, setQueryString, setRefiners, setSearchResults, setSelRefiners, setSelConnection, setStep, setPageNumber } = useSearchSetters();
  const { getСonnections, getQueryString, getRefiners, getSearchResults, getSelRefiners, getSelСonnection, getStep, getPageNumber } = useSearchGetters();

  const classes = useClasses();
  const triggerError = useErrorHandling();
  const currentUser = getCurrentUser();
  const env = getEnv();
  const isMobile = getIsMobile();

  const favourites = getFavourites();
  const connections = getСonnections();
  const selectedConnection = getSelСonnection();
  const refiners = getRefiners();
  const selectedRefiners = getSelRefiners();
  const queryString = getQueryString();
  const searchResult = getSearchResults();

  const step = getStep();
  const pageNumber = getPageNumber();

  const [inProgress, setInProgress] = React.useState<boolean>(true);

  const debouncedQuery = debounce<string | undefined>(queryString, 500);
  const debouncedSelectedRefiners = debounce<ISelectedRefiners>(selectedRefiners, 500);
  
  const historySearchCacheKey = getCacheKey(String(currentUser?.UserAadId), LOCAL_STORAGE.HISTORY_SEARCH);

  React.useEffect(() => {
    const dataLocalStorageStr: string | null = localStorage.getItem(historySearchCacheKey);
    let result: Array<string> = JSON.parse(dataLocalStorageStr || "[]");

    if (debouncedQuery) {
      const filteredHistoryLocalStorage: string[] = result.filter((historyItem) => historyItem.startsWith(debouncedQuery));
      if (!filteredHistoryLocalStorage.length) {
        result.unshift(debouncedQuery);
        result = result.slice(0, 5);
        localStorage.setItem(historySearchCacheKey, JSON.stringify(result));
      }
    }
  }, [debouncedQuery]);

  React.useEffect(() => {
    (async () => {
      try {
        if (!connections.length) {
          setInProgress(true);
          const result = await ConnectionService.getConnections();
          setConnections(result || []);
        }
      } catch (e) {
        triggerError(e);
      } finally {
        setInProgress(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const userFavs: IUserFavourite[] | undefined = await UserService.getMyFavourites();
        setFavourites(userFavs || []);
      } catch (e) {
        triggerError(e);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!debouncedQuery || queryLocked) { return; }
      
      try {
        setInProgress(true);
        const filter: string = buildFilter(debouncedSelectedRefiners);
        const fuzzQueryString: string = buildFuzzQuery(debouncedQuery);
        const request: IAzSearchRequest = {
          query: fuzzQueryString,
          options: {
            filter: filter, //"JobTitle eq '' and OfficeLocation eq 'Melbourne'",
            facets: ["JobTitle", "DepartmentName"],
            queryType: "full", // "simple" "full"
            searchMode: "all", // "any" "all"
            includeTotalCount: true,
            top: step, //count for items for fetch
            skip: step * pageNumber //skip fetching items
          },
        };

        let result: IAzSearchResult | undefined;
        if (selectedConnection?.Id) {
          result = await SearchService.searchUsersExt(selectedConnection.Id, request);
        } else {
          result = await SearchService.searchUsers(request);
        }
        // isAppending ()
        // console.log("existing search", searchResult);
        // console.log("result search", result);

        // todo update way to update is appendData so this method triggers after first load more 
        if (!!pageNumber) {
          if (result && searchResult) {
            const combinedResults: IAzSearchResult = {
              count: searchResult.count,
              facets: searchResult.facets,
              values: searchResult.values.concat(result.values)
            }
            setSearchResults(combinedResults);
          }
        } else {
          setSearchResults(result);
        }
        
        if(!Object.keys(refiners).length){
          setRefiners(result?.facets || {});
        }

        queryLocked = true;
      } catch (e) {
        triggerError(e);
      } finally {
        setInProgress(false);
      }
    })();
  }, [debouncedQuery, debouncedSelectedRefiners, selectedConnection, pageNumber]);

  const searchHistory: Array<string> = React.useMemo(() => {
    const dataLocalStorageStr: string | null = localStorage.getItem(historySearchCacheKey);
    let result: Array<string> = JSON.parse(dataLocalStorageStr || "[]");
    if (queryString) {
      result = result.filter((resItem) => resItem.startsWith(queryString));
    }
    return result;
  }, [queryString])

  const onAddFav = async (fav: IUserFavourite) => {
    try {
      await UserService.addMyFavourite(fav);
      setFavourites([...favourites, fav]);
    } catch (error) {
      triggerError(error);
    }
  };

  const onDeleteFav = async (fav: IUserFavourite) => {
    try {
      await UserService.deleteMyFavourite(fav);
      setFavourites(favourites.filter(f => f.UserAadId !== fav.UserAadId));
    } catch (error) {
      triggerError(error);
    }
  };

  const onSearchChange = React.useCallback((val: string | undefined) => {
    setQueryString(val || "");
    setRefiners({});
    setSelRefiners({});
    setPageNumber(0);
    setSearchResults(undefined);
    queryLocked = false;
  }, []);

  const onConnectionChange = React.useCallback((val: ISearchConnection | undefined) => {
    setSelConnection(val);
    setRefiners({});
    setSelRefiners({});
    setPageNumber(0);
    setSearchResults(undefined);
    queryLocked = false;
  }, []);

  const onRefinerChange = React.useCallback((val: ISelectedRefiners) => {
    setSelRefiners(val);
    setPageNumber(0);
    queryLocked = false;
  }, []);

  const onLoadMore = React.useCallback(() => {
    setPageNumber(pageNumber + 1);
    queryLocked = false;
  }, [pageNumber]);

  const isStartView: boolean = React.useMemo(() => {
    return !searchResult;
  }, [searchResult]);

  return (
    <>
      <Flex column>
        <Flex gap="gap.medium" >
          <Flex column className={isMobile ? classes.searchContainerMobile : classes.leftColumn}>
            <SearchBox
              disabled={false}
              searchVal={queryString}
              connections={connections || []}
              connectionVal={selectedConnection}
              onSearchChange={onSearchChange}
              onConnectionChange={onConnectionChange}
              searchHistory={searchHistory}
            />
          </Flex>
          {currentUser && !isMobile ?
            <Flex column className={classes.rightColumn}>
              <Flex className={classes.profileContainer}>
                <Flex column gap="gap.smaller">
                  <Text className={classes.profileItem} weight="bold" size="large" content={currentUser.DisplayName} />
                  {currentUser.JobTitle && (
                    <Text className={classes.profileItem} size="medium" content={currentUser.JobTitle} />
                  )}
                  <Button
                    className={classes.profileItem}
                    size="small"
                    disabled={inProgress}
                    primary
                    content="Edit Profile"
                    onClick={() => {
                      const link = DeepLinkService.deepLinkToTab(env.TEAMS_APP_ID, env.TEAMS_TAB_ID_MYPROFILE, TEAMS_TAB.MY_PROFILE.NAME, TEAMS_TAB.MY_PROFILE.URL);
                      executeDeepLink(link);
                    }}
                  />
                </Flex>
                <CustomAvatar 
                  aadId={currentUser.UserAadId}
                  className={classes.profileAvatar}
                  size="larger"  
                  name={currentUser.DisplayName}
                />
              </Flex>
            </Flex>
            : null}
        </Flex>
        <Flex gap="gap.medium">
          <Flex column className={isMobile ? classes.searchContainerMobile : classes.leftColumn}>
            {isMobile ?
              <SearchRefiner
                isMobile={true}
                refiners={refiners}
                selected={selectedRefiners}
                isStartView={isStartView}
                onChange={onRefinerChange}
              />
              : null}
            <SearchResults
              inProgress={inProgress}
              pageNumber={pageNumber}
              results={searchResult?.values || []}
              totalCount={searchResult?.count || 0}
              favUsers={favourites}
              connection={selectedConnection}
              isStartView={isStartView}
              onDeleteFav={onDeleteFav}
              onAddFav={onAddFav}
              onLoadMore={onLoadMore}
            />
          </Flex>
          {!isMobile ?
            <Flex column className={classes.rightColumn}>
              <SearchRefiner
                isMobile={false}
                refiners={refiners}
                selected={selectedRefiners}
                isStartView={isStartView}
                onChange={onRefinerChange}
              />
            </Flex>
            : null}
        </Flex>
      </Flex>
    </>
  );
};