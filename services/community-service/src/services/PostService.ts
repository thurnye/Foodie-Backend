import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Post, IPost, IPostMedia, ReactionType } from '../models/Post.model';
import { Group } from '../models/Group.model';
import { Comment } from '../models/Comment.model';
import { fetchUserData, UserData } from '../utils/userClient';

interface CreatePostData {
  groupId: string;
  title: string;
  content: string;
  media?: IPostMedia[];
  tags?: string[];
}

interface UpdatePostData {
  title?: string;
  content?: string;
  media?: IPostMedia[];
  tags?: string[];
}

interface GetPostsFilters {
  groupId?: string;
  authorId?: string;
  search?: string;
  tags?: string;
  sort?: 'newest' | 'popular' | 'trending';
  isPinned?: boolean;
}

interface PostWithUser {
  _id: any;
  group: Types.ObjectId;
  author: UserData | Types.ObjectId;
  title: string;
  content: string;
  media?: IPostMedia[];
  votes: any[];
  voteCount: number;
  reactions: any[];
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

class PostService {
  /**
   * Get all posts with filters
   */
  async getAllPosts(filters: GetPostsFilters = {}): Promise<PostWithUser[]> {
    try {
      const { groupId, authorId, search, tags, sort = 'newest', isPinned } = filters;

      let query: any = {};

      // Group filter
      if (groupId) {
        query.group = groupId;
      }

      // Author filter
      if (authorId) {
        query.author = authorId;
      }

      // Search filter
      if (search) {
        query.$text = { $search: search };
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',');
        query.tags = { $in: tagArray };
      }

      // Pinned filter
      if (isPinned !== undefined) {
        query.isPinned = isPinned;
      }

      // Sorting
      let sortQuery: any = {};
      switch (sort) {
        case 'popular':
          sortQuery = { voteCount: -1, createdAt: -1 };
          break;
        case 'trending':
          // Simple trending: high votes + recent
          sortQuery = { voteCount: -1, reactionCount: -1, createdAt: -1 };
          break;
        default: // newest
          sortQuery = { isPinned: -1, createdAt: -1 };
      }

      const posts = await Post.find(query)
        .sort(sortQuery)
        .lean();

      // Fetch user data for authors
      const postsWithUsers = await Promise.all(
        posts.map(async (post) => {
          const author = await fetchUserData(post.author.toString());
          return {
            ...post,
            author: author || post.author,
          } as any as PostWithUser;
        })
      );

      logger.info('Posts fetched', { count: postsWithUsers.length });

      return postsWithUsers;
    } catch (error) {
      logger.error('Error fetching posts', { error });
      throw error;
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(postId: string): Promise<PostWithUser> {
    try {
      const post = await Post.findById(postId).lean();

      if (!post) {
        throw Errors.notFound('Post not found');
      }

      // Fetch user data for author
      const author = await fetchUserData(post.author.toString());
      const postWithUser = {
        ...post,
        author: author || post.author,
      } as any as PostWithUser;

      logger.info('Post fetched', { postId });

      return postWithUser;
    } catch (error) {
      logger.error('Error fetching post', { error, postId });
      throw error;
    }
  }

  /**
   * Create a new post
   */
  async createPost(userId: string, data: CreatePostData): Promise<PostWithUser> {
    try {
      const { groupId, title, content, media, tags } = data;

      // Verify group exists and user is a member
      const group = await Group.findById(groupId);
      if (!group) {
        throw Errors.notFound('Group not found');
      }

      const isMember = group.members.some(m => m.user.toString() === userId);
      if (!isMember) {
        throw Errors.forbidden('You must be a member of the group to post');
      }

      const post = await Post.create({
        group: groupId,
        author: userId,
        title,
        content,
        media: media || [],
        tags: tags || [],
      });

      // Update group post count
      group.postCount += 1;
      await group.save();

      const createdPost = await Post.findById(post._id).lean();

      // Fetch author user data
      const author = await fetchUserData(userId);
      const postWithUser = {
        ...createdPost!,
        author: author || userId as any,
      } as any as PostWithUser;

      logger.info('Post created', { postId: post._id, userId, groupId });

      return postWithUser;
    } catch (error) {
      logger.error('Error creating post', { error, userId });
      throw error;
    }
  }

  /**
   * Update a post
   */
  async updatePost(postId: string, userId: string, updates: UpdatePostData): Promise<PostWithUser> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      // Check if user is the author
      if (post.author.toString() !== userId) {
        throw Errors.forbidden('Only the post author can update the post');
      }

      // Check if post is locked
      if (post.isLocked) {
        throw Errors.forbidden('Post is locked and cannot be edited');
      }

      if (updates.title) post.title = updates.title;
      if (updates.content) post.content = updates.content;
      if (updates.media) post.media = updates.media;
      if (updates.tags) post.tags = updates.tags;

      await post.save();

      const updatedPost = await Post.findById(postId).lean();

      // Fetch author user data
      const author = await fetchUserData(updatedPost!.author.toString());
      const postWithUser = {
        ...updatedPost!,
        author: author || updatedPost!.author,
      } as any as PostWithUser;

      logger.info('Post updated', { postId, userId });

      return postWithUser;
    } catch (error) {
      logger.error('Error updating post', { error, postId });
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(postId: string, userId: string): Promise<void> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      // Check if user is the author or group admin
      const group = await Group.findById(post.group);
      const member = group?.members.find(m => m.user.toString() === userId);
      const isAuthor = post.author.toString() === userId;
      const isAdmin = member?.role === 'admin';

      if (!isAuthor && !isAdmin) {
        throw Errors.forbidden('Only the post author or group admin can delete the post');
      }

      // Delete all comments for this post
      await Comment.deleteMany({ post: postId });

      // Update group post count
      if (group) {
        group.postCount = Math.max(0, group.postCount - 1);
        await group.save();
      }

      await post.deleteOne();

      logger.info('Post deleted', { postId, userId });
    } catch (error) {
      logger.error('Error deleting post', { error, postId });
      throw error;
    }
  }

