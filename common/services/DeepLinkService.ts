import { tryParseJson } from "../utilities/JsonHelper";
import { Context } from '@microsoft/teams-js';
interface IDeepLinkContext {
    channelId: string;
    subEntityId: string;
}

export interface IDetailedUserPageDeepLink {
    aadId: string;
    connectionId?: number;
}

type IDeepLinkSubEntity = IDetailedUserPageDeepLink;

export default class DeepLinkService {
    public static deepLinkChatWithUser(userPrincipalName: string): string {
        return `https://teams.microsoft.com/l/chat/0/0?users=${userPrincipalName}`;
    }

    public static deepLinkCallTeamsWithUser(userPrincipalName: string): string {
        return `https://teams.microsoft.com/l/call/0/0?users=${userPrincipalName}`;
    }

    public static deepLinkVideoWithUser(userPrincipalName: string): string {
        return `https://teams.microsoft.com/l/call/0/0?users=${userPrincipalName}&withVideo=true`;
    }

    public static deepLinkTeamsCalling(userPhoneNumber: string): string {
        //${userPrincipalName},   userPrincipalName: string, 
        return `https://teams.microsoft.com/l/call/0/0?users=4:${userPhoneNumber}`;
    }

    public static deepLinkMeetingDialog(userPrincipalName: string): string {
        return `https://teams.microsoft.com/l/meeting/new?subject=New%20Meeting&attendees=${userPrincipalName}`;
    }

    public static deepLinkToTab(appId: string, tabId: string, tabName: string, tabUrl: string, subEntity?: IDeepLinkSubEntity): string {
        const encodedEntityId = encodeURI(tabId);
        const encodedEntityLabel = encodeURIComponent(tabName);
        const encodedEntityUrl = encodeURIComponent(tabUrl);

        let encodedContext: string = "personalTab";
        if (subEntity) {
            const deepLinkContext: IDeepLinkContext = {
                subEntityId: JSON.stringify(subEntity),
                channelId: ""
            };
            encodedContext = encodeURIComponent(JSON.stringify(deepLinkContext));
        }
        
        // eslint-disable-next-line max-len
        const result = `https://teams.microsoft.com/l/entity/${appId}/${encodedEntityId}?webUrl=${encodedEntityUrl}&label=${encodedEntityLabel}&context=${encodedContext}`;
        return result;
    }

    public static getDeepLinkContext<T extends IDeepLinkSubEntity>(teamsCtx: Context):T | undefined {
        const strValue = teamsCtx.subEntityId || "";
        const value = tryParseJson<T | undefined>(strValue, undefined);
        return value;
    };
}