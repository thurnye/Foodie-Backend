export interface UserData {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    aboutMe?: string;
}
export declare function fetchUserData(userId: string): Promise<UserData | null>;
//# sourceMappingURL=userClient.d.ts.map