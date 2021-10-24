import * as React from "react";
import { Grid } from "@fluentui/react-northstar";
import { useClasses } from "./UserCardsList.styles";
import { IExtendedUserFavourite, UserCard } from "./UserCard";
import { useContextGetters } from "../../../state";

interface IUserCardsListProps {
  users: IExtendedUserFavourite[];
  onDeleteFav: (fav: IExtendedUserFavourite) => Promise<void>;
  onAddFav?: (fav: IExtendedUserFavourite) => Promise<void>;
}

export const UserCardsList = (props: IUserCardsListProps) => {
  const { getIsMobile } = useContextGetters();
  const classes = useClasses();
  const isMobile = getIsMobile();

  return (
    <div className={classes.userCardsContainer}>
      <Grid className={classes.gridCardsContainer} columns={isMobile ? 1 : 2}>
        {props.users.map((u, idx) =>
          <UserCard
            key={idx}
            user={u}
            isMobile={isMobile}
            isFavUser={!!u.IsFavourite}
            onAddFav={props.onAddFav}
            onDeleteFav={props.onDeleteFav}
          />
        )}
      </Grid>
    </div>
  );
};
