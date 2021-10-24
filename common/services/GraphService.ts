import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ROLE } from '../constants';
import { IMailboxSettings } from '../models/graph/IMailboxSettings';
import { IGraphUser } from '../models/graph/IGraphUser';
import { ITeamsApplication } from '../models/graph/ITeamsApplication';
import DeepLinkService from './DeepLinkService';
export class GraphService {
    private extLog?: (msg: string) => void;
    axiosInstance: AxiosInstance;
    token: string;
    select: string;

    constructor(baseUrl: string, token: string, logFunc?: (msg: string) => void) {
        this.extLog = logFunc;
        this.log(`Constructor: ${JSON.stringify({ baseUrl: baseUrl, token: token })}`);

        this.token = token;
        this.select = "$select=department,displayName,givenName,jobTitle,mail,mailNickname,mobilePhone,officeLocation,businessPhones,surname,id,userPrincipalName,accountEnabled,deletedDateTime"; //preferredName
        this.axiosInstance = axios.create({ baseURL: baseUrl });
    }

    private getConfig(): AxiosRequestConfig {
        const requestConfig: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            },
        };

        return requestConfig;
    }

    public async getMyAadId(): Promise<string> {
        try {
            this.log(`getMyAadId ...`);
            const response = await this.axiosInstance.get<{ id: string }>(`/me?$select=id`, this.getConfig());
            this.log(`getMyAadId executed`);

            const result = response.data.id;
            return result;
        }
        catch (error) {
            this.log(`getMyAadId exception`);
            throw error;
        }
    }

    public async getLoggedInUser(): Promise<IGraphUser> {
        try {
            this.log(`getLoggedInUser ...`);
            const response = await this.axiosInstance.get<IGraphUser>(`/me`, this.getConfig());
            this.log(`getLoggedInUser executed`);

            const result = response.data;
            return result;
        }
        catch (error) {
            this.log(`getLoggedInUser exception`);
            throw error;
        }
    }

    public async getUserPhoto(aadId: string, size?: "48" | "64" | "96" | "120" | "240" | "360" | "432" | "504" | "648"): Promise<Buffer | undefined> {
        // https://graph.microsoft.com/v1.0/users/950653e3-089d-409e-b135-01d56e72a989/photo/$value
        try {
            this.log(`getUserPhoto ...`);
            const url = size 
                ? `/users/${aadId}/photos/${size}x${size}/$value`
                : `/users/${aadId}/photo/$value`;

            const response = await this.axiosInstance.get<Buffer>(url, {
                ...this.getConfig(),
                responseType: "arraybuffer"
            });
            this.log(`getUserPhoto executed`);
            return response.data;
        }
        catch (error: any) {
            if(error.response.status === 404){
                return undefined;
            }

            this.log(`getUserPhoto exception`);
            throw error;
        }
    }

    public async getAllUsers(nextLink: string = "", top: number = 100): Promise<{ nextLink: string | undefined; value: IGraphUser[] } | undefined> {
        try {
            this.log(`getAllUsers '${nextLink}'`);
            this.log(`getAllUsers ...`);
            const url: string = nextLink ? nextLink : `/users?${this.select}&$top=${top}`;
            const response = await this.axiosInstance.get(url, this.getConfig());
            this.log(`getAllUsers executed`);

            const result = {
                nextLink: response.data ? response.data["@odata.nextLink"] : undefined,
                value: response.data ? response.data.value || [] : []
            };

            return result;
        }
        catch (error) {
            this.log(`getAllUsers exception`);
            throw error;
        }
    }

    public async getUserById(userId: string): Promise<IGraphUser> {
        try {
            this.log(`getUserById '${userId}' ...`);
            const config = this.getConfig();
            const response = await this.axiosInstance.get<IGraphUser>(`/users/${userId}`, config);
            this.log(`getUserById '${userId}' executed`);

            const result = response.data;
            return result;
        }
        catch (error) {
            this.log(`getUserById '${userId}' exception`);
            throw error;
        }
    }

    public async getUserMailboxSettings(userAadId: string): Promise<IMailboxSettings> {
        try {
            this.log(`getUserMailboxSettings '${userAadId}' ...`);
            const response = await this.axiosInstance.get<IMailboxSettings>(`/users/${userAadId}/mailboxSettings`, this.getConfig());
            this.log(`getUserMailboxSettings '${userAadId}' executed`);

            const result = response.data as IMailboxSettings;
            return result;
        }
        catch (error) {
            this.log(`getUserMailboxSettings '${userAadId}' exception`);
            throw error;
        }
    }

    public async checkMeIsAdmin(): Promise<boolean> {
        try {
            this.log(`checkMeIsAdmin ...`);
            const response = await this.axiosInstance.get(`/me/memberOf?$select=roleTemplateId`, this.getConfig());
            const listUserMemberOf = await Promise.resolve(response.data);
            const userIsAdmin = listUserMemberOf.value.find((membOfItem: any) => membOfItem.roleTemplateId === ROLE.GLOBAL_ADMIN);
            this.log(`checkMeIsAdmin executed`);
            return !!userIsAdmin;
        } catch (error) {
            this.log(`checkMeIsAdmin exception:${JSON.stringify(error)}`);
            throw error;
        }
    }

    public async checkMeHasAccessPlan(planId: string, planName: string): Promise<boolean> {
        // https://docs.microsoft.com/en-us/azure/active-directory/enterprise-users/licensing-service-plan-reference read for more information
        try {
            this.log(`checkMeHasAccessPlan ${planName} ...`);
            const response = await this.axiosInstance.get(`/me/licenseDetails`, this.getConfig());
            const licenseData = await Promise.resolve(response.data);
            const filteredLicenseDetails = licenseData.value.filter((licenseDetItem: any) => {
                const findedTeamsGov = licenseDetItem.servicePlans.find((planItem: any) => 
                    planItem.servicePlanId === planId && planItem.servicePlanName === planName);
                return !!findedTeamsGov;
            });
            return !!filteredLicenseDetails;
        } catch (error) {
            this.log(`checkMeHasAccessPlan ${planName} exception`);
            throw error;
        }
    }

    public async getTeamsApplicationInfo(externalId: string): Promise<ITeamsApplication> {
        try {
            this.log(`getTeamsApplicationInfo ...`);
            const response = await this.axiosInstance.get<{ value: ITeamsApplication[]}>(`/appCatalogs/teamsApps?$filter=externalId eq '${externalId}'`, this.getConfig());
            const teamsApps = await Promise.resolve(response.data);
            const result = teamsApps.value[0];
            this.log(`getTeamsApplicationInfo executed`);
            return result;
        } catch (error) {
            this.log(`getTeamsApplicationInfo exception:${JSON.stringify(error)}`);
            throw error;
        }
    }

    public async sendUnPublishedProfileUserNotification(
        teamsAppId: string,
        teamsAppName: string,
        profileTabId: string,
        profileTabName: string,
        profileTabUrl: string,
        userAadId: string): Promise<void> {
        try {
            this.log(`sendUnPublishedProfileUserNotification app:${teamsAppName}-${teamsAppId} user:${userAadId} ...`);

            // // one-time encoding break deep link if contains special symbols ("=" for example). Works only for notifications deep links.
            // // encode twice only special symbols ("="), because whole string double-encoding breaks mobile deep link.
            // string contextValue = $"{{\"subEntityId\":\"{routeLinkValue.Replace("=", "%3D")}\"}}";
            // string encodedContextValue = Uri.EscapeDataString(contextValue);
            const endpoint = `https://graph.microsoft.com/v1.0/users/${userAadId}/teamwork/sendActivityNotification`;
            const link = DeepLinkService.deepLinkToTab(teamsAppId, profileTabId, profileTabName, profileTabUrl);
            const payload = {
                topic: {
                    source: "text",
                    webUrl: link,
                    value: "GovAddressBook"
                },
                activityType: "freeTextActivity",
                previewText: {
                    content: "Tap here to finish your profile"
                },
                templateParameters: [
                    {
                        name: "body",
                        value: "Your profile needs publishing"
                    }
                ]
            };
            
            const response = await this.axiosInstance.post(endpoint, payload, this.getConfig());
            this.log(`sendUnPublishedProfileUserNotification app:${teamsAppName}-${teamsAppId} user:${userAadId} executed`);
        } catch (error) {
            this.log(`sendUnPublishedProfileUserNotification app:${teamsAppName}-${teamsAppId} user:${userAadId} exception:${JSON.stringify(error)}`);
            throw error;
        }
    }

    private log(payload: string) {
        const msg = `GraphService::${payload}`
        this.extLog
            ? this.extLog(msg)
            : console.log(msg);
    };
}