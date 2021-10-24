import axios from "axios";
import { EXTERNAL_API_ENDPOINTS } from "./ExternalApiService";

//
// const remoteIPv4Url = "http://ipv4bot.whatismyipaddress.com/";
// const remoteIPv6Url = "http://ipv6bot.whatismyipaddress.com/";

export class ExternalIPService {

  public static async getPublicIPAddress(url: string, apiKey: string): Promise<string> {
    const endpoint: string = `${url}/api${EXTERNAL_API_ENDPOINTS.EXTERNAL_IP}`;
    try {
      this.log(`getExternalIPAddress url:${endpoint} aadId:${apiKey} ...`);
      const response = await axios.post<string>(endpoint, undefined, {
        headers: {
          "Content-Type": "application/json",
          apikey: `${apiKey}`,
        },
      });

      const result = await Promise.resolve(response.data);
      this.log(`getExternalIPAddress url:${endpoint} aadId:${apiKey} executed`);
      return result;
    } catch (err: any) {
      this.log(`getExternalIPAddress url:${endpoint} aadId:${apiKey} exception:${JSON.stringify(err)}`);
      throw err;
    }
  }

  // public static async getExternalIPv4(): Promise<string | undefined> {
  //   let result = undefined;
  //   try {
  //     this.log("getExternalIPv4 ...");
  //     const response = await axios.get(remoteIPv4Url);
  //     if (response && response.data) {
  //       result = response.data;
  //     }
  //   } catch (err) {
  //     this.log(`getExternalIPv4 exception ${JSON.stringify(err)}`);
  //     throw err;
  //   }

  //   this.log(`getExternalIPv4 executed ${result}`);
  //   return result;
  // }

  // public static async getExternalIPv6(): Promise<string | undefined> {
  //   let result = undefined;
  //   try {
  //     this.log("getExternalIPv6 ...");
  //     const response = await axios.get(remoteIPv6Url);
  //     if (response && response.data) {
  //       result = response.data;
  //     }
  //   } catch (err) {
  //     this.log(`getExternalIPv6 exception ${JSON.stringify(err)}`);
  //     throw err;
  //   }

  //   this.log(`getExternalIPv6 executed '${result}''`);
  //   return result;
  // }

  private static log(payload: string) {
    console.log(`ExternalIPService::${payload}`);
  }
}
