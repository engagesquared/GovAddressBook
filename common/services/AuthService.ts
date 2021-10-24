import * as msal from "@azure/msal-node";
import { KeyVaultService } from "./KeyVaultService";

export interface IAuthServiceSettings {
    clientId: string;
    certThumbprint: string;
    keyVaultUrl: string;
    keyVaultName: string;
    authUrl: string;
    scopes: string[];
}

export class AuthService {
    private extLog?: (msg: string) => void;
    props: IAuthServiceSettings;

    constructor(props: IAuthServiceSettings, logFunc?: (msg: string) => void) {
        this.extLog = logFunc;
        this.log(`Constructor: ${JSON.stringify(props)}`);
        this.props = props;
    }

    public async getAccessTokenClientCreds(): Promise<string> {
        try {
            this.log(`getAccessTokenClientCreds::getting access token`);
            const privateKey = await KeyVaultService.getPrivateKey(this.props.keyVaultUrl, this.props.keyVaultName, this.extLog);
            const msalConfig = this.getMsalConfig(privateKey);
    
            const cca = new msal.ConfidentialClientApplication(msalConfig);
            const result = await cca.acquireTokenByClientCredential({
                scopes: this.props.scopes
            });
            this.log(`getAccessTokenClientCreds::token is returned successfully`);
            return result?.accessToken ?? "";
        } catch (error) {
            this.log(`getAccessTokenClientCreds::error:${JSON.stringify(error)}`);
            throw (`getAccessTokenClientCreds::${error}`);
        }
    }

    public async getAccessTokenOnBehalfOf(ssoToken: string): Promise<string> {
        try {
            this.log(`getAccessTokenOnBehalfOf::getting access token`);
            const privateKey = await KeyVaultService.getPrivateKey(this.props.keyVaultUrl, this.props.keyVaultName);
            const msalConfig = this.getMsalConfig(privateKey);
            const cca = new msal.ConfidentialClientApplication(msalConfig);
            const result = await cca.acquireTokenOnBehalfOf({
                oboAssertion: ssoToken,
                scopes: this.props.scopes
            });
            this.log(`getAccessTokenOnBehalfOf::token is returned successfully`);
            return result?.accessToken ?? "";
        }
        catch (error) {
            this.log(`getAccessTokenOnBehalfOf::error:${JSON.stringify(error)}`);
            throw (`getAccessTokenOnBehalfOf::${error}`);
        }
    }

    private getMsalConfig(privateKey: string): msal.Configuration {
        return {
            auth: {
                clientId: this.props.clientId,                
                clientCertificate: {
                    thumbprint: this.props.certThumbprint,
                    privateKey: privateKey
                },
                //clientSecret: authAppSetting.clientSecret,
                authority: this.props.authUrl,
            }
        };
    }

    private log(payload: string){
        const msg = `AuthService::${payload}`
        this.extLog 
            ? this.extLog(msg)
            : console.log(msg);
    };
}