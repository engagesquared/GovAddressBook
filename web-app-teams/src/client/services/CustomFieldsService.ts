import { IDBCustomField } from '../../../../common/models/db/IDBCustomField';
import {
    getMyCustomFields as getMyCustomFieldsApi,
    addMyCustomField as addMyCustomFieldApi,
    updateMyCustomField as updateMyCustomFieldApi,
    deleteMyCustomField as deleteMyCustomFieldApi,
    extGetUserCustomFields as extGetUserCustomFieldsApi,

    getUserCustomFields as getUserCustomFieldsApi,
    addUserCustomField as addUserCustomFieldApi,
    updateUserCustomField as updateUserCustomFieldApi,
} from "../apis";

export default class CustomFieldService {
    public static async getAll(): Promise<IDBCustomField[]> {
        try {
            const result = await getMyCustomFieldsApi();
            return result;
        } catch (error) {
            throw Error(`Error getting your custom fields`);
        }
    }

    public static async add(customField: Partial<IDBCustomField>): Promise<IDBCustomField> {
        try {
            const id = await addMyCustomFieldApi(customField);
            return {
                ...customField,
                Id: id
            } as IDBCustomField;
        } catch (error) {
            throw Error(`Error adding your custom field`);
        }
    }

    public static async addWithUserId(userId: number, customField: Partial<IDBCustomField>): Promise<IDBCustomField> {
        try {
            const id = await addUserCustomFieldApi(userId, customField);
            return {
                ...customField,
                Id: id
            } as IDBCustomField;
        } catch (error) {
            throw Error(`Error adding your custom field`);
        }
    }

    public static async update(customField: IDBCustomField): Promise<void> {
        try {
            await updateMyCustomFieldApi(customField);
        } catch (error) {
            throw Error(`Error updating your custom field`);
        }
    }

    public static async updateWithUserId(userId: number, customField: IDBCustomField): Promise<void> {
        try {
            await updateUserCustomFieldApi(userId, customField);
        } catch (error) {
            throw Error(`Error updating your custom field`);
        }
    }

    public static async delete(id: number): Promise<void> {
        try {
            await deleteMyCustomFieldApi(id);
        } catch (error) {
            throw Error(`Error deleting custom field`);
        }
    }

    public static async getByUserId(userId: string | number): Promise<IDBCustomField[]> {
        try {
            const result = await getUserCustomFieldsApi(userId);
            return result;
        } catch (error) {
            throw Error(`Error getting '${userId}' user custom fields`);
        }
    }

    public static async getAllExt(connectionId: number, aadId: string): Promise<IDBCustomField[]> {
        try {
            const result = await extGetUserCustomFieldsApi(connectionId, aadId);
            return result;
        } catch (error) {
            throw Error(`Error getting user:${aadId} connection:${connectionId} user custom fields`);
        }
    }
}