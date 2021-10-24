import axios from 'axios';
import { IDBPartnerOutgoingConnection, IUserFavourite, IDBPartnerIncomingConnection, IDBCustomField, IUserProfile, IAzSearchRequest, IAzSearchResult, IDBEntity, IClientEnvConfig } from '../../../../common';
import { ISearchConnection } from '../../../../common/models/api/ISearchConnection';


// ME
export const getMyProfile = async (): Promise<IUserProfile> => {
    const result = (await axios.get<IUserProfile>("/api/me")).data;
    return result;
}

export const updateMyProfile = async (user: IUserProfile): Promise<void> => {
    await axios.put(`/api/me`, user);
}

export const finishMyWelcomeTour = async (): Promise<void> => {
    await axios.put(`/api/me/welcomeTourFinished`);
}

export const publishMyProfile = async (): Promise<void> => {
    await axios.put(`/api/me/publish`);
}

export const meIsAdmin = async (): Promise<boolean> => {
    const result = (await axios.get<boolean>(`/api/me/isAdmin`)).data;
    return result;
}

export const meHasTeamsCallingAccess = async (): Promise<boolean> => {
    const result = (await axios.get<boolean>(`/api/me/hasTeamsCallingAccess`)).data;
    return result;
}

export const getMyFavourites = async (): Promise<IUserFavourite[]> => {
    const result = (await axios.get<IUserFavourite[]>(`/api/me/fav`)).data;
    return result;
}

export const addMyFavourite = async (favourite: IUserFavourite): Promise<void> => {
    if(favourite.PartnerOutgoingConnectionId) {
        await axios.post(`/api/me/favExternal`, favourite);
    } else {
        await axios.post(`/api/me/favInternal/${favourite.Id}`);
    }
}

export const deleteMyFavourite = async (favourite: IUserFavourite): Promise<void> => {
    if(favourite.PartnerOutgoingConnectionId) {
        await axios.delete(`/api/me/favExternal/${favourite.UserAadId}`);
    } else {
        await axios.delete(`/api/me/favInternal/${favourite.Id}`);
    }
}

export const getMyCustomFields = async (): Promise<IDBCustomField[]> => {
    const result = (await axios.get<IDBCustomField[]>(`/api/me/customFields`)).data;
    return result;
}

export const addMyCustomField = async (customField: Partial<IDBCustomField>): Promise<number> => {
    const result = (await axios.post<IDBEntity>(`/api/me/customFields`, customField)).data;
    return Number(result.Id);
}

export const updateMyCustomField = async (customField: IDBCustomField): Promise<void> => {
    await axios.put(`/api/me/customFields/${customField.Id}`, customField);
}

export const deleteMyCustomField = async (customFieldId: number): Promise<void> => {
    await axios.delete(`/api/me/customFields/${customFieldId}`);
}
// ME

// USER
export const getUserById = async (id: number | string): Promise<IUserProfile> => {
    const result = (await axios.get<IUserProfile>(`/api/users/${id}`)).data;
    return result;
}

export const getUserPhoto = async (id: string): Promise<Blob | undefined> => {
    const result = (await axios.get<Blob | undefined>(`/api/users/${id}/photo`, { responseType: "blob" })).data;
    return result;
}

export const updateUser = async (user: IUserProfile): Promise<void> => {
    await axios.put(`/api/users/${user.Id}`, user);
}

export const deleteUser = async (userId: number): Promise<void> => {
    await axios.delete(`/api/users/${userId}`);
}

export const getUserCustomFields = async (userId: number | string): Promise<IDBCustomField[]> => {
    const result = (await axios.get<IDBCustomField[]>(`/api/users/${userId}/customFields`)).data;
    return result;
}

export const addUserCustomField = async (userId: number, customField: Partial<IDBCustomField>): Promise<number> => {
    const result = (await axios.post<IDBEntity>(`/api/users/${userId}/customFields`, customField)).data;
    return Number(result.Id);
}

