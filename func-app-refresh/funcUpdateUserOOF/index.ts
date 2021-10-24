import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { dbConfig, authConfig, azSearchConfig } from "../settings";
import { DBService, AuthService, GraphService, AzSearchService } from "../../common";
import { IMailboxSettings } from "../../common/models/graph/IMailboxSettings";
import { GRAPH } from "../constants";

const timerTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        context.log('START::FuncUpdateUserOOF');
        const dbService = new DBService(dbConfig, context.log);
        const authService = new AuthService(authConfig);
        const token = await authService.getAccessTokenClientCreds();
        const graphService = new GraphService(GRAPH.API_URL, token);
        const azSearchService = new AzSearchService(azSearchConfig);
        
        await recursivelyUpdate(context, graphService, dbService, azSearchService);

    } catch (err) {
        context.log.error(`FuncUpdateUserOOF::error:${err}`);
    } finally {
        context.log('END::FuncUpdateUserOOF');
    }
};

async function recursivelyUpdate(context: Context, graphService: GraphService, dbService: DBService, azSearchService: AzSearchService, step: number = 20, loop: number = 0): Promise<void> {
    context.log(`FuncUpdateUserOOF::recursivelyUpdate - loop:${loop} step:${step}`);
    const skip: number = step * loop;

    context.log('FuncUpdateUserOOF::getting users from DB ...');
    const dbUsers = await dbService.getAllPublishedUsers(skip, step);

    for(const dbUser of dbUsers){
        try {
            context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' getting mailboxSettings`);
            const mailboxSettings: IMailboxSettings = await graphService.getUserMailboxSettings(dbUser.UserAadId);
            context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' mailboxSettings retrieved`);
            
            const isOOO: boolean = isOutOfOffice(mailboxSettings);
            if(dbUser.OutOfOffice !== isOOO) {
                context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' updating OOF status in db ...`);
                await dbService.updateUserOOF(dbUser.Id, isOOO);
                context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' OOF status updated in db`);

                dbUser.OutOfOffice = isOOO;
                context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' updating OOF status in search ...`);
                await azSearchService.addOrUpdateUsersIndex([dbUser]);
                context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' OOF status updated in search`);
            } else {
                context.log(`FuncUpdateUserOOF::user '${dbUser.UserAadId}' no difference found, skip updating`);
            }
        } catch (err) {
            context.log(`FuncUpdateUserOOF::error:${err}::${JSON.stringify(dbUser)}`);
        }
    }

    if(dbUsers.length && dbUsers.length == step){
        return recursivelyUpdate(context, graphService, dbService, azSearchService, step, loop + 1);
    }
}

function isOutOfOffice(settings: IMailboxSettings): boolean {
    let result = false;
    
    if(settings.automaticRepliesSetting.status === "alwaysEnabled") {
        result = true;
    }

    if(settings.automaticRepliesSetting.status === "scheduled") {
        // TODO: implement time zone handling. currently handled as UTC always
        const startDate = new Date(`${settings.automaticRepliesSetting.scheduledStartDateTime.dateTime}Z`);
        const endDate = new Date(`${settings.automaticRepliesSetting.scheduledEndDateTime.dateTime}Z`);
        if(startDate.getTime() <= Date.now() && endDate.getTime() >= Date.now()) {
            result = true;
        }
    }

    return result;
}

export default timerTrigger;