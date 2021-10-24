import * as React from "react";
import {
  Avatar,
  Button,
  Card,
  Flex,
  Loader,
  StarIcon,
  Text,
} from "@fluentui/react-northstar";
import { IUserFavourite } from "../../../../../../common";
import { useClasses } from "./UserCard.styles";
import { useHistory } from "react-router-dom";
import { ROUTES } from "../../../constants";
import { IDetailedUserPageConfig } from "../../pages/DetailedUserPage/DetailedUserPage";
import { CustomAvatar } from "../CustomAvatar/CustomAvatar";

export interface IExtendedUserFavourite extends IUserFavourite {
  IsFavourite?: boolean;
}

export interface IUserCardProps {
  user: IExtendedUserFavourite;
  isFavUser: boolean;
  isMobile: boolean;
  onDeleteFav: (fav: IExtendedUserFavourite) => Promise<void>;
  onAddFav?: (fav: IExtendedUserFavourite) => Promise<void>;
}

export const UserCard = ({
  user,
  isFavUser,
  isMobile,
  onDeleteFav,
  onAddFav,
}: IUserCardProps) => {
  const history = useHistory();
  const classes = useClasses();
  const [inProgress, setInProgress] = React.useState<boolean>(false);

  const onConfirm = async () => {

    try {
      setInProgress(true);
      if (!isFavUser && onAddFav && typeof onAddFav === "function") {
        await onAddFav(user);
      } else {
        await onDeleteFav(user);
      }
    } catch (error) {
    } finally {
      setInProgress(false);
    }
  };

  const onCardClick = () => {
    const state: IDetailedUserPageConfig = {
      aadId: user.UserAadId,
      connectionId: user.PartnerOutgoingConnectionId
    };
    history.push({
      pathname: ROUTES.USER_DETAILS,
      state: state
    });
  }

  return (
    <Card
      className={isMobile ? classes.userCardContainerMobile : classes.userCardContainer}
    >
      <Card.Header fitted>
        <Flex space="between">
          <Flex className={classes.contentContainer} onClick={onCardClick} gap="gap.small">
            <Flex vAlign={"center"} column>
              <CustomAvatar aadId={user.UserAadId} connectionId={user.PartnerOutgoingConnectionId} name={user.DisplayName} size={"medium"}/>
            </Flex>
            <Flex vAlign={"center"} column>
              <Text className={classes.cardText} content={user.DisplayName} weight="bold" />
              {user.JobTitle && <Text className={classes.cardText} content={user.JobTitle} size="small" />}
            </Flex>
          </Flex>
          {!inProgress ? (
            <Button
              className={isFavUser ? classes.buttonIconOutlineOnHoverIsFavourite : classes.buttonIconOutlineOnHover}
              icon={<StarIcon />}
              iconOnly
              text
              title={isFavUser ? "Remove a favourite" : "Make a favourite"}
              onClick={onConfirm}
            />
          ) : (
            <Loader className={classes.buttonIconOutlineOnHoverIsFavourite} size={"smallest"} />
          )}
        </Flex>
      </Card.Header>
    </Card>
  );
};