  /**
   * Vote on a post (upvote or downvote)
   */
  async votePost(postId: string, userId: string, value: number): Promise<PostWithUser> {
    try {
      if (value !== 1 && value !== -1) {
        throw Errors.badRequest('Vote value must be 1 or -1');
      }

      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      // Check if user already voted
      const existingVoteIndex = post.votes.findIndex(v => v.user.toString() === userId);

      if (existingVoteIndex > -1) {
        // Update existing vote
        post.votes[existingVoteIndex].value = value as 1 | -1;
      } else {
        // Add new vote
        post.votes.push({
          user: userId as any,
          value: value as 1 | -1,
          createdAt: new Date(),
        });
      }

      // Recalculate vote count
      post.voteCount = post.votes.reduce((sum: number, vote: any) => sum + vote.value, 0);
      await post.save();

      const updatedPost = await Post.findById(postId).lean();

      // Fetch author user data
      const author = await fetchUserData(updatedPost!.author.toString());
      const postWithUser = {
        ...updatedPost!,
        author: author || updatedPost!.author,
      } as any as PostWithUser;

      logger.info('Post voted', { postId, userId, value });

      return postWithUser;
    } catch (error) {
      logger.error('Error voting on post', { error, postId });
      throw error;
    }
  }

  /**
   * Remove vote from a post
   */
  async removeVote(postId: string, userId: string): Promise<PostWithUser> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      const voteIndex = post.votes.findIndex(v => v.user.toString() === userId);
      if (voteIndex > -1) {
        post.votes.splice(voteIndex, 1);
        post.voteCount = post.votes.reduce((sum: number, vote: any) => sum + vote.value, 0);
        await post.save();
      }

      const updatedPost = await Post.findById(postId).lean();

      // Fetch author user data
      const author = await fetchUserData(updatedPost!.author.toString());
      const postWithUser = {
        ...updatedPost!,
        author: author || updatedPost!.author,
      } as any as PostWithUser;

      logger.info('Vote removed from post', { postId, userId });

      return postWithUser;
    } catch (error) {
      logger.error('Error removing vote from post', { error, postId });
      throw error;
    }
  }

  /**
   * React to a post
   */
  async reactToPost(postId: string, userId: string, type: string): Promise<PostWithUser> {
    try {
      const validReactions: ReactionType[] = ['like', 'love', 'fire', 'laugh', 'sad', 'wow'];
      if (!validReactions.includes(type as ReactionType)) {
        throw Errors.badRequest('Invalid reaction type');
      }

      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      // Check if user already reacted
      const existingReactionIndex = post.reactions.findIndex(r => r.user.toString() === userId);

      if (existingReactionIndex > -1) {
        // Update existing reaction
        post.reactions[existingReactionIndex].type = type as ReactionType;
      } else {
        // Add new reaction
        post.reactions.push({
          user: userId as any,
          type: type as ReactionType,
          createdAt: new Date(),
        });
      }

      post.reactionCount = post.reactions.length;
      await post.save();

      const updatedPost = await Post.findById(postId).lean();

      // Fetch author user data
      const author = await fetchUserData(updatedPost!.author.toString());
      const postWithUser = {
        ...updatedPost!,
        author: author || updatedPost!.author,
      } as any as PostWithUser;

      logger.info('Reaction added to post', { postId, userId, type });

      return postWithUser;
    } catch (error) {
      logger.error('Error reacting to post', { error, postId });
      throw error;
    }
  }

  /**
   * Remove reaction from a post
   */
  async removeReaction(postId: string, userId: string): Promise<PostWithUser> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      const reactionIndex = post.reactions.findIndex(r => r.user.toString() === userId);
      if (reactionIndex > -1) {
        post.reactions.splice(reactionIndex, 1);
        post.reactionCount = post.reactions.length;
        await post.save();
      }

      const updatedPost = await Post.findById(postId).lean();

      // Fetch author user data
      const author = await fetchUserData(updatedPost!.author.toString());
      const postWithUser = {
        ...updatedPost!,
        author: author || updatedPost!.author,
      } as any as PostWithUser;

      logger.info('Reaction removed from post', { postId, userId });

      return postWithUser;
    } catch (error) {
      logger.error('Error removing reaction from post', { error, postId });
      throw error;
    }
  }

  /**
   * Share a post
   */
  async sharePost(postId: string): Promise<{ message: string; shareCount: number }> {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        throw Errors.notFound('Post not found');
      }

      post.shareCount += 1;
      await post.save();

      logger.info('Post shared', { postId, shareCount: post.shareCount });

      return { message: 'Post shared successfully', shareCount: post.shareCount };
    } catch (error) {
      logger.error('Error sharing post', { error, postId });
      throw error;
    }
  }
}

export default new PostService();
