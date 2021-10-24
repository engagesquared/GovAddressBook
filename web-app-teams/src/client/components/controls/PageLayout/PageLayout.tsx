import * as React from "react";
import { Flex, Loader } from "@fluentui/react-northstar";
import { useClasses } from "./PageLayout.styles";
import { useContextGetters } from "../../../state";


interface IPageLayoutProps {
  children: JSX.Element | undefined;
}

export const PageLayout = ({ children }: IPageLayoutProps) => {
  const { getIsMobile } = useContextGetters();
  const classes = useClasses();
  const isMobile = getIsMobile();

  return ( children 
    ? <Flex className={isMobile ? classes.commonContainerMobile : classes.commonContainer}>
      {children}
    </Flex>
    : <Flex hAlign={"center"} className={isMobile ? classes.commonContainerMobile : classes.commonContainer}>
      {<Loader />} 
    </Flex>
  );
};
