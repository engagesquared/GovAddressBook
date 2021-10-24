import { IUserProfile, IUserFavourite } from '../../../../common';
import {
    getMyProfile as getMyProfileApi,
    updateMyProfile as updateMyProfileApi,
    finishMyWelcomeTour as finishMyWelcomeTourApi,
    publishMyProfile as publishMyProfileApi,
    meIsAdmin as meIsAdminApi,
    meHasTeamsCallingAccess as meHasTeamsCallingAccessApi,
    getMyFavourites as getMyFavouritesApi,
    addMyFavourite as addMyFavouriteApi,
    deleteMyFavourite as deleteMyFavouriteApi,

    getUserById as getUserByIdApi,
    updateUser as updateUserApi,
    deleteUser as deleteUserApi,
    getUserPhoto as getUserPhotoApi,
    
    extGetUserByAadId as extGetUserByAadIdApi,
    extGetUserPhotoByAadId as extGetUserPhotoByAadIdApi
} from "../apis";

export default class UserService {
    public static async getMyProfile(): Promise<IUserProfile> {
        try {
            const result = await getMyProfileApi();
            return result;
        } catch (error) {
            throw Error("Error getting the data of the current user");
        }
    }

    public static async updateMyProfile(user: IUserProfile): Promise<void> {
        try {
            await updateMyProfileApi(user);
        } catch (error) {
            throw Error(`Error updating a user`);
        }
    }

    public static async meIsAdmin(): Promise<boolean> {
        try {
            const result: boolean = await meIsAdminApi();
            return result;
        } catch (error) {
            throw Error(`Error verifying the current user as a global administrator.`);
        }
    }
    
    public static async meHasTeamsCallingAccess(): Promise<boolean> {
        try {
            const result: boolean = await meHasTeamsCallingAccessApi();
            return result;
        } catch (error) {
            throw Error(`Error checking the current user access Teams Calling.`);
        }
    }

    public static async finishMyWelcomeTour(): Promise<void> {
        try {
            await finishMyWelcomeTourApi()
        } catch (error) {
            throw Error(`Error updating a user's welcome tour finished`);
        }
    }

    public static async publishMyProfile(): Promise<void> {
        try {
            await publishMyProfileApi();
        } catch (error) {
            throw Error(`Error updating a user's profile published`);
        }
    }

    public static async getMyFavourites(): Promise<IUserFavourite[]> {
        try {
            const result = await getMyFavouritesApi();
            return result;
        } catch (error) {
            throw Error(`Error getting your favourites.`);
        }
    }

    public static async addMyFavourite(favourite: IUserFavourite): Promise<void> {
        try {
            await addMyFavouriteApi(favourite);
        } catch (error) {
            throw Error(`Error adding your favourite.`);
        }
    }

    public static async deleteMyFavourite(favourite: IUserFavourite): Promise<void> {
        try {
            await deleteMyFavouriteApi(favourite);
        } catch (error) {
            throw Error(`Error deleting your favourite.`);
        }
    }

    public static async getUserPhoto(id: string): Promise<Blob | undefined> {
        try {
            const result = await getUserPhotoApi(id);
            return result;
        } catch (error) {
            throw Error(`Error getting user photo.`);
        }
    }

    public static async getUserById(id: number | string): Promise<IUserProfile> {
        try {
            const result = await getUserByIdApi(id);
            return result;
        } catch (error) {
            throw Error(`Error getting ${id} user data.`);
        }
    }

    public static async updateUser(user: IUserProfile): Promise<void> {
        try {
            await updateUserApi(user);
        } catch (error) {
            throw Error(`Error updating a user`);
        }
    }

    public static async deleteUser(userId: number): Promise<void> {
        try {
            await deleteUserApi(userId);
        } catch (error) {
            throw Error(`Error deleting a user`);
        }
    }

    public static async getUserByAadIdExt(connectionId: number, aadId: string): Promise<IUserProfile> {
        try {
            const result = await extGetUserByAadIdApi(connectionId, aadId);
            return result;
        } catch (error) {
            throw Error(`Error getting user:${aadId} connection:${connectionId} external user data.`);
        }
    }

    public static async getUserPhotoByAadIdExt(connectionId: number, aadId: string): Promise<Blob | undefined> {
        try {
            const result = await extGetUserPhotoByAadIdApi(connectionId, aadId);
            return result;
        } catch (error) {
            throw Error(`Error getting user:${aadId} connection:${connectionId} external user data.`);
        }
    }
}