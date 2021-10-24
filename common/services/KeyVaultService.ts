const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

export class KeyVaultService {
    public static async getPrivateKey(url: string, secretName: string, logFunc?: (msg: string) => void): Promise<string> {
        try {
            this.log(`getPrivateKey::getting private key from key-vault`, logFunc);
            const credential = new DefaultAzureCredential();
            const clientSec = new SecretClient(url, credential);
            const secret = await clientSec.getSecret(secretName);

            this.log(`getPrivateKey::private key returned from key-vault successfully`, logFunc);
            return secret.value!;
        }
        catch (error) {
            this.log(`getPrivateKey::${error}`, logFunc)
            throw error;
        }
    }

    private static log(payload: string, logFunc?: (msg: string) => void){
        const msg = `KeyVaultService::${payload}`
        logFunc 
            ? logFunc(msg)
            : console.log(msg);
    };
}