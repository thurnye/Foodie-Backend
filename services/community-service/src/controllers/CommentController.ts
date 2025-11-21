import { Request, Response } from 'express';
import { Comment } from '../models/Comment.model';
import { Post } from '../models/Post.model';
import { logger, Errors } from '@foodie/libs';

export class CommentController {
  /**
   * Get comments for a post
   */
  async getCommentsByPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;

      // Get all top-level comments (no parent)
      const comments = await Comment.find({ post: postId, parentComment: null })
        .sort({ createdAt: -1 })
        .populate('author', 'firstName lastName email avatar')
        .lean();

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await Comment.find({ parentComment: comment._id })
            .sort({ createdAt: 1 })
            .populate('author', 'firstName lastName email avatar')
            .lean();
          return { ...comment, replies };
        })
      );

      res.json({ success: true, data: commentsWithReplies });
    } catch (error: any) {
      logger.error('Error fetching comments', { error: error.message, postId: req.params.postId });
      res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
  }

  /**
   * Create a comment
   */
  async createComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { postId, content, parentCommentId } = req.body;

      // Verify post exists
      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      // Check if post is locked
      if (post.isLocked) {
        throw Errors.forbidden('Post is locked and cannot receive new comments');
      }

      // If replying to a comment, verify it exists
      if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
          throw Errors.notFound('Parent comment not found');
        }
        // Update parent comment reply count
        parentComment.replyCount += 1;
        await parentComment.save();
      }

      const comment = await Comment.create({
        post: postId,
        author: userId,
        content,
        parentComment: parentCommentId || undefined,
      });

      // Update post comment count
      post.commentCount += 1;
      await post.save();

      const populatedComment = await Comment.findById(comment._id)
        .populate('author', 'firstName lastName email avatar')
        .lean();

      res.status(201).json({ success: true, data: populatedComment });
    } catch (error: any) {
      logger.error('Error creating comment', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to create comment' });
    }
  }

  /**
   * Update a comment
   */
  async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;
      const { content } = req.body;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw Errors.notFound('Comment not found');
      }

      // Check if user is the author
      if (comment.author.toString() !== userId) {
        throw Errors.forbidden('Only the comment author can update the comment');
      }

      comment.content = content;
      comment.isEdited = true;
      await comment.save();

      const updatedComment = await Comment.findById(commentId)
        .populate('author', 'firstName lastName email avatar')
        .lean();

      res.json({ success: true, data: updatedComment });
    } catch (error: any) {
      logger.error('Error updating comment', { error: error.message, commentId: req.params.commentId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to update comment' });
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw Errors.notFound('Comment not found');
      }

      // Check if user is the author
      if (comment.author.toString() !== userId) {
        throw Errors.forbidden('Only the comment author can delete the comment');
      }

      // Delete all replies to this comment
      await Comment.deleteMany({ parentComment: commentId });

      // Update post comment count
      const post = await Post.findById(comment.post);
      if (post) {
        const replyCount = await Comment.countDocuments({ parentComment: commentId });
        post.commentCount = Math.max(0, post.commentCount - 1 - replyCount);
        await post.save();
      }

      // Update parent comment reply count if it's a reply
      if (comment.parentComment) {
        const parentComment = await Comment.findById(comment.parentComment);
        if (parentComment) {
          parentComment.replyCount = Math.max(0, parentComment.replyCount - 1);
          await parentComment.save();
        }
      }

      await comment.deleteOne();

      res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting comment', { error: error.message, commentId: req.params.commentId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to delete comment' });
    }
  }

  /**
   * Vote on a comment
   */
  async voteComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;
      const { value } = req.body; // 1 for upvote, -1 for downvote

      if (value !== 1 && value !== -1) {
        throw Errors.badRequest('Vote value must be 1 or -1');
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw Errors.notFound('Comment not found');
      }

      // Check if user already voted
      const existingVoteIndex = comment.votes.findIndex(v => v.user.toString() === userId);

      if (existingVoteIndex > -1) {
        // Update existing vote
        comment.votes[existingVoteIndex].value = value;
      } else {
        // Add new vote
        comment.votes.push({
          user: userId as any,
          value,
          createdAt: new Date(),
        });
      }

      // Recalculate vote count
      comment.voteCount = comment.votes.reduce((sum, vote) => sum + vote.value, 0);
      await comment.save();

      const updatedComment = await Comment.findById(commentId)
        .populate('author', 'firstName lastName email avatar')
        .lean();

      res.json({ success: true, data: updatedComment });
    } catch (error: any) {
      logger.error('Error voting on comment', { error: error.message, commentId: req.params.commentId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to vote on comment' });
    }
  }

  /**
   * Remove vote from a comment
   */
  async removeVote(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw Errors.notFound('Comment not found');
      }

      const voteIndex = comment.votes.findIndex(v => v.user.toString() === userId);
      if (voteIndex > -1) {
        comment.votes.splice(voteIndex, 1);
        comment.voteCount = comment.votes.reduce((sum, vote) => sum + vote.value, 0);
        await comment.save();
      }

      const updatedComment = await Comment.findById(commentId)
        .populate('author', 'firstName lastName email avatar')
        .lean();

      res.json({ success: true, data: updatedComment });
    } catch (error: any) {
      logger.error('Error removing vote from comment', { error: error.message, commentId: req.params.commentId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to remove vote' });
    }
  }

  /**
   * React to a comment
   */
  async reactToComment(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;
      const { type } = req.body; // like, love, fire, laugh, sad, wow

      const validReactions = ['like', 'love', 'fire', 'laugh', 'sad', 'wow'];
      if (!validReactions.includes(type)) {
        throw Errors.badRequest('Invalid reaction type');
      }

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw Errors.notFound('Comment not found');
      }

      // Check if user already reacted
      const existingReactionIndex = comment.reactions.findIndex(r => r.user.toString() === userId);

      if (existingReactionIndex > -1) {
        // Update existing reaction
        comment.reactions[existingReactionIndex].type = type;
      } else {
        // Add new reaction
        comment.reactions.push({
          user: userId as any,
          type,
          createdAt: new Date(),
        });
      }

      comment.reactionCount = comment.reactions.length;
      await comment.save();

      const updatedComment = await Comment.findById(commentId)
        .populate('author', 'firstName lastName email avatar')
        .lean();

      res.json({ success: true, data: updatedComment });
    } catch (error: any) {
      logger.error('Error reacting to comment', { error: error.message, commentId: req.params.commentId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to react to comment' });
    }
  }

  /**
   * Remove reaction from a comment
   */
  async removeReaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      const { commentId } = req.params;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw Errors.notFound('Comment not found');
      }

      const reactionIndex = comment.reactions.findIndex(r => r.user.toString() === userId);
      if (reactionIndex > -1) {
        comment.reactions.splice(reactionIndex, 1);
        comment.reactionCount = comment.reactions.length;
        await comment.save();
      }

      const updatedComment = await Comment.findById(commentId)
        .populate('author', 'firstName lastName email avatar')
        .lean();

      res.json({ success: true, data: updatedComment });
    } catch (error: any) {
      logger.error('Error removing reaction from comment', { error: error.message, commentId: req.params.commentId });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to remove reaction' });
    }
  }
}

export default new CommentController();
