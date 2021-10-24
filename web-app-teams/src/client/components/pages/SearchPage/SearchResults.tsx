import * as React from "react";
import { Flex, Loader, Text, Button } from "@fluentui/react-northstar";
import { IAzSearchUserProfile, ISearchConnection, IUserFavourite, IUserProfile } from "../../../../../../common";
import { UserCardsList } from "../../controls/UserCards/UserCardsList";
import { NoResults } from "./NoResults";
import { IExtendedUserFavourite } from "../../controls/UserCards/UserCard";
import { useContextGetters } from "../../../state";
import { useClasses } from "./SearchPage.styles";

export interface ISearchResultsProps {
    inProgress: boolean;
    pageNumber: number;
    results: IAzSearchUserProfile[];
    totalCount: number;
    favUsers: IUserFavourite[];
    isStartView: boolean;
    connection?: ISearchConnection;
    onDeleteFav: (newFavourite: IExtendedUserFavourite) => Promise<void>;
    onAddFav?: (newFavourite: IExtendedUserFavourite) => Promise<void>;
    onLoadMore: () => void;
}

export const SearchResults = ({
    inProgress, 
    pageNumber,
    results, 
    totalCount, 
    favUsers, 
    connection, 
    isStartView, 
    onDeleteFav, 
    onAddFav,
    onLoadMore
}: ISearchResultsProps) => {
    const { getIsMobile } = useContextGetters();
    const isMobile = getIsMobile();
    const classes = useClasses();

    const extResults: IExtendedUserFavourite[] = React.useMemo(() => {
        const res = results.map(u => {
            const extUser: IExtendedUserFavourite = {
                ...(u as IUserProfile),
                IsFavourite: !!favUsers.find(fav => fav.UserAadId === u.UserAadId),
                PartnerOutgoingConnectionId: connection?.Id
            };
            return extUser;
        });
        return res;
    },[results, favUsers, connection]);

    const showMainLoader = (inProgress && !pageNumber);
    const showLoadMore = (results.length < totalCount) && (!inProgress);
    const showLoadMoreLoader = (!!pageNumber && inProgress);
    return (<Flex column>
        {showMainLoader
            ? <Loader />
            : totalCount 
                ? <>
                    <Text size="medium" content={`Showing ${results.length} of ${totalCount} results`} />
                    <UserCardsList
                        users={extResults}
                        onAddFav={onAddFav}
                        onDeleteFav={onDeleteFav}
                    />
                    {showLoadMore && <Button onClick={onLoadMore} className={classes.buttonPagination} content="Load more" />}
                    {showLoadMoreLoader && <Loader className={classes.buttonPagination} />}
                </> 
                : <Flex column gap="gap.small"><NoResults isStartView={isStartView} /></Flex>
        }
    </Flex>);
}