import { IUser } from '../db/User';
export declare class UserService {
    createProfile(data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        username?: string;
        bio?: string;
        dateOfBirth?: string;
        gender?: string;
        phoneNumber?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    }): Promise<IUser>;
    getUserById(userId: string): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser>;
    getUserByUsername(username: string): Promise<IUser>;
    updateProfile(userId: string, updates: {
        firstName?: string;
        lastName?: string;
        username?: string;
        bio?: string;
        avatar?: string;
        dateOfBirth?: string;
        gender?: string;
        phoneNumber?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
    }): Promise<IUser>;
    deleteProfile(userId: string): Promise<void>;
    updateReputation(userId: string, points: number): Promise<IUser>;
    getUsers(page?: number, limit?: number): Promise<{
        users: IUser[];
        total: number;
    }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=UserService.d.ts.map