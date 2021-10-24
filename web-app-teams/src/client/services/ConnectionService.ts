import { ISearchConnection } from '../../../../common/models/api/ISearchConnection';
import { IDBPartnerIncomingConnection } from '../../../../common/models/db/IDBPartnerIncomingConnection';
import { IDBPartnerOutgoingConnection } from '../../../../common/models/db/IDBPartnerOutgoingConnection';
import {
    getAllIncConnections as getAllIncConnectionsApi,
    addIncConnection as addIncConnectionApi,
    updateIncConnection as updateIncConnectionApi,
    deleteIncConnection as deleteIncConnectionApi,

    getAllOutConnections as getAllOutConnectionsApi,
    addOutConnection as addOutConnectionApi,
    updateOutConnection as updateOutConnectionApi,
    deleteOutConnection as deleteOutConnectionApi,

    getConnections as getConnectionsApi,
    getServerPublicIp as getServerPublicIpApi,
} from "../apis";

export default class ConnectionService {
    public static async getConnections(): Promise<ISearchConnection[]> {
        try {
            const result = await getConnectionsApi();
            return result;
        } catch (error) {
            throw Error("Error getting all connections for search");
        }
    }

    public static async getAllIncoming(): Promise<IDBPartnerIncomingConnection[]> {
        try {
            const result = await getAllIncConnectionsApi();
            return result;
        } catch (error) {
            throw Error("Error getting all incoming connections");
        }
    }

    public static async addIncoming(incConnection: IDBPartnerIncomingConnection): Promise<IDBPartnerIncomingConnection> {
        try {
            const id = await addIncConnectionApi(incConnection);
            return {
                ...incConnection,
                Id: id
            } as IDBPartnerIncomingConnection;
        } catch (error) {
            throw Error("Error adding incoming connection");
        }
    }

    public static async updateIncoming(incConnection: IDBPartnerIncomingConnection): Promise<void> {
        try {
            await updateIncConnectionApi(incConnection);
        } catch (error) {
            throw Error("Error updating incoming connection");
        }
    }

    public static async deleteIncoming(incConnectionId: number): Promise<void> {
        try {
            await deleteIncConnectionApi(incConnectionId);
        } catch (error) {
            throw Error(`Error deleting ${incConnectionId} incoming connection`);
        }
    }

    public static async getAllOutgoing(): Promise<IDBPartnerOutgoingConnection[]> {
        try {
            const outConnections = await getAllOutConnectionsApi();
            return outConnections;
        } catch (error) {
            throw Error("Error getting all outgoing connections");
        }
    }

    public static async addOutgoing(outConnection: IDBPartnerOutgoingConnection): Promise<IDBPartnerOutgoingConnection> {
        try {
            const id = await addOutConnectionApi(outConnection);
            return {
                ...outConnection,
                Id: id
            } as IDBPartnerOutgoingConnection;
        } catch (error) {
            throw Error("Error adding outgoing connection");
        }
    }

    public static async updateOutgoing(outConnection: IDBPartnerOutgoingConnection): Promise<void> {
        try {
            await updateOutConnectionApi(outConnection);
        } catch (error) {
            throw Error("Error updating outgoing connection");
        }
    }

    public static async deleteOutgoing(outConnectionId: number): Promise<void> {
        try {
            await deleteOutConnectionApi(outConnectionId);
        } catch (error) {
            throw Error(`Error deleting ${outConnectionId} outgoing connection`);
        }
    }

    public static async getServerPublicIp():Promise<string> {
        try {
            const response = await getServerPublicIpApi();
            return response;
        } catch (error) {
            throw Error(`Error getting server info`);
        }
    }
}