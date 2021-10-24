import { SearchIndexClient, AzureKeyCredential, SearchClient, SearchDocumentsResult, IndexDocumentsResult } from '@azure/search-documents';
import { IDBUserProfileInternal, ModelsHelper } from '..';
import { IAzSearchRequest } from '../models/search/IAzSearchRequest';
import { IAzSearchUserProfile } from '../models/search/IAzSearchUserProfile';

export interface IAzSearchServiceSettings {
    url: string;
    key: string;
}

export class AzSearchService {
    private extLog?: (msg: string) => void;
    indexClient: SearchIndexClient;
    internalClientIndexName: string;
    externalClientIndexName: string;
    intSearchClient: SearchClient<IAzSearchUserProfile>;
    extSearchClient: SearchClient<IAzSearchUserProfile>;

    constructor(props: IAzSearchServiceSettings, logFunc?: (msg: string) => void) {
        this.extLog = logFunc;
        this.log(`Constructor: ${JSON.stringify(props)}`);

        this.internalClientIndexName = "internal-api-users";
        this.externalClientIndexName = "external-api-users";

        this.indexClient = new SearchIndexClient(props.url, new AzureKeyCredential(props.key));
        this.intSearchClient = new SearchClient(props.url, this.internalClientIndexName, new AzureKeyCredential(props.key));
        this.extSearchClient = new SearchClient(props.url, this.externalClientIndexName, new AzureKeyCredential(props.key));
    }

    public async searchForInternalRequester(payload: IAzSearchRequest): Promise<SearchDocumentsResult<Pick<IAzSearchUserProfile, keyof IAzSearchUserProfile>>> {
        try {
            this.log(`searchForInternal payload:${JSON.stringify(payload || {})} ...`);
            const result = await this.executor(async () => this.intSearchClient.search(payload.query, payload.options));
            this.log(`searchForInternal payload:${JSON.stringify(payload || {})} executed`);
            return result;
        } catch (err: any) {
            this.log(`searchForInternal payload:${JSON.stringify(payload || {})} exception:${JSON.stringify(err)}`);
            throw err;
        }
    }

    public async searchForExternalRequester(payload: IAzSearchRequest): Promise<SearchDocumentsResult<Pick<IAzSearchUserProfile, keyof IAzSearchUserProfile>>> {
        try {
            this.log(`searchForExternal payload:${JSON.stringify(payload || {})} ...`);
            const result = await this.executor(async () => this.extSearchClient.search(payload.query, payload.options));
            this.log(`searchForExternal payload:${JSON.stringify(payload || {})} executed`);
            return result;
        } catch (err) {
            this.log(`searchForExternal payload:${JSON.stringify(payload || {})} exception:${JSON.stringify(err)}`);
            throw err;
        }
    }

    public async addOrUpdateUsersIndex(users: IDBUserProfileInternal[]): Promise<{
        intSrcIndex: IndexDocumentsResult;
        extSrcIndex: IndexDocumentsResult;
    }> {
        try {
            const result = await this.executor(async () => {
                this.log(`addOrUpdateUsersIndex ...`);
                const intSrcModels = users.map(ModelsHelper.castDbUserToIntSearchIndex);
                const extSrcModels = users.map(ModelsHelper.castDbUserToExtSearchIndex);
                const [ intSrcIndex, extSrcIndex ] = await Promise.all([
                    this.intSearchClient.mergeOrUploadDocuments(intSrcModels),
                    this.extSearchClient.mergeOrUploadDocuments(extSrcModels)
                ]);
                this.log(`addOrUpdateUsersIndex executed`);
                return { intSrcIndex, extSrcIndex };
            });
            return result;
        } catch (err) {
            this.log(`addOrUpdateUsersIndex exception:${JSON.stringify(err)}`);
            throw err;
        }
    }

    public async deleteUsersIndex(users: IDBUserProfileInternal[]): Promise<{
        intSrcIndex: IndexDocumentsResult;
        extSrcIndex: IndexDocumentsResult;
    }> {
        try {
            const result = await this.executor(async () => {
                this.log(`deleteUsersIndex ...`);
                const intSrcModels = users.map(ModelsHelper.castDbUserToIntSearchIndex);
                const extSrcModels = users.map(ModelsHelper.castDbUserToExtSearchIndex);
                const [ intSrcIndex, extSrcIndex ] = await Promise.all([
                    this.intSearchClient.deleteDocuments(intSrcModels),
                    this.extSearchClient.deleteDocuments(extSrcModels)
                ]);
                this.log(`deleteUsersIndex executed`);
                return { intSrcIndex, extSrcIndex};
            });
            return result;
        } catch (err) {
            this.log(`deleteUsersIndex exception:${JSON.stringify(err)}`);
            throw err;
        }
    }

    private async executor<T>(func: () => Promise<T>): Promise<T> {
        try {
            return await func();
        } catch (err: any) {
            if(err.statusCode === 404){
                await this.createIndex();
                return func();
            } else {
                throw err;
            }
        }
    }

    private async createIndex(): Promise<void> {
        try {
            this.log("createIndex internal...");
            await this.indexClient.createIndex({
                name: this.internalClientIndexName,
                fields: [
                    {
                        type: "Edm.Int32",
                        name: "Id",
                        sortable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "UserAadId",
                        key: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "DisplayName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "GivenName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "SurName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "PreferredPronoun",
                        searchable: true
                    },
                    {
                        type: "Edm.String",
                        name: "UserPrincipalName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "MailNickname",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "Mail",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "OfficePhone",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "MobilePhone",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "JobTitle",
                        searchable: true,
                        filterable: true,
                        facetable: true
                    },
                    {
                        type: "Edm.String",
                        name: "DepartmentName",
                        searchable: true,
                        filterable: true,
                        facetable: true
                    },
                    {
                        type: "Edm.String",
                        name: "OfficeLocation",
                        searchable: true,
                        filterable: true,
                        facetable: true
                    },
                    {
                        type: "Edm.Boolean",
                        name: "OutOfOffice",
                        filterable: true
                    }
                ]
            });
            this.log("createIndex internal created");

            this.log("createIndex external ...");
            await this.indexClient.createIndex({
                name: this.externalClientIndexName,
                fields: [
                    {
                        type: "Edm.String",
                        name: "UserAadId",
                        key: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "DisplayName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "GivenName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "SurName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "PreferredPronoun",
                        searchable: true
                    },
                    {
                        type: "Edm.String",
                        name: "UserPrincipalName",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "MailNickname",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "Mail",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "OfficePhone",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "MobilePhone",
                        searchable: true,
                        filterable: true
                    },
                    {
                        type: "Edm.String",
                        name: "JobTitle",
                        searchable: true,
                        filterable: true,
                        facetable: true
                    },
                    {
                        type: "Edm.String",
                        name: "DepartmentName",
                        searchable: true,
                        filterable: true,
                        facetable: true
                    },
                    {
                        type: "Edm.String",
                        name: "OfficeLocation",
                        searchable: true,
                        filterable: true,
                        facetable: true
                    },
                    {
                        type: "Edm.Boolean",
                        name: "OutOfOffice",
                        filterable: true
                    }
                ]
            });
            this.log("createIndex external created");

        } catch (err: any) {
            this.log(`createIndex exception ${JSON.stringify(err)}`);
            throw err;
        }
    }

    private log(payload: string){
        const msg = `AzSearchService::${payload}`
        this.extLog 
            ? this.extLog(msg)
            : console.log(msg);
    };
}