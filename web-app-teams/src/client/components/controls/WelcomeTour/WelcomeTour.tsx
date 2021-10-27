import * as React from "react";
import {
  Flex,
  Dialog,
  Carousel,
  Image,
  Button,
  Divider,
  Text,
  Loader,
} from "@fluentui/react-northstar";
import { useClasses } from "./WelcomeTour.styles";
import UserService from "../../../services/UserService";
import { TEAMS_TAB, LOCAL_STORAGE } from "../../../constants";
import { getCacheKey } from "../../../services/CacheService";
import { useErrorHandling } from "../ErrorBoundary/ErrorBoundary";
import { useContextGetters } from "../../../state";
import DeepLinkService from "../../../../../../common/services/DeepLinkService";
import executeDeepLink from "../../../utilities/deepLinkExe";

interface IWelcomeTourProps {
  isMobile?: boolean;
  children: JSX.Element;
}

export const WelcomeTour = (props: IWelcomeTourProps) => {
  const { getCurrentUser, getEnv } = useContextGetters();
  const classes = useClasses();
  const triggerError = useErrorHandling();
  const currentUser = getCurrentUser();
  const env = getEnv();

  const [slideIndex, setSlideIndex] = React.useState<number>(0);
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);
  const [inProgress, setInProgress] = React.useState<boolean>(false); //May be required in future

  const tourCheckedCacheKey = getCacheKey(currentUser?.UserAadId || "", LOCAL_STORAGE.WELCOME_TOUR);

  const imageAltTags = {
    slide1: "Welcome to GovAddressBook",
    slide2: "Search outside your organisation",
    slide3: "Screenshot of the favourites tab",
  };

  const carouselItemStyles = {
    width: "100%",
  };

  const carouselItems = [
    {
      key: "slide1",
      id: "slide1",
      content: (
        <div 
          className={classes.carouselImage}
          style={{backgroundImage:"url(/assets/slide1.png)"}}
        />
      ),
      "aria-label": imageAltTags.slide1,
      className: classes.carouselItem,
      styles: { carouselItemStyles },
      navigation: false,
      titleText: "Welcome to GovAddressBook",
      contentText:
        "GovAddressBook is a Teams app that makes it easy to find and connect with your colleagues on Teams.",
    },
    {
      key: "slide2",
      id: "slide2",
      content: (
        <div 
          className={classes.carouselImage}
          style={{backgroundImage:"url(/assets/slide2.png)"}}
        />
      ),
      "aria-label": imageAltTags.slide2,
      styles: { carouselItemStyles },
      navigation: false,
      titleText: "Search outside your organisation",
      contentText:
        "Find who exactly who you're looking for, even if they work for a different government department or agency.",
    },
    {
      key: "slide3",
      id: "slide3",
      content: (
        <div 
          className={classes.carouselImage}
          style={{backgroundImage:"url(/assets/slide3.png)"}}
        />
      ),
      "aria-label": imageAltTags.slide3,
      styles: { carouselItemStyles },
      navigation: false,
      titleText: "Connect and collaborate using Teams",
      contentText:
        "GovAddressBook makes it easy to start a chat, call or meeting with someone using the Teams platform.",
    },
  ];

  React.useEffect(() => {
    (async () => {
      if(currentUser){
        try {
          if (!currentUser?.WelcomeTourCompleted) {
            const lastCancelled = localStorage.getItem(tourCheckedCacheKey);
            if (lastCancelled) {
              const date = new Date(lastCancelled);
              date.setDate(date.getDate() + 1);
              if (date < new Date()) {
                return setDialogOpen(true);
              }  
            } else {
              setDialogOpen(true);
            }
          }
        } catch (e) {
          triggerError(e);
        }
      }
    })();
  }, [currentUser]);

  const isLastItem = (): boolean => {
    return slideIndex == carouselItems.length - 1;
  };

  const onFinish = async (): Promise<void> => {
    try {
      setInProgress(true);
      await UserService.finishMyWelcomeTour();
    } catch (error) {
      triggerError(error);
    } finally {
      onCloseDialog();
      setInProgress(false);
    }
  };

  const onCloseDialog = () => {
    setDialogOpen(false);
    localStorage.setItem(tourCheckedCacheKey, String(new Date()));
    if (!currentUser?.Published) {
      const link = DeepLinkService.deepLinkToTab(env.TEAMS_APP_ID, env.TEAMS_TAB_ID_MYPROFILE, TEAMS_TAB.MY_PROFILE.NAME, TEAMS_TAB.MY_PROFILE.URL);
      executeDeepLink(link);
    }
  }

  return (
    <>
      <Dialog
        open={dialogOpen}
        backdrop={true}
        closeOnOutsideClick={false}
        onCancel={() => onCloseDialog()}
        styles={{ padding: "0", width: "35vw" }}
        content={
          <>
            <Carousel
              ariaRoleDescription="carousel"
              ariaLabel="Portrait collection"
              navigation={{
                "aria-label": "people portraits",
                items: carouselItems.map((item, index) => ({
                  key: item.id,
                  "aria-label": imageAltTags[item.id],
                  "aria-controls": item.id,
                })),
              }}
              activeIndex={slideIndex || 0}
              paddleNext={{ disabled: true, hidden: true }}
              paddlePrevious={{ disabled: true, hidden: true }}
              items={carouselItems}
              styles={{ width: "100%" }}
              className={classes.carousel}
              getItemPositionText={(index, size) => `${index + 1} of ${size}`}
            />
            <Flex gap="gap.small">
              <Text
                className={classes.commonContainer}
                weight="bold"
                size="large"
                content={carouselItems[slideIndex].titleText}
              />
            </Flex>
            <Flex gap="gap.small">
              <Text
                className={classes.commonContainer}
                size="large"
                content={carouselItems[slideIndex].contentText}
              />
            </Flex>
            <Divider size={1} className={classes.divider} />
            <Flex className={classes.commonContainer} space="evenly">
              {!inProgress 
              ? <>
                <Button
                  content="Back"
                  secondary
                  disabled={slideIndex < 1}
                  className={classes.navButtons}
                  onClick={() => setSlideIndex(slideIndex - 1)}
                />
                <Button
                  content={isLastItem() ? "Finish" : "Next"}
                  primary
                  disabled={slideIndex >= carouselItems.length}
                  className={classes.navButtons}
                  onClick={() => {
                    isLastItem()
                      ? onFinish()
                      : setSlideIndex(slideIndex + 1);
                  }}
                />
              </>
              : <Loader />
              }
            </Flex>
          </>
        }
      />
      {props.children}
    </>
  );
};
