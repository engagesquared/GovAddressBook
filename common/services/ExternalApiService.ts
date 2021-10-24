import axios from 'axios';
import { IDBCustomField, IDBUserProfileInternal } from "..";
import { IAzSearchRequest } from '../models/search/IAzSearchRequest';
import { IAzSearchResult } from '../models/search/IAzSearchResult';

export const EXTERNAL_API_ENDPOINTS = {
    SEARCH: "/search",
    USER: "/user",
    CUSTOM_FIELDS: "/customFields",
    EXTERNAL_IP: "/externalIPAddress",
    USER_PHOTO: "/userphoto"
}

export interface IUserRequestExternal {
    aadId: string;
}

export interface IUserCustomFieldsRequestExternal {
    aadId: string;
}

export interface IExternalApiServiceProps {
    url: string;
    apiKey: string;
}

export class ExternalApiService {
    private extLog?: (msg: string) => void;
    private props: IExternalApiServiceProps;

    constructor(props: IExternalApiServiceProps, logFunc?: (msg: string) => void) {
        this.extLog = logFunc;
        this.log(`Constructor:${JSON.stringify(props)}`);
        this.props = props;
    }

    public async search(payload?: IAzSearchRequest): Promise<IAzSearchResult> {
        const endpoint: string = `${this.props.url}/api${EXTERNAL_API_ENDPOINTS.SEARCH}`;
        const apiKey: string = this.props.apiKey;
        try {
            this.log(`search url:${endpoint} opt:${JSON.stringify(payload || {})} ...`);
            const response = await axios.post<IAzSearchResult>(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': `${apiKey}`
                }
            });
            
            const result = response.data;
            this.log(`search url:${endpoint} opt:${JSON.stringify(payload || {})} executed`);
            return result;
        } catch (err: any) {
            this.log(`search url:${endpoint} opt:${JSON.stringify(payload || {})} exception:${JSON.stringify(err)}`);
            throw err;
        }
    }

    public async user(payload: IUserRequestExternal): Promise<IDBUserProfileInternal> {
        const endpoint: string = `${this.props.url}/api${EXTERNAL_API_ENDPOINTS.USER}`;
        const apiKey: string = this.props.apiKey;
        try {
            this.log(`user url:${endpoint} aadId:${payload.aadId} ...`);
            const response = await axios.post<IDBUserProfileInternal>(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': `${apiKey}`
                }
            });
            
            const result = response.data;
            this.log(`user url:${endpoint} aadId:${payload.aadId} executed`);
            return result;
        } catch (err: any) {
            this.log(`user url:${endpoint} aadId:${payload.aadId} exception:${JSON.stringify(err)}`);
            throw err;
        }
    }
    
    public async userCustomFields(payload: IUserCustomFieldsRequestExternal): Promise<IDBCustomField[]> {
        const endpoint: string = `${this.props.url}/api${EXTERNAL_API_ENDPOINTS.CUSTOM_FIELDS}`;
        const apiKey: string = this.props.apiKey;
        try {
            this.log(`userCustomFields url:${endpoint} aadId:${payload.aadId} ...`);
            const response = await axios.post<IDBCustomField[]>(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': `${apiKey}`
                }
            });
            
            const result = response.data;
            this.log(`userCustomFields url:${endpoint} aadId:${payload.aadId} executed`);
            return result;
        } catch (err: any) {
            this.log(`userCustomFields url:${endpoint} aadId:${payload.aadId} exception:${JSON.stringify(err)}`);
            throw err;
        }
    }
    
    public async userPhoto(payload: IUserRequestExternal): Promise<Buffer | undefined> {
        const endpoint: string = `${this.props.url}/api${EXTERNAL_API_ENDPOINTS.USER_PHOTO}`;
        const apiKey: string = this.props.apiKey;
        try {
            this.log(`userPhoto url:${endpoint} aadId:${payload.aadId} ...`);
            const response = await axios.post<Buffer | undefined>(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': `${apiKey}`
                },
                responseType: "arraybuffer"
            });
            
            const result = response.data;
            this.log(`userPhoto url:${endpoint} aadId:${payload.aadId} executed`);
            return result;
        } catch (err: any) {
            this.log(`userPhoto url:${endpoint} aadId:${payload.aadId} exception:${JSON.stringify(err)}`);
            throw err;
        }
    }

    private log(payload: string){
        const msg = `ExternalApiService::${payload}`
        this.extLog 
            ? this.extLog(msg)
            : console.log(msg);
    };
}