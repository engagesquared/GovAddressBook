import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { dbConfig, authConfig, azSearchConfig } from "../settings";
import { DBService, AuthService, GraphService, AzSearchService } from "../../common";
import { GRAPH } from "../constants";

const timerTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        context.log('START::FuncDeleteUser');
        const dbService = new DBService(dbConfig, context.log);
        const authService = new AuthService(authConfig);
        const token = await authService.getAccessTokenClientCreds();
        const graphService = new GraphService(GRAPH.API_URL, token, context.log);
        const azSearchService = new AzSearchService(azSearchConfig);

        await recursivelyDelete(context, graphService, dbService, azSearchService);

    } catch (err) {
        context.log.error(`FuncDeleteUser::error:${err}`);
    } finally {
        context.log('END::FuncDeleteUser');
    }
};

async function recursivelyDelete(context: Context, graphService: GraphService, dbService: DBService, azSearchService: AzSearchService, step: number = 20, loop: number = 0): Promise<void> {
    context.log(`FuncDeleteUser::recursivelyDelete - loop:${loop} step:${step}`);
    const skip: number = step * loop;

    context.log('FuncDeleteUser::getting users from database ...');
    const dbUsers = await dbService.getAllPublishedUsers(skip, step);

    for(const dbUser of dbUsers){
        try {
            const grUser = await graphService.getUserById(dbUser.UserAadId);
            if(!grUser || !grUser.accountEnabled){
                context.log(`FuncDeleteUser::user '${dbUser.UserAadId}' deleting from database ...`);
                await dbService.deleteUserById(dbUser.Id);
                context.log(`FuncDeleteUser::user '${dbUser.UserAadId}' deleted from database`);

                context.log(`FuncDeleteUser::user '${dbUser.UserAadId}' deleting from search ...`);
                await azSearchService.deleteUsersIndex([dbUser]);
                context.log(`FuncDeleteUser::user '${dbUser.UserAadId}' deleted from search`);
            } else {
                context.log(`FuncDeleteUser::user '${dbUser.UserAadId}' is active, skip deleting`);
            }
        } catch (err) {
            context.log(`FuncDeleteUser::error:${err}::${JSON.stringify(dbUser)}`);
        }
    }

    if(dbUsers.length && dbUsers.length == step){
        return recursivelyDelete(context, graphService, dbService, azSearchService, step, loop + 1);
    }
}

export default timerTrigger;