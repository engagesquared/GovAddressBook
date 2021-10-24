import * as React from "react";
import { SearchIcon } from "@fluentui/react-icons-northstar";
import { Input, Loader, Alert, Flex } from "@fluentui/react-northstar";
import { IUserFavourite, IUserProfile } from "../../../../../../common";
import UserService from "../../../services/UserService";
import { UserCardsList } from "../../controls/UserCards/UserCardsList";
import { useClasses } from "./FavouritesPage.styles";
import { useErrorHandling } from "../../controls/ErrorBoundary/ErrorBoundary";
import { IExtendedUserFavourite } from "../../controls/UserCards/UserCard";
import { useContextGetters, useContextSetters } from "../../../state";

export const FavouritesPage = () => {
  const { getIsMobile, getCurrentUser, getFavourites } = useContextGetters();
  const { setFavourites } = useContextSetters();
  const classes = useClasses();
  const triggerError = useErrorHandling();
  const currentUser = getCurrentUser();
  const isMobile = getIsMobile();
  const favourites = getFavourites();

  const [searchText, setSearchText] = React.useState<string | undefined>();
  const [inProgress, setInProgress] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        if(!favourites || !favourites.length){
          setInProgress(true);
          const favs = await UserService.getMyFavourites();
          setFavourites(favs || []);
        }
      } catch (e) {
        triggerError(e);
      } finally {
        setInProgress(false);
      }
    })();
  }, []);

  const onInputChange = React.useCallback((ev, data) => { setSearchText(data?.value); }, [setSearchText]);
  const onDeleteFav = React.useCallback(async (deletedFavourite: IUserFavourite) => {
    try {
      await UserService.deleteMyFavourite(deletedFavourite);
      const favs = favourites.filter(f => f.Id !== deletedFavourite.Id);
      setFavourites(favs);
    } catch (error) {
      triggerError(error);
    }
  },[favourites]);

  const favsToShow: IExtendedUserFavourite[] = React.useMemo(() => {
    let result: IExtendedUserFavourite[] = [...favourites];
    if(searchText) {
      result = result.filter(f => 
        f.DisplayName.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()));
    }
    return result.map(o => { o.IsFavourite = true; return o; });
  }, [favourites, searchText]);

  const pageIsReady: boolean = !!(!inProgress && currentUser?.Id);
  const inputIsActive: boolean = pageIsReady && !!favourites.length;
  const hasResultsToShow: boolean = !!(favsToShow.length);
  
  return (
    // mobile and desktop share same view as there is not many changes
    <Flex className={isMobile ? classes.favouritesContainerMobile : classes.favouritesContainer} column gap="gap.medium">
      <Flex className={isMobile ? classes.searchContainerMobile : classes.searchContainer}>
        <Input 
          placeholder="Search your favourites" 
          icon={<SearchIcon />} 
          iconPosition="start"
          fluid 
          onChange={onInputChange} 
          disabled={!inputIsActive}
        />
      </Flex>
      {pageIsReady 
      ? (hasResultsToShow 
        ? <UserCardsList
            users={favsToShow} 
            onDeleteFav={onDeleteFav}
          /> 
        : <Alert content={"No favourites to show."} />)
      : <Loader />}
    </Flex>
  );
};