export const updateUserCustomField = async (userId: number, customField: IDBCustomField): Promise<void> => {
    await axios.put(`/api/users/${userId}/customFields/${customField.Id}`, customField);
}

export const deleteUserCustomField = async (customFieldId: number): Promise<void> => {
    await axios.delete(`/api/users/customFields/${customFieldId}`);
}
// USER

// INC_CONNECTION
export const getAllIncConnections = async (): Promise<IDBPartnerIncomingConnection[]> => {
    const result = (await axios.get<IDBPartnerIncomingConnection[]>(`/api/incConnection`)).data;
    return result;
}

export const addIncConnection = async (incConnection: Partial<IDBPartnerIncomingConnection>): Promise<number> => {
    const result = (await axios.post<IDBEntity>(`/api/incConnection`, incConnection)).data;
    return Number(result.Id);
}

export const updateIncConnection = async (incConnection: IDBPartnerIncomingConnection): Promise<void> => {
    await axios.put(`/api/incConnection/${incConnection.Id}`, incConnection)
}

export const deleteIncConnection = async (incConnectionId: number): Promise<void> => {
    await axios.delete(`/api/incConnection/${incConnectionId}`);
}
// INC_CONNECTION

// OUT_CONNECTION
export const getAllOutConnections = async (): Promise<IDBPartnerOutgoingConnection[]> => {
    const result = (await axios.get<IDBPartnerOutgoingConnection[]>(`/api/outConnection`)).data;
    return result;
}

export const addOutConnection = async (outConnection: Partial<IDBPartnerOutgoingConnection>): Promise<number> => {
    const result = (await axios.post<IDBEntity>(`/api/outConnection`, outConnection)).data;
    return Number(result.Id);
}

export const updateOutConnection = async (outConnection: IDBPartnerOutgoingConnection): Promise<void> => {
    await axios.put(`/api/outConnection/${outConnection.Id}`, outConnection);
}

export const deleteOutConnection = async (outConnectionId: number): Promise<void> => {
    await axios.delete(`/api/outConnection/${outConnectionId}`);
}
// OUT_CONNECTION

// SERVER_INFO
export const getServerPublicIp = async (): Promise<string> => {
    const result = (await axios.get<string>(`/api/serverPublicIp`)).data;
    return result;
}

export const getClientEnv = async (): Promise<IClientEnvConfig> => {
    const result = (await axios.get<IClientEnvConfig>(`/api/env`)).data;
    return result;
}
// SERVER_INFO

// SEARCH
export const search = async (request: IAzSearchRequest): Promise<IAzSearchResult> => {
    const result = (await axios.post<IAzSearchResult>(`/api/search`, request)).data;
    return result;
}

export const getConnections = async (): Promise<ISearchConnection[]> => {
    const result = (await axios.get<ISearchConnection[]>(`/api/connections`)).data;
    return result;
}
// SEARCH

// EXTERNAL API
export const extSearch = async (connectionId: number, request: IAzSearchRequest): Promise<IAzSearchResult> => {
    const result = (await axios.post<IAzSearchResult>(`/api/external/${connectionId}/search`, request)).data;
    return result;
}

export const extGetUserByAadId = async (connectionId: number, userAadId: string): Promise<IUserProfile> => {
    const result = (await axios.get<IUserProfile>(`/api/external/${connectionId}/user/${userAadId}`)).data;
    return result;
}

export const extGetUserPhotoByAadId = async (connectionId: number, userAadId: string): Promise<Blob | undefined> => {
    const result = (await axios.get<Blob | undefined>(`/api/external/${connectionId}/user/${userAadId}/photo`, { responseType: "blob" })).data;
    return result;
}

export const extGetUserCustomFields = async (connectionId: number, userAadId: string): Promise<IDBCustomField[]> => {
    const result = (await axios.get<IDBCustomField[]>(`/api/external/${connectionId}/user/${userAadId}/customFields`)).data;
    return result;
}
// EXTERNAL API