export interface UserData {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    slogan: string;
}
export declare function fetchUserData(userId: string): Promise<UserData | null>;
export declare function fetchUsersData(userIds: string[]): Promise<Map<string, UserData>>;
//# sourceMappingURL=userClient.d.ts.map