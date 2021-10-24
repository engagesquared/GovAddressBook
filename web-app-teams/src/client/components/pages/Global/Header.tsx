import * as React from "react";
import { withRouter } from "react-router-dom";
import { Flex, Menu, tabListBehavior, Text } from "@fluentui/react-northstar";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../constants";
import { useHistory } from "react-router-dom";

export const Header = withRouter(() => {
  const history = useHistory();

  return (
    <Flex gap={"gap.medium"}>
      {/* <Link to={ROUTES.search} style={{ textDecoration: "none" }}>
        <Text weight="regular" size="large">
          Search
        </Text>
      </Link> */}
      {/* <Link to={ROUTES.myProfile} style={{ textDecoration: "none" }}>
        <Text weight="regular" size="large">
          My Profile
        </Text>
      </Link> */}
      {/* <Link to={ROUTES.favourites} style={{ textDecoration: "none" }}>
        <Text weight="regular" size="large">
          Favourites
        </Text>
      </Link> */}
      {/* <Link to={ROUTES.partnerConnections} style={{ textDecoration: "none" }}>
        <Text weight="regular" size="large">
          Partner Connections
        </Text>
      </Link>
      <Link to={ROUTES.apiKeys} style={{ textDecoration: "none" }}>
        <Text weight="regular" size="large">
          API Keys
        </Text>
      </Link> */}
    </Flex>
  );
});
