import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { dbConfig, authConfig, azSearchConfig } from "../settings";
import { DBService, AuthService, GraphService, IDBUserProfileInternal, AzSearchService, ModelsHelper, fieldsAlwaysGetFromDbModel } from "../../common";
import { GRAPH } from "../constants";

const timerTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        context.log('START::FuncUserInfoSync');
        const dbService = new DBService(dbConfig, context.log);
        const authService = new AuthService(authConfig);
        const token = await authService.getAccessTokenClientCreds();
        const graphService = new GraphService(GRAPH.API_URL, token, context.log);
        const azSearchService = new AzSearchService(azSearchConfig);
        
        await recursivelyUpdate(context, graphService, dbService, azSearchService);

    } catch (err) {
        context.log.error(`FuncUserInfoSync trigger function::error:${err}`);
    } finally {
        context.log('END::FuncUserInfoSync trigger function');
    }
};

async function recursivelyUpdate(context: Context, graphService: GraphService, dbService: DBService, azSearchService: AzSearchService, step: number = 20, loop: number = 0): Promise<void> {
    context.log(`FuncUserInfoSync::recursivelyUpdate - loop:${loop} step:${step}`);
    const skip: number = step * loop;

    context.log('FuncUserInfoSync::getting users from DB ...');
    const dbUsers = await dbService.getAllPublishedUsers(skip, step);

    for(const dbUser of dbUsers){
        let userModel: IDBUserProfileInternal;
        try {
            const grUser = await graphService.getUserById(dbUser.UserAadId);
            if(grUser && !grUser.deletedDateTime && grUser.accountEnabled) {
                const rawUserModel = ModelsHelper.castGraphUserToDbUser(grUser);

                // Graph model as main, getting several fields from DB model
                userModel = ModelsHelper.mergeDbUserModels(rawUserModel, dbUser, fieldsAlwaysGetFromDbModel);
                if(userModel.UserAadId === "06486967-ad05-4e81-93d7-1860dddd6eb7"){
                    console.log("asd");
                }

                if(ModelsHelper.hasDifferenceUserModels(userModel, dbUser)){
                    context.log(`FuncUserInfoSync::user '${grUser.id}' updating in database ...`);

                    await dbService.updateUser(userModel);
                    context.log(`FuncUserInfoSync::user '${grUser.id}' updated in database`);

                    context.log(`FuncUserInfoSync::user '${grUser.id}' updating in search ...`);
                    await azSearchService.addOrUpdateUsersIndex([userModel]);
                    context.log(`FuncUserInfoSync::user '${grUser.id}' updated in search`);
                } else {
                    context.log(`FuncUserInfoSync::user '${grUser.id}' no difference found, skip updating`);
                }
            } else {
                context.log(`FuncUserInfoSync::user '${dbUser.UserAadId}' disabled or deleted, skip sync`);
            }
        } catch (err) {
            context.log(`FuncUserInfoSync::error:${err}::${JSON.stringify(userModel)}`);
        }
    }

    if(dbUsers.length && dbUsers.length == step){
        return recursivelyUpdate(context, graphService, dbService, azSearchService, step, loop + 1);
    }

}

export default timerTrigger;