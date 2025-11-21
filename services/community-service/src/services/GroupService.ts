import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Group, IGroup } from '../models/Group.model';
import { Post } from '../models/Post.model';
import { fetchUserData, UserData } from '../utils/userClient';

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

class GroupService {
  /**
   * Get all groups with filters
   */
  async getAllGroups(filters: GetGroupsFilters = {}): Promise<GroupWithUser[]> {
    try {
      const { search, tags, isPrivate, sort = 'newest' } = filters;

      let query: any = {};

      // Search filter
      if (search) {
        query.$text = { $search: search };
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',');
        query.tags = { $in: tagArray };
      }

      // Privacy filter
      // if (isPrivate !== undefined) {
      //   query.isPrivate = isPrivate;
      // }

      // Sorting
      let sortQuery: any = {};
      switch (sort) {
        case 'popular':
          sortQuery = { memberCount: -1 };
          break;
        case 'name':
          sortQuery = { name: 1 };
          break;
        default: // newest
          sortQuery = { createdAt: -1 };
      }

      const groups = await Group.find(query)
        .sort(sortQuery)
        .lean();

      // Fetch user data for creators
      const groupsWithUsers = await Promise.all(
        groups.map(async (group) => {
          const creator = await fetchUserData(group.creator.toString());
          return {
            ...group,
            creator: creator || group.creator,
          } as any as GroupWithUser;
        })
      );

      logger.info('Groups fetched', { count: groupsWithUsers.length });

      return groupsWithUsers;
    } catch (error) {
      logger.error('Error fetching groups', { error });
      throw error;
    }
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId: string): Promise<GroupWithUser> {
    try {
      const group = await Group.findById(groupId).lean();

      if (!group) {
        throw Errors.notFound('Group not found');
      }

      // Fetch user data for creator and members
      const creator = await fetchUserData(group.creator.toString());
      const membersWithUsers = await Promise.all(
        group.members.map(async (member) => {
          const user = await fetchUserData(member.user.toString());
          return {
            ...member,
            user: user || member.user,
          };
        })
      );

      const groupWithUsers = {
        ...group,
        creator: creator || group.creator,
        members: membersWithUsers,
      } as any as GroupWithUser;

      logger.info('Group fetched', { groupId });

      return groupWithUsers;
    } catch (error) {
      logger.error('Error fetching group', { error, groupId });
      throw error;
    }
  }

  /**
   * Create a new group
   */
  async createGroup(userId: string, data: CreateGroupData): Promise<GroupWithUser> {
    try {
      const { name, description, coverImage, icon, isPrivate, tags, rules } = data;

      const group = await Group.create({
        name,
        description,
        coverImage,
        icon,
        isPrivate: isPrivate || false,
        creator: userId,
        tags: tags || [],
        rules: rules || [],
      });

      const createdGroup = await Group.findById(group._id).lean();

      // Fetch creator user data from user-service
      const creator = await fetchUserData(userId);
      const groupWithCreator = {
        ...createdGroup!,
        creator: creator || userId as any,
      } as any as GroupWithUser;

      logger.info('Group created', { groupId: group._id, userId });

      return groupWithCreator;
    } catch (error) {
      logger.error('Error creating group', { error, userId });
      throw error;
    }
  }

  /**
   * Update a group
   */
  async updateGroup(groupId: string, userId: string, updates: UpdateGroupData): Promise<GroupWithUser> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw Errors.notFound('Group not found');
      }

      // Check if user is admin
      const member = group.members.find(m => m.user.toString() === userId);
      if (!member || member.role !== 'admin') {
        throw Errors.forbidden('Only group admins can update the group');
      }

      Object.assign(group, updates);
      await group.save();

      const updatedGroup = await Group.findById(groupId).lean();

      // Fetch creator user data
      const creator = await fetchUserData(updatedGroup!.creator.toString());
      const groupWithCreator = {
        ...updatedGroup!,
        creator: creator || updatedGroup!.creator,
      } as any as GroupWithUser;

      logger.info('Group updated', { groupId, userId });

      return groupWithCreator;
    } catch (error) {
      logger.error('Error updating group', { error, groupId });
      throw error;
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw Errors.notFound('Group not found');
      }

      // Check if user is creator
      if (group.creator.toString() !== userId) {
        throw Errors.forbidden('Only the group creator can delete the group');
      }

      // Delete all posts in the group
      await Post.deleteMany({ group: groupId });

      await group.deleteOne();

      logger.info('Group deleted', { groupId, userId });
    } catch (error) {
      logger.error('Error deleting group', { error, groupId });
      throw error;
    }
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string, userId: string): Promise<GroupWithUser> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw Errors.notFound('Group not found');
      }

      // Check if already a member
      const existingMember = group.members.find(m => m.user.toString() === userId);
      if (existingMember) {
        throw Errors.badRequest('Already a member of this group');
      }

      group.members.push({
        user: userId as any,
        role: 'member',
        joinedAt: new Date(),
      });
      group.memberCount += 1;
      await group.save();

      const updatedGroup = await Group.findById(groupId).lean();

      // Fetch creator user data
      const creator = await fetchUserData(updatedGroup!.creator.toString());
      const groupWithCreator = {
        ...updatedGroup!,
        creator: creator || updatedGroup!.creator,
      } as any as GroupWithUser;

      logger.info('User joined group', { groupId, userId });

      return groupWithCreator;
    } catch (error) {
      logger.error('Error joining group', { error, groupId });
      throw error;
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string, userId: string): Promise<void> {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        throw Errors.notFound('Group not found');
      }

      // Cannot leave if creator
      if (group.creator.toString() === userId) {
        throw Errors.badRequest('Group creator cannot leave the group');
      }

      const memberIndex = group.members.findIndex(m => m.user.toString() === userId);
      if (memberIndex === -1) {
        throw Errors.badRequest('Not a member of this group');
      }

      group.members.splice(memberIndex, 1);
      group.memberCount = Math.max(0, group.memberCount - 1);
      await group.save();

      logger.info('User left group', { groupId, userId });
    } catch (error) {
      logger.error('Error leaving group', { error, groupId });
      throw error;
    }
  }

  /**
   * Get user's joined groups
   */
  async getMyGroups(userId: string): Promise<GroupWithUser[]> {
    try {
      const groups = await Group.find({ 'members.user': userId })
        .sort({ createdAt: -1 })
        .lean();

      // Fetch user data for creators
      const groupsWithUsers = await Promise.all(
        groups.map(async (group) => {
          const creator = await fetchUserData(group.creator.toString());
          return {
            ...group,
            creator: creator || group.creator,
          } as any as GroupWithUser;
        })
      );

      logger.info('User groups fetched', { userId, count: groupsWithUsers.length });

      return groupsWithUsers;
    } catch (error) {
      logger.error('Error fetching user groups', { error, userId });
      throw error;
    }
  }
}

export default new GroupService();
