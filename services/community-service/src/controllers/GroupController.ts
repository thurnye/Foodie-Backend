import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import GroupService from '../services/GroupService';

export class GroupController {
  /**
   * Get all groups with filters
   */
  async getAllGroups(req: Request, res: Response) {
    try {
      const { search, tags, isPrivate, sort = 'newest' } = req.query;

      const groups = await GroupService.getAllGroups({
        search: search as string,
        tags: tags as string,
        isPrivate: isPrivate === 'true' ? true : isPrivate === 'false' ? false : undefined,
        sort: sort as 'newest' | 'popular' | 'name',
      });

      res.json({ success: true, data: groups });
    } catch (error: any) {
      logger.error('Error fetching groups', { error: error.message });
      res.status(500).json({ success: false, message: 'Failed to fetch groups' });
    }
  }

  /**
   * Get group by ID
   */
  async getGroupById(req: Request, res: Response): Promise<void> {
    try {
      const { groupId } = req.params;

      const group = await GroupService.getGroupById(groupId);

      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error fetching group', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to fetch group' });
    }
  }

  /**
   * Create a new group
   */
  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { name, description, coverImage, icon, isPrivate, tags, rules } = req.body;

      const group = await GroupService.createGroup(userId, {
        name,
        description,
        coverImage,
        icon,
        isPrivate,
        tags,
        rules,
      });

      res.status(201).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error creating group', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create group' });
    }
  }

  /**
   * Update a group
   */
  async updateGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { groupId } = req.params;
      const updates = req.body;

      const group = await GroupService.updateGroup(groupId, userId, updates);

      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error updating group', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to update group' });
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { groupId } = req.params;

      await GroupService.deleteGroup(groupId, userId);

      res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting group', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to delete group' });
    }
  }

  /**
   * Join a group
   */
  async joinGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { groupId } = req.params;

      const group = await GroupService.joinGroup(groupId, userId);

      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error joining group', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to join group' });
    }
  }

  /**
   * Leave a group
   */
  async leaveGroup(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { groupId } = req.params;

      await GroupService.leaveGroup(groupId, userId);

      res.json({ success: true, message: 'Left group successfully' });
    } catch (error: any) {
      logger.error('Error leaving group', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to leave group' });
    }
  }

  /**
   * Get user's joined groups
   */
  async getMyGroups(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string;

      const groups = await GroupService.getMyGroups(userId);

      res.json({ success: true, data: groups });
    } catch (error: any) {
      logger.error('Error fetching user groups', { error: error.message });
      res.status(500).json({ success: false, message: 'Failed to fetch your groups' });
    }
  }

  /**
   * Cancel join request
   */
  async cancelJoinRequest(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { groupId } = req.params;

      const group = await GroupService.cancelJoinRequest(groupId, userId);

      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error cancelling join request', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to cancel join request' });
    }
  }

  /**
   * Approve join request
   */
  async approveJoinRequest(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = req.headers['x-user-id'] as string;
      const { groupId, userId } = req.params;

      const group = await GroupService.approveJoinRequest(groupId, adminUserId, userId);

      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error approving join request', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to approve join request' });
    }
  }

  /**
   * Reject join request
   */
  async rejectJoinRequest(req: Request, res: Response): Promise<void> {
    try {
      const adminUserId = req.headers['x-user-id'] as string;
      const { groupId, userId } = req.params;

      const group = await GroupService.rejectJoinRequest(groupId, adminUserId, userId);

      res.json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Error rejecting join request', { error: error.message, groupId: req.params.groupId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to reject join request' });
    }
  }
}

export default new GroupController();
