import { IUser } from '../db/User';
export declare class UserService {
  createProfile(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
  }): Promise<IUser>;
  getUserById(userId: string): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  updateProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      avatar?: string;
    }
  ): Promise<IUser>;
  deleteProfile(userId: string): Promise<void>;
  updateReputation(userId: string, points: number): Promise<IUser>;
  getUsers(
    page?: number,
    limit?: number
  ): Promise<{
    users: IUser[];
    total: number;
  }>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=UserService.d.ts.map
