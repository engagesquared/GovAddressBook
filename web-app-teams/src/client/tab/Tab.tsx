import * as React from "react";
import * as microsoftTeams from "@microsoft/teams-js";
import axios from "axios";
import { HashRouter, Switch, Route, useHistory } from "react-router-dom";
import { useTeams } from "msteams-react-base-component";
import { APP_ACCESS_TOKEN_HEADER } from "../../common";
import { SearchPage } from "../components/pages/SearchPage/SearchPage";
import { getServerSideToken } from "../services/AuthService";
import { Provider as NorthStarProvider } from "@fluentui/react-northstar";
import { PageLayout } from "../components/controls/PageLayout/PageLayout";
import { ErrorBoundary, useErrorHandling } from "../components/controls/ErrorBoundary/ErrorBoundary";
import DetailedUserPage, { IDetailedUserPageConfig } from "../components/pages/DetailedUserPage/DetailedUserPage";
import { WelcomeTour } from "../components/controls/WelcomeTour/WelcomeTour";
import { MyProfilePage } from "../components/pages/MyProfilePage/MyProfilePage";
import { FavouritesPage } from "../components/pages/FavouritesPage/FavouritesPage";
import { ApiKeysPage } from "../components/pages/ApiKeysPage/ApiKeysPage";
import { PartnerConnectionsPage } from "../components/pages/PartnerConnectionsPage/PartnerConnectionsPage";
import { LOCAL_STORAGE, ROUTES } from "../constants";
import UserService from "../services/UserService";
import { getTheme } from "../utilities/teams";
import { StateProvider, useContextGetters, useContextSetters } from "../state";
import EnvService from "../services/EnvService";
import DeepLinkService from "../../../../common/services/DeepLinkService";
import { getCacheKey } from "../services/CacheService";

export const Tab = () => {
  const [{ theme }] = useTeams();

  return (
    <NorthStarProvider theme={theme}>
      <StateProvider>
        <HashRouter hashType="slash">
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </HashRouter>
      </StateProvider>
    </NorthStarProvider>
  );
};

const App = () => {
  const { getCurrentUser, getEnv } = useContextGetters();
  const { setTeamsTheme, setCurrentUser, setIsMobile, setEnv, setMeIsAdmin, setMeHasTeamsCalling } = useContextSetters();

  const [{ context, inTeams }] = useTeams();
  const triggerError = useErrorHandling();
  const currentUser = getCurrentUser();
  const env = getEnv();
  const history = useHistory();
  const [isInitiated, setIsInitiated] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (inTeams && context) {
      (async () => {
        const serverToken = await getServerSideToken(String(context.userObjectId));
        axios.interceptors.request.use((config) => {
          config.headers[APP_ACCESS_TOKEN_HEADER] = serverToken;
          return config;
        });
        setIsInitiated(true);
      })();
      microsoftTeams.registerOnThemeChangeHandler((themeName: string) => {
        const theme = getTheme(themeName);
        setTeamsTheme(theme.siteVariables.colorScheme);
      });

      const theme = getTheme(context.theme);
      setTeamsTheme(theme.siteVariables.colorScheme);
    }
  }, [inTeams]);

  React.useEffect(() => {
    (async () => {
      if (isInitiated && !currentUser && !Object.keys(env).length && context) {
        const aadId = String(context.userObjectId);
        const envCacheKey = getCacheKey("*", LOCAL_STORAGE.ENV);
        const meCacheKey = getCacheKey(aadId, LOCAL_STORAGE.ME);
        const isAdminCaheKey = getCacheKey(aadId, LOCAL_STORAGE.ME_IS_ADMIN);
        const hasTeamsCallingCaheKey = getCacheKey(aadId, LOCAL_STORAGE.ME_TEAMS_CALLING);

        const envCached = localStorage.getItem(envCacheKey);
        const meCached = localStorage.getItem(meCacheKey);
        if(envCached){ setEnv(JSON.parse(envCached)); }
        if(meCached){ setCurrentUser(JSON.parse(meCached)); }
        setMeIsAdmin(JSON.parse(localStorage.getItem(isAdminCaheKey) || 'false'));
        setMeHasTeamsCalling(JSON.parse(localStorage.getItem(hasTeamsCallingCaheKey) || 'false'));

        (async () => {
          try {
            const [env, me] = await Promise.all([
              EnvService.getEnv(),
              UserService.getMyProfile()
            ]);          
            setEnv(env);
            setCurrentUser(me);            
            localStorage.setItem(envCacheKey, JSON.stringify(env));
            localStorage.setItem(meCacheKey, JSON.stringify(me));
          } catch (e) {
            triggerError(e);
          }
        })();

        (async () => {
          try {
            const [meIsAdmin, meHasTeamsCalling] = await Promise.all([
              UserService.meIsAdmin(),
              UserService.meHasTeamsCallingAccess()
            ]);
            setMeIsAdmin(meIsAdmin);
            setMeHasTeamsCalling(meHasTeamsCalling);
            localStorage.setItem(isAdminCaheKey, String(meIsAdmin));
            localStorage.setItem(hasTeamsCallingCaheKey, String(meHasTeamsCalling));
          } catch (e) {
            triggerError(e);
          }
        })();
      }
    })();
  }, [isInitiated, currentUser, env, context]);

  React.useEffect(() => {
    if (context) {
      const deviceType = context.hostClientType;
      const isMobile = deviceType === microsoftTeams.HostClientType.android || deviceType === microsoftTeams.HostClientType.ios;
      setIsMobile(isMobile);

      const userPageConf = DeepLinkService.getDeepLinkContext<IDetailedUserPageConfig>(context);
      if(userPageConf) {
        history.push({
          pathname: ROUTES.USER_DETAILS,
          state: userPageConf
        });
      }
    }
  }, [context]);

  const isReady: boolean = !!(isInitiated && currentUser);
  return (
    <PageLayout>
      {isReady ? (
        <WelcomeTour>
          <Switch>
            {/* Do not remove this pseudo-contatiner. Routes on mobile don't work without it */}
            <>
              <Route path={ROUTES.SEARCH} component={SearchPage} />
              <Route path={ROUTES.MY_PROFILE} component={MyProfilePage} />
              <Route path={ROUTES.MY_FAVORITES} component={FavouritesPage} />
              <Route path={ROUTES.USER_DETAILS} component={DetailedUserPage} />
              <Route path={ROUTES.ADMIN_OUT_CONN} component={PartnerConnectionsPage} />
              <Route path={ROUTES.ADMIN_INC_CONN} component={ApiKeysPage} />
            </>
          </Switch>
        </WelcomeTour>
      ) : undefined}
    </PageLayout>
  );
}