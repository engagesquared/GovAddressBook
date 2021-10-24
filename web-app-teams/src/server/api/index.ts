import * as Express from "express";
import {
    IDBCustomField,
    IDBPartnerIncomingConnection,
    IDBPartnerOutgoingConnection,
    IDBUserProfileInternal,
    IUserProfile,
    AuthService,
    GraphService,
    DBService,
    AzSearchService,
    IAzSearchResult,
    ExternalApiService,
    IAzSearchRequest,
    PLAN,
    ModelsHelper,
    ExternalIPService,
    IGraphUser,
    IUserFavourite
} from "../../../../common";
import { dbConfig, authConfig, azSearchConfig, clientEnv } from "../settings";
import { APP_ACCESS_TOKEN_HEADER } from "../../common";
import { GRAPH, SELF_EXTERNAL_API } from "../constants";

interface IAuthLocals {
    token: string;
    aadId: string;
}
interface IMeLocals {
    dbMe: IDBUserProfileInternal;
}

const router = Express.Router();

router.post('/token', async function (req, res) {
    try {
        console.log("AUTH_CONFIG: ", authConfig);
        const authSvc = new AuthService(authConfig);
        const token = await authSvc.getAccessTokenOnBehalfOf(req.body.ssoToken);
        res.send(token);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.get('/env', authorizedApi, async (req, res) => {
    res.send(clientEnv);
});

// ======== ME API ========
router.get('/me', authorizedApi, async (req, res) => {
    try {
        const { token, aadId } = res.locals as (IAuthLocals);
        const dbSvc = new DBService(dbConfig);
        let result = await dbSvc.getUserByAadId(aadId);
        if (!result) {
            const grMe = await (new GraphService(GRAPH.API_URL, token)).getUserById(aadId);
            const rawDbMe = ModelsHelper.castGraphUserToDbUser(grMe as IGraphUser);
            const response = await dbSvc.createUser(rawDbMe);
            result = { ...rawDbMe, Id: response.Id };
        }
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/me', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const model: IDBUserProfileInternal = {
            ...req.body,
            Id: dbMe.Id
        };
        const dbSvc = new DBService(dbConfig);
        await dbSvc.updateUser(model);
    
        if(model.Published){
            const azSrcSvc = new AzSearchService(azSearchConfig);
            await azSrcSvc.addOrUpdateUsersIndex([model]);
        }
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/me/welcomeTourFinished', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const dbSvc = new DBService(dbConfig);
        await dbSvc.updateUserWTC(Number(dbMe.Id), true);
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/me/publish', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        dbMe.Published = true;
        const dbSvc = new DBService(dbConfig);
        const azSrcSvc = new AzSearchService(azSearchConfig);
        await dbSvc.updateUserPublished(Number(dbMe.Id), true);
        await azSrcSvc.addOrUpdateUsersIndex([dbMe]);
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/me/isAdmin', authorizedApi, async (req, res) => {
    try {
        const { token } = res.locals as (IAuthLocals);
        const graphSvc = new GraphService(GRAPH.API_URL, token);
        const isAdmin = await graphSvc.checkMeIsAdmin();
        res.send(!!isAdmin);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/me/hasTeamsCallingAccess', authorizedApi, async (req, res) => {
    try {
        const { token } = res.locals as (IAuthLocals);
        const graphSvc = new GraphService(GRAPH.API_URL, token);
        const hasAccess = await graphSvc.checkMeHasAccessPlan(PLAN.MCOEV.ID, PLAN.MCOEV.NAME);
        res.send(!!hasAccess);
    } catch (err) {
        res.status(500).send(err);
    }
});

// FAVORITES
router.get('/me/fav', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const dbSvc = new DBService(dbConfig);
        const [externResult, internResult] = await Promise.all([
            dbSvc.getFavExternal(Number(dbMe.Id)), 
            dbSvc.getFavInternal(Number(dbMe.Id))
        ]);
        res.send([...externResult,...internResult] as IUserFavourite[]);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/me/favExternal', authorizedApi, meApi, async (req, res) => {
    try {
        if (req.body) {
            const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
            const model: IUserProfile = req.body;
            const dbSvc = new DBService(dbConfig);
            let extUserId: number | undefined;
            let extUser = await dbSvc.getExtUserByAadId(model.UserAadId);
            
            if (extUser) {
                extUserId = extUser.Id;
            } else {
                const newExtUser = await dbSvc.createExtUser(model);
                extUserId = newExtUser.Id;
            }
    
            await dbSvc.createFavExternal({ 
                UserProfileInternalId: Number(dbMe.Id),
                UserProfileExternalFavoriteId: Number(extUserId)
            });
            res.send();
        } else {
            res.status(400).send("Body is empty");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/me/favExternal/:favUserAadId', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const favExtUserAadId: string = String(req.params.favUserAadId);
    
        const dbSvc = new DBService(dbConfig);
        const extUser = await dbSvc.getExtUserByAadId(favExtUserAadId);    
        if(extUser && extUser.Id) {
            const result = await dbSvc.deleteFavExternal({
                UserProfileInternalId: Number(dbMe.Id),
                UserProfileExternalFavoriteId: extUser.Id
            });
            if (result) {
                res.send();
            } else {
                res.status(404).send(`You have no favorite user with id: '${favExtUserAadId}'`);
            }
        } else {
            res.status(404).send(`External user with id: '${favExtUserAadId}' not exists`);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/me/favInternal/:favUserId', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const favUserId = Number(req.params.favUserId);
    
        const dbSvc = new DBService(dbConfig);
        await dbSvc.createFavInternal({
            UserProfileInternalId: Number(dbMe.Id), 
            UserProfileInternalFavoriteId: favUserId
        });
        res.send();
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/me/favInternal/:favUserId', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const favUserId = Number(req.params.favUserId);
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.deleteFavInternal({
            UserProfileInternalId: Number(dbMe.Id),
            UserProfileInternalFavoriteId: favUserId
        });
    
        if (result) {
            res.send();
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
// FAVORITES

// CUSTOM FIELDS
router.get('/me/customFields', authorizedApi, meApi, async (req, res) => {
    try {
        const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.getCustomFields(Number(dbMe.Id));
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/me/customFields', authorizedApi, meApi, async (req, res) => {
    try {
        if (req.body) {
            const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
            const model: IDBCustomField = {
                ...req.body,
                Code: "0", // should be used in case of same models ???
                UserProfileInternalId: Number(dbMe.Id)
            } as IDBCustomField;
    
            const dbSvc = new DBService(dbConfig);
            const result = await dbSvc.createCustomField(model);
            res.send(result);
        } else {
            res.status(400).send("Model is undefined.");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/me/customFields/:id', authorizedApi, meApi, async (req, res) => {
    try {
        if (req.body) {
            const { dbMe } = res.locals as (IAuthLocals & IMeLocals);
            const model: IDBCustomField = {
                ...req.body,
                Id: Number(req.params.id),
                UserProfileInternalId: Number(dbMe.Id),
                Code: "0"
            } as IDBCustomField;
    
            const dbSvc = new DBService(dbConfig);
            await dbSvc.updateCustomField(model);
            res.send();
        } else {
            res.status(400).send("Model is undefined.");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/me/customFields/:id', authorizedApi, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.deleteCustomField(id);
        if (result) {
            res.send();
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======== ME API ========

// ======= USER API =======
router.get('/users/:id', authorizedApi, async (req, res) => {
    try {
        const id: string = req.params.id;
        const dbSvc = new DBService(dbConfig);
        let result: IDBUserProfileInternal;
        if(!Number.isNaN(Number(id))) {
            result = await dbSvc.getUserById(Number(id));
        } else {
            result = await dbSvc.getUserByAadId(id);
        }
        if (result) {
            res.send(result);
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/users/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBUserProfileInternal = {
                ...req.body,
                Id: req.params.id
            };
    
            const dbSvc = new DBService(dbConfig);
            await dbSvc.updateUser(model);
    
            if(model.Published){
                const azSrcSvc = new AzSearchService(azSearchConfig);
                await azSrcSvc.addOrUpdateUsersIndex([model]);
            }
    
            res.send();
        } else {
            res.status(400).send("Body is empty");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/users/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        const id: string = req.params.id;
        const dbSvc = new DBService(dbConfig);
        const user = await dbSvc.getUserById(Number(id));
        if(user){
            await dbSvc.deleteUserById(Number(id));
            const azSrcSvc = new AzSearchService(azSearchConfig);
            await azSrcSvc.deleteUsersIndex([user]);
            res.send();
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/users/:id/customFields', authorizedApi, async (req, res) => {
    try {
        const dbSvc = new DBService(dbConfig);
        let userId = Number(req.params.id);
        if(Number.isNaN(userId)){
            const user = await dbSvc.getUserByAadId(req.params.id);
            userId = Number(user.Id);
        }
        const result = await dbSvc.getCustomFields(userId);
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/users/:id/customFields', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBCustomField = {
                ...req.body,
                Code: "0", // should be used in case of same models ???
                UserProfileInternalId: Number(req.params.id)
            } as IDBCustomField;
    
            const dbSvc = new DBService(dbConfig);
            const result = await dbSvc.createCustomField(model);
            res.send(result);
        } else {
            res.status(400).send("Model is undefined.");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/users/:userId/customFields/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBCustomField = {
                ...req.body,
                Id: Number(req.params.id),
                UserProfileInternalId: Number(req.params.userId)
            } as IDBCustomField;
    
            const dbSvc = new DBService(dbConfig);
            await dbSvc.updateCustomField(model);
            res.send();
        } else {
            res.status(400).send("Model is undefined.");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/users/customFields/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.deleteCustomField(id);
        if (result) {
            res.send();
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/users/:aadId/photo', authorizedApi, async (req, res) => {
    try {
        const id = String(req.params.aadId);
        const { token } = res.locals as (IAuthLocals);
        const graphSvc = new GraphService(GRAPH.API_URL, token);
        const buffer = await graphSvc.getUserPhoto(id, "96");
        res.send(buffer);
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======= USER API =======

// ======== ADMIN - PARTNER INC API ========
router.get('/incConnection', authorizedApi, adminApi, async (req, res) => {
    try {
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.getAllIncConnections();
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/incConnection', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBPartnerIncomingConnection = req.body;
            const dbSvc = new DBService(dbConfig);
            const result = await dbSvc.createIncConnection(model);
            res.send(result);
        } else {
            res.status(400).send("Body is empty");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/incConnection/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBPartnerIncomingConnection = {
                ...req.body,
                Id: req.params.id
            };
    
            const dbSvc = new DBService(dbConfig);
            const result = await dbSvc.updateIncConnection(model);
            if (result) {
                res.send();
            } else {
                res.status(404).send();
            }
        } else {
            res.status(400).send("Body is empty");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/incConnection/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        const id: string = req.params.id;
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.deleteIncConnection(id);
        if (result) {
            res.send();
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======== ADMIN - PARTNER INC API ========

// ======== ADMIN - PARTNER OUT API ========
router.get('/outConnection', authorizedApi, adminApi, async (req, res) => {
    try {
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.getAllOutConnections();
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post('/outConnection', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBPartnerOutgoingConnection = req.body;
            const dbSvc = new DBService(dbConfig);
            const result = await dbSvc.createOutConnection(model);
            res.send(result);
        } else {
            res.status(400).send("Body is empty");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.put('/outConnection/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        if (req.body) {
            const model: IDBPartnerOutgoingConnection = {
                ...req.body,
                Id: req.params.id
            };
    
            const dbSvc = new DBService(dbConfig);
            const result = await dbSvc.updateOutConnection(model);
            if (result) {
                res.send();
            } else {
                res.status(404).send();
            }
        } else {
            res.status(400).send("Body is empty");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete('/outConnection/:id', authorizedApi, adminApi, async (req, res) => {
    try {
        const id: string = req.params.id;
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.deleteOutConnection(id);
        if (result) {
            res.send();
        } else {
            res.status(404).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======== ADMIN - PARTNER OUT API ========

// ======== ADMIN - SELF EXT API ========
router.get('/serverPublicIp', authorizedApi, adminApi, async (req, res) => {
    try {
        const publicIp = await ExternalIPService.getPublicIPAddress(
            SELF_EXTERNAL_API.URL, 
            SELF_EXTERNAL_API.KEY
        );
        res.send(publicIp);
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======== ADMIN - SELF EXT API ========

// ======== COMMON - SEARCH API ========
router.post('/search', authorizedApi, async (req, res)  => {
    try {
        const reqConfig: IAzSearchRequest = req.body;
        reqConfig.query = reqConfig.query || "*";
    
        const azSrcSvc = new AzSearchService(azSearchConfig);
        const searchResults = await azSrcSvc.searchForInternalRequester(reqConfig);
        const result: IAzSearchResult = {
            values: [] as any,
            facets: searchResults.facets,
            count: searchResults.count,
            coverage: searchResults.coverage
        }
    
        for await (const item of searchResults.results) {
            result.values.push(item.document);
        }
    
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/connections', authorizedApi, async (req, res)  => {
    try {
        const dbSvc = new DBService(dbConfig);
        const result = await dbSvc.getConnections();
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======== COMMON - SEARCH API ========

// ======== COMMON - EXTERNAL API ========
router.post('/external/:connectionId/search', authorizedApi, async (req, res)  => {
    try {
        const { connectionId } = req.params;

        const reqConfig: IAzSearchRequest = req.body;
        reqConfig.query = reqConfig.query || "*";
    
        const dbSvc = new DBService(dbConfig);
        const connection = await dbSvc.getOutConnectionById(Number(connectionId));
    
        const extSvc = new ExternalApiService({
            url: connection.EndpointURLOrIPAddress,
            apiKey: connection.APIKey
        });
        const result: IAzSearchResult = await extSvc.search(reqConfig);
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/external/:connectionId/user/:userAadId', authorizedApi, async (req, res)  => {
    try {
        const { connectionId, userAadId } = req.params;
        const dbSvc = new DBService(dbConfig);
        const connection = await dbSvc.getOutConnectionById(Number(connectionId));
        
        const extSvc = new ExternalApiService({
            url: connection.EndpointURLOrIPAddress,
            apiKey: connection.APIKey
        });
        const result = await extSvc.user({aadId: userAadId});
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/external/:connectionId/user/:userAadId/customFields', authorizedApi, async (req, res)  => {
    try {
        const { connectionId, userAadId } = req.params;
        const dbSvc = new DBService(dbConfig);
        const connection = await dbSvc.getOutConnectionById(Number(connectionId));
        
        const extSvc = new ExternalApiService({
            url: connection.EndpointURLOrIPAddress,
            apiKey: connection.APIKey
        });
    
        const result = await extSvc.userCustomFields({aadId: userAadId});
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/external/:connectionId/user/:userAadId/photo', authorizedApi, async (req, res) => {
    try {
        const { connectionId, userAadId } = req.params;
        const dbSvc = new DBService(dbConfig);
        const connection = await dbSvc.getOutConnectionById(Number(connectionId));
        
        const extSvc = new ExternalApiService({
            url: connection.EndpointURLOrIPAddress,
            apiKey: connection.APIKey
        });

        const buffer = await extSvc.userPhoto({aadId: userAadId});
        res.send(buffer);
    } catch (err) {
        res.status(500).send(err);
    }
});
// ======== COMMON - EXTERNAL API ========

router.get('*', function (req, res) {
    res.status(404).send('Api not found');
});

router.post('*', function (req, res) {
    res.status(404).send('Api not found');
});

async function authorizedApi(req, res, next: Function) {
    try {
        const token = (req.headers as any)[APP_ACCESS_TOKEN_HEADER];
        if (!token) {
            res.status(401).send("Unauthorized");
            return;
        }
        
        // as part of auth
        const graphSvc = new GraphService(GRAPH.API_URL, token);
        const aadId = await graphSvc.getMyAadId();

        res.locals.token = token;
        res.locals.aadId = aadId;
        next();
    } catch (e) {
        res.status(500).send(e);
    }
}

async function meApi(req, res, next: Function) {
    const { aadId } = res.locals as IAuthLocals;
    const dbSvc = new DBService(dbConfig);
    const dbMe = await dbSvc.getUserByAadId(aadId);
    if(dbMe && dbMe.Id){
        res.locals.dbMe = dbMe;
        next();
    } else {
        res.status(404).send("Your profile is not exists in DB");
    }
}

async function adminApi(req, res, next: Function) {
    const { token } = res.locals as IAuthLocals;
    const graphSvc = new GraphService(GRAPH.API_URL, token);
    const isAdmin = await graphSvc.checkMeIsAdmin();
    if(isAdmin) {
        next();
    } else {
        res.status(403).send();
    }
}

export default router;