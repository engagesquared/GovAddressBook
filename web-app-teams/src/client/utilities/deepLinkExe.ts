import * as microsoftTeams from "@microsoft/teams-js";

export default function executeDeepLink(str: string) {
    microsoftTeams.executeDeepLink(str);
}