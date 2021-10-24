import { IClientEnvConfig } from "../../../../common";
import { getClientEnv as getClientEnvApi} from "../apis";

export default class EnvService {
    public static async getEnv(): Promise<IClientEnvConfig> {
        const result = await getClientEnvApi();
        return result;
    }
}