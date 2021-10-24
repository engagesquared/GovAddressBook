import * as Express from "express";
import { azSearchConfig, SELF_EXTERNAL_API, dbConfig, authConfig, GRAPH } from ".";
import { AuthService, AzSearchService, DBService, EXTERNAL_API_ENDPOINTS, GraphService, IAzSearchRequest, IAzSearchResult, IUserCustomFieldsRequestExternal, IUserRequestExternal } from "./../common";

var router = Express.Router();

const isRegistered = async (req: any, res: any, next: Function) => {
    try {
        if(!!req?.headers?.apikey) {
            // x-forwarded-for - header which provides original requesters IP
            // cose of proxies, firewalls, load balancers and etc.
            let ip: string = req.headers['x-forwarded-for'];
            // removing port number
            ip = ip.split(":")[0];
            console.log(`Authorization ip:${ip} apikey:${req.headers.apikey} ...`);
            const svc = new DBService(dbConfig);
            let hasAccess = await svc.isRegisteredRequester(req.headers.apikey, ip);
            
            if(!hasAccess)
            {
                console.log(`Auto Authorization ip:${ip} apikey:${req.headers.apikey} ...`);
                const freeSlot = await svc.tryGetFreeIncConnectionSlot(req.headers.apikey);
                if(freeSlot) {
                    console.log(`Auto Authorization free slot found ip:${ip} apikey:${req.headers.apikey}`);
                    freeSlot.WhitelistIPAddress = ip;
                    await svc.updateIncConnection(freeSlot);
                    console.log(`Auto Authorization finished ip:${ip} apikey:${req.headers.apikey}`);

                    hasAccess = true;
                }
            }

            if(hasAccess) {
                console.log(`Authorized ip:${ip} apikey:${req.headers.apikey}`);
                next();
            } else {
                console.log(`Unauthorized ip:${ip} apikey:${req.headers.apikey}`);
                res.status(401).send("Unauthorized");
            }
        } else {
            res.status(400).send("Authorization key is undefined");
        }
    } catch (err) {
        res.status(500).send(err);
    }
}

router.post(EXTERNAL_API_ENDPOINTS.SEARCH, isRegistered, async (req, res) => {
    try {
        const reqConfig: IAzSearchRequest = req.body;
        reqConfig.query = reqConfig.query || "*";
    
        const srcSvc = new AzSearchService(azSearchConfig);
        const searchResults = await srcSvc.searchForExternalRequester(reqConfig);
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

router.post(EXTERNAL_API_ENDPOINTS.USER, isRegistered, async (req, res) => {
    try {
        const svc = new DBService(dbConfig);
        const reqData = req.body as IUserRequestExternal;
        if(reqData && reqData.aadId){
            const result = await svc.getUserByAadId(reqData.aadId);
            res.send(result);
        } else {
            res.status(400).send("Body or id is empty. Payload should be: { aadId:'AadId' }");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post(EXTERNAL_API_ENDPOINTS.USER_PHOTO, isRegistered, async (req, res) => {
    try {
        const authService = new AuthService(authConfig);
        const token = await authService.getAccessTokenClientCreds();
        const graphService = new GraphService(GRAPH.API_URL, token);
        const reqData = req.body as IUserRequestExternal;
        if(reqData && reqData.aadId){
            const result = await graphService.getUserPhoto(reqData.aadId, "96");
            res.send(result);
        } else {
            res.status(400).send("Body or id is empty. Payload should be: { aadId:'AadId' }");
        }
    } catch (err: any) {
        if(err.statusCode === 404){
            res.send(undefined);
        }
        res.status(500).send(err);
    }
});

router.post(EXTERNAL_API_ENDPOINTS.CUSTOM_FIELDS, isRegistered, async (req, res) => {
    try {
        const svc = new DBService(dbConfig);
        const reqData = req.body as IUserCustomFieldsRequestExternal;
        if(reqData && reqData.aadId){
            const result = await svc.getPublicCustomFields(reqData.aadId);
            res.send(result);
        } else {
            res.status(400).send("Body or id is empty. Payload should be: { aadId:'AadId' }");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.post(EXTERNAL_API_ENDPOINTS.EXTERNAL_IP, async (req, res) => {
    // SELF SERVICE TO GET EXTERNAL IP FOR TEAMS WEB APP
    try {
        // x-forwarded-for - header which provides original requesters IP
        // cose of proxies, firewalls, load balancers and etc.
        let ip: string = req.headers['x-forwarded-for'] as string;
        // removing port number
        ip = ip.split(":")[0];
        const apikey = req?.headers?.apikey;
        if(!!apikey && apikey === SELF_EXTERNAL_API.KEY) {
            res.send(ip);
        } else {
            res.status(401).send(`Unauthorized ip:${ip} apikey:${apikey}`);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('*', function (req, res) {
    res.status(404).send('Api not found');
});

router.post('*', function (req, res) {
    res.status(404).send('Api not found');
});

export default router;