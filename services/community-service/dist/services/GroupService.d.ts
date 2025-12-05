import { Types } from 'mongoose';
import { UserData } from '../utils/userClient';
interface CreateGroupData {
    name: string;
    description: string;
    coverImage?: string;
    icon?: string;
    isPrivate?: boolean;
    tags?: string[];
    rules?: string[];
}
interface UpdateGroupData {
    name?: string;
    description?: string;
    coverImage?: string;
    icon?: string;
    isPrivate?: boolean;
    tags?: string[];
    rules?: string[];
}
interface GetGroupsFilters {
    search?: string;
    tags?: string;
    isPrivate?: boolean;
    sort?: 'newest' | 'popular' | 'name';
}
interface GroupWithUser {
    _id: any;
    name: string;
    description: string;
    coverImage?: string;
    icon?: string;
    isPrivate: boolean;
    creator: UserData | Types.ObjectId;
    members: Array<{
        user: UserData | Types.ObjectId;
        role: 'admin' | 'moderator' | 'member';
        joinedAt: Date;
    }>;
    memberCount: number;
    postCount: number;
    tags: string[];
    rules?: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare class GroupService {
    getAllGroups(filters?: GetGroupsFilters): Promise<GroupWithUser[]>;
    getGroupById(groupId: string): Promise<GroupWithUser>;
    createGroup(userId: string, data: CreateGroupData): Promise<GroupWithUser>;
    updateGroup(groupId: string, userId: string, updates: UpdateGroupData): Promise<GroupWithUser>;
    deleteGroup(groupId: string, userId: string): Promise<void>;
    joinGroup(groupId: string, userId: string): Promise<GroupWithUser>;
    cancelJoinRequest(groupId: string, userId: string): Promise<GroupWithUser>;
    approveJoinRequest(groupId: string, adminUserId: string, requestUserId: string): Promise<GroupWithUser>;
    rejectJoinRequest(groupId: string, adminUserId: string, requestUserId: string): Promise<GroupWithUser>;
    leaveGroup(groupId: string, userId: string): Promise<void>;
    getMyGroups(userId: string): Promise<GroupWithUser[]>;
}
declare const _default: GroupService;
export default _default;
//# sourceMappingURL=GroupService.d.ts.map