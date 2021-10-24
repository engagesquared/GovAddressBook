import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { dbConfig, authConfig } from "../settings";
import { DBService, AuthService, GraphService } from "../../common";
import { GRAPH, TEAMS_TAB, TEAMS_APP } from "../constants";

const timerTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        context.log('START::FuncCompleteUserProfileNotification');
        const dbService = new DBService(dbConfig, context.log);
        const authService = new AuthService(authConfig);
        const token = await authService.getAccessTokenClientCreds();
        const graphService = new GraphService(GRAPH.API_URL, token);
        
        await recursivelyUpdate(context, graphService, dbService);
    } catch (err) {
        context.log.error(`FuncCompleteUserProfileNotification::error:${err}`);
    } finally {
        context.log('END::FuncCompleteUserProfileNotification');
    }
};

async function recursivelyUpdate(context: Context, graphService: GraphService, dbService: DBService, step: number = 20, loop: number = 0): Promise<void> {
    context.log(`FuncCompleteUserProfileNotification::recursivelyUpdate - loop:${loop} step:${step}`);
    const skip: number = step * loop;

    context.log('FuncCompleteUserProfileNotification::getting users from DB ...');
    const dbUsers = await dbService.getAllUnPublishedUsers(skip, step);

    for(const dbUser of dbUsers){
        try {
            context.log(`FuncCompleteUserProfileNotification:: '${dbUser.UserAadId}' sending norification ...`);
            await graphService.sendUnPublishedProfileUserNotification(
                TEAMS_APP.ID, 
                TEAMS_APP.TITLE,
                TEAMS_TAB.MY_PROFILE.ID,
                TEAMS_TAB.MY_PROFILE.NAME,
                TEAMS_TAB.MY_PROFILE.URL,
                dbUser.UserAadId
            );
            context.log(`FuncCompleteUserProfileNotification:: '${dbUser.UserAadId}' notification sended `);
        } catch (err) {
            context.log(`FuncCompleteUserProfileNotification::error:${err}::${JSON.stringify(dbUser)}`);
        }
    }

    if(dbUsers.length && dbUsers.length == step){
        return recursivelyUpdate(context, graphService, dbService, step, loop + 1);
    }
}

export default timerTrigger;