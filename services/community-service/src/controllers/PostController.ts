import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import PostService from '../services/PostService';

export class PostController {
  /**
   * Get all posts with filters
   */
  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const { groupId, authorId, search, tags, sort = 'newest', isPinned } = req.query;

      const posts = await PostService.getAllPosts({
        groupId: groupId as string,
        authorId: authorId as string,
        search: search as string,
        tags: tags as string,
        sort: sort as 'newest' | 'popular' | 'trending',
        isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
      });

      res.json({ success: true, data: posts });
    } catch (error: any) {
      logger.error('Error fetching posts', { error: error.message });
      res.status(500).json({ success: false, message: 'Failed to fetch posts' });
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      const post = await PostService.getPostById(postId);

      res.json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error fetching post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to fetch post' });
    }
  }

  /**
   * Create a new post
   */
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { groupId, title, content, media, tags } = req.body;

      const post = await PostService.createPost(userId, {
        groupId,
        title,
        content,
        media,
        tags,
      });

      res.status(201).json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error creating post', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create post' });
    }
  }

  /**
   * Update a post
   */
  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const { title, content, media, tags } = req.body;

      const post = await PostService.updatePost(postId, userId, {
        title,
        content,
        media,
        tags,
      });

      res.json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error updating post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to update post' });
    }
  }

  /**
   * Delete a post
   */
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;

      await PostService.deletePost(postId, userId);

      res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to delete post' });
    }
  }

  /**
   * Vote on a post (upvote or downvote)
   */
  async votePost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const { value } = req.body;

      const post = await PostService.votePost(postId, userId, value);

      res.json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error voting on post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to vote on post' });
    }
  }

  /**
   * Remove vote from a post
   */
  async removeVote(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;

      const post = await PostService.removeVote(postId, userId);

      res.json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error removing vote from post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to remove vote' });
    }
  }

  /**
   * React to a post
   */
  async reactToPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;
      const { type } = req.body;

      const post = await PostService.reactToPost(postId, userId, type);

      res.json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error reacting to post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to react to post' });
    }
  }

  /**
   * Remove reaction from a post
   */
  async removeReaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { postId } = req.params;

      const post = await PostService.removeReaction(postId, userId);

      res.json({ success: true, data: post });
    } catch (error: any) {
      logger.error('Error removing reaction from post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to remove reaction' });
    }
  }

  /**
   * Share a post
   */
  async sharePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      const result = await PostService.sharePost(postId);

      res.json({ success: true, ...result });
    } catch (error: any) {
      logger.error('Error sharing post', { error: error.message, postId: req.params.postId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to share post' });
    }
  }
}

export default new PostController();
