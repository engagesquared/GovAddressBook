import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { dbConfig, authConfig, azSearchConfig } from "../settings";
import { DBService, AuthService, GraphService, IDBUserProfileInternal, AzSearchService, ModelsHelper, fieldsAlwaysGetFromDbModel } from "../../common";
import { GRAPH } from "../constants";

//======================================================================
//== MIGRATE ALL USERS FROM GRAPH TO DB AND SEARCH - FOR DEV PURPOSES ==
//== CRON SET FOR 31 FEB ~ NEVER BE TRIGGERED ==========================
//======================================================================
const timerTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    try {
        context.log('START::FuncUserInfoFullMigration');
        const dbService = new DBService(dbConfig, context.log);
        const authService = new AuthService(authConfig);
        const token = await authService.getAccessTokenClientCreds();
        const graphService = new GraphService(GRAPH.API_URL, token, context.log);
        const azSearchService = new AzSearchService(azSearchConfig);
        
        // full migration from Graph to DB and Search
        await recursivelyUpdate(context, graphService, dbService, azSearchService);

        // full migration from DB to Search
        // const all = await dbService.getAllUsers();
        // await azSearchService.addOrUpdateUsersIndex(all);

    } catch (err) {
        context.log.error(`FuncUserInfoFullMigration trigger function::error:${err}`);
    } finally {
        context.log('END::FuncUserInfoFullMigration trigger function');
    }
};

async function recursivelyUpdate(context: Context, graphService: GraphService, dbService: DBService, azSearchService: AzSearchService, nextLink: string = "", step: number = 20, loop: number = 0): Promise<void> {
    // TODO: retrieve recursively using @odata.nextLink
    context.log(`FuncUserInfoFullMigration::recursivelyUpdate - loop:${loop} step:${step}`);
    context.log('FuncUserInfoFullMigration::getting users from graph ...');
    const grUsersRes = await graphService.getAllUsers(nextLink, step);

    for(const grUser of grUsersRes.value){
        let userModel: IDBUserProfileInternal;
        if(!grUser.deletedDateTime && grUser.accountEnabled){
            try {
                context.log(`FuncUserInfoFullMigration::user '${grUser.id}' getting from database`);
                const dbUser = await dbService.getUserByAadId(grUser.id);
                if(dbUser){
                    context.log(`FuncUserInfoFullMigration::user '${grUser.id}' retrieved`);
                    const rawUserModel = ModelsHelper.castGraphUserToDbUser(grUser);
                    
                    // Graph model as main, getting several fields from DB model
                    userModel = ModelsHelper.mergeDbUserModels(rawUserModel, dbUser, fieldsAlwaysGetFromDbModel);
                    
                    if(ModelsHelper.hasDifferenceUserModels(userModel, dbUser)){
                        context.log(`FuncUserInfoFullMigration::user '${grUser.id}' updating in database ...`);
                        await dbService.updateUser(userModel);
                        context.log(`FuncUserInfoFullMigration::user '${grUser.id}' updated in database`);

                        context.log(`FuncUserInfoFullMigration::user '${grUser.id}' updating in search ...`);
                        const indexes = await azSearchService.addOrUpdateUsersIndex([userModel]);
                        context.log(`FuncUserInfoFullMigration::user '${grUser.id}' updated in search ${JSON.stringify(indexes)}`);
                    } else {
                        context.log(`FuncUserInfoFullMigration::user '${grUser.id}' no difference found, skip updating`);
                    }
                } else {
                    context.log(`FuncUserInfoFullMigration::user '${grUser.id}' not found in database`);
                    context.log(`FuncUserInfoFullMigration::user '${grUser.id}' creating in database ...`);
                    const newUser = await dbService.createUser(userModel);
                    context.log(`FuncUserInfoFullMigration::user '${grUser.id}' created in database`);

                    userModel.Id = newUser.Id;
                    context.log(`FuncUserInfoFullMigration::user '${grUser.id}' creating in search ...`);
                    const indexes = await azSearchService.addOrUpdateUsersIndex([userModel]);
                    context.log(`FuncUserInfoFullMigration::user '${grUser.id}' created in search ${JSON.stringify(indexes)}`);
                }
            } catch (err) {
                context.log(`FuncUserInfoFullMigration::error:${err}::${JSON.stringify(userModel)}`);
            }
        } else {
            context.log(`FuncUserInfoFullMigration::user '${grUser.id}' disabled or deleted, skip updating`);
        }
    }

    if(grUsersRes.nextLink){
        return recursivelyUpdate(context, graphService, dbService, azSearchService, grUsersRes.nextLink, step, loop + 1);
    }
}

export default timerTrigger;