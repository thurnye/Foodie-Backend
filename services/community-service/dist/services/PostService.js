"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("@foodie/libs");
const Post_model_1 = require("../models/Post.model");
const Group_model_1 = require("../models/Group.model");
const Comment_model_1 = require("../models/Comment.model");
const userClient_1 = require("../utils/userClient");
class PostService {
    async getAllPosts(filters = {}) {
        try {
            const { groupId, authorId, search, tags, sort = 'newest', isPinned, page = 1, limit = 10, } = filters;
            let query = {};
            if (groupId) {
                query.group = groupId;
            }
            if (authorId) {
                query.author = authorId;
            }
            if (search) {
                query.$text = { $search: search };
            }
            if (tags) {
                const tagArray = tags.split(',');
                query.tags = { $in: tagArray };
            }
            if (isPinned !== undefined) {
                query.isPinned = isPinned;
            }
            let sortQuery = {};
            switch (sort) {
                case 'popular':
                    sortQuery = { voteCount: -1, createdAt: -1 };
                    break;
                case 'trending':
                    sortQuery = { voteCount: -1, reactionCount: -1, createdAt: -1 };
                    break;
                default:
                    sortQuery = { isPinned: -1, createdAt: -1 };
            }
            const skip = (page - 1) * limit;
            const posts = await Post_model_1.Post.find(query)
                .sort(sortQuery)
                .skip(skip)
                .limit(limit)
                .lean();
            const postsWithUsers = await Promise.all(posts.map(async (post) => {
                const author = await (0, userClient_1.fetchUserData)(post.author.toString());
                return {
                    ...post,
                    author: author || post.author,
                };
            }));
            libs_1.logger.info('Posts fetched', { count: postsWithUsers.length });
            return postsWithUsers;
        }
        catch (error) {
            libs_1.logger.error('Error fetching posts', { error });
            throw error;
        }
    }
    async getPostById(postId) {
        try {
            const post = await Post_model_1.Post.findById(postId).lean();
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            const author = await (0, userClient_1.fetchUserData)(post.author.toString());
            const postWithUser = {
                ...post,
                author: author || post.author,
            };
            libs_1.logger.info('Post fetched', { postId });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error fetching post', { error, postId });
            throw error;
        }
    }
    async createPost(userId, data) {
        try {
            const { groupId, title, content, media, tags } = data;
            const group = await Group_model_1.Group.findById(groupId);
            if (!group) {
                throw libs_1.Errors.notFound('Group not found');
            }
            const isMember = group.members.some((m) => m.user.toString() === userId);
            if (!isMember) {
                throw libs_1.Errors.forbidden('You must be a member of the group to post');
            }
            const post = await Post_model_1.Post.create({
                group: groupId,
                author: userId,
                title,
                content,
                media: media || [],
                tags: tags || [],
            });
            group.postCount += 1;
            await group.save();
            const createdPost = await Post_model_1.Post.findById(post._id).lean();
            const author = await (0, userClient_1.fetchUserData)(userId);
            const postWithUser = {
                ...createdPost,
                author: author || userId,
            };
            libs_1.logger.info('Post created', { postId: post._id, userId, groupId });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error creating post', { error, userId });
            throw error;
        }
    }
    async updatePost(postId, userId, updates) {
        try {
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            if (post.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('Only the post author can update the post');
            }
            if (post.isLocked) {
                throw libs_1.Errors.forbidden('Post is locked and cannot be edited');
            }
            if (updates.title)
                post.title = updates.title;
            if (updates.content)
                post.content = updates.content;
            if (updates.media)
                post.media = updates.media;
            if (updates.tags)
                post.tags = updates.tags;
            await post.save();
            const updatedPost = await Post_model_1.Post.findById(postId).lean();
            const author = await (0, userClient_1.fetchUserData)(updatedPost.author.toString());
            const postWithUser = {
                ...updatedPost,
                author: author || updatedPost.author,
            };
            libs_1.logger.info('Post updated', { postId, userId });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error updating post', { error, postId });
            throw error;
        }
    }
    async deletePost(postId, userId) {
        try {
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            const group = await Group_model_1.Group.findById(post.group);
            const member = group?.members.find((m) => m.user.toString() === userId);
            const isAuthor = post.author.toString() === userId;
            const isAdmin = member?.role === 'admin';
            if (!isAuthor && !isAdmin) {
                throw libs_1.Errors.forbidden('Only the post author or group admin can delete the post');
            }
            await Comment_model_1.Comment.deleteMany({ post: postId });
            if (group) {
                group.postCount = Math.max(0, group.postCount - 1);
                await group.save();
            }
            await post.deleteOne();
            libs_1.logger.info('Post deleted', { postId, userId });
        }
        catch (error) {
            libs_1.logger.error('Error deleting post', { error, postId });
            throw error;
        }
    }
    async votePost(postId, userId, value) {
        try {
            if (value !== 1 && value !== -1) {
                throw libs_1.Errors.badRequest('Vote value must be 1 or -1');
            }
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            const existingVoteIndex = post.votes.findIndex((v) => v.user.toString() === userId);
            if (existingVoteIndex > -1) {
                post.votes[existingVoteIndex].value = value;
            }
            else {
                post.votes.push({
                    user: userId,
                    value: value,
                    createdAt: new Date(),
                });
            }
            post.voteCount = post.votes.reduce((sum, vote) => sum + vote.value, 0);
            await post.save();
            const updatedPost = await Post_model_1.Post.findById(postId).lean();
            const author = await (0, userClient_1.fetchUserData)(updatedPost.author.toString());
            const postWithUser = {
                ...updatedPost,
                author: author || updatedPost.author,
            };
            libs_1.logger.info('Post voted', { postId, userId, value });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error voting on post', { error, postId });
            throw error;
        }
    }
    async removeVote(postId, userId) {
        try {
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            const voteIndex = post.votes.findIndex((v) => v.user.toString() === userId);
            if (voteIndex > -1) {
                post.votes.splice(voteIndex, 1);
                post.voteCount = post.votes.reduce((sum, vote) => sum + vote.value, 0);
                await post.save();
            }
            const updatedPost = await Post_model_1.Post.findById(postId).lean();
            const author = await (0, userClient_1.fetchUserData)(updatedPost.author.toString());
            const postWithUser = {
                ...updatedPost,
                author: author || updatedPost.author,
            };
            libs_1.logger.info('Vote removed from post', { postId, userId });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error removing vote from post', { error, postId });
            throw error;
        }
    }
    async reactToPost(postId, userId, type) {
        try {
            const validReactions = [
                'like',
                'love',
                'fire',
                'laugh',
                'sad',
                'wow',
            ];
            if (!validReactions.includes(type)) {
                throw libs_1.Errors.badRequest('Invalid reaction type');
            }
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            const existingReactionIndex = post.reactions.findIndex((r) => r.user.toString() === userId);
            if (existingReactionIndex > -1) {
                post.reactions[existingReactionIndex].type = type;
            }
            else {
                post.reactions.push({
                    user: userId,
                    type: type,
                    createdAt: new Date(),
                });
            }
            post.reactionCount = post.reactions.length;
            await post.save();
            const updatedPost = await Post_model_1.Post.findById(postId).lean();
            const author = await (0, userClient_1.fetchUserData)(updatedPost.author.toString());
            const postWithUser = {
                ...updatedPost,
                author: author || updatedPost.author,
            };
            libs_1.logger.info('Reaction added to post', { postId, userId, type });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error reacting to post', { error, postId });
            throw error;
        }
    }
    async removeReaction(postId, userId) {
        try {
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            const reactionIndex = post.reactions.findIndex((r) => r.user.toString() === userId);
            if (reactionIndex > -1) {
                post.reactions.splice(reactionIndex, 1);
                post.reactionCount = post.reactions.length;
                await post.save();
            }
            const updatedPost = await Post_model_1.Post.findById(postId).lean();
            const author = await (0, userClient_1.fetchUserData)(updatedPost.author.toString());
            const postWithUser = {
                ...updatedPost,
                author: author || updatedPost.author,
            };
            libs_1.logger.info('Reaction removed from post', { postId, userId });
            return postWithUser;
        }
        catch (error) {
            libs_1.logger.error('Error removing reaction from post', { error, postId });
            throw error;
        }
    }
    async sharePost(postId) {
        try {
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            post.shareCount += 1;
            await post.save();
            libs_1.logger.info('Post shared', { postId, shareCount: post.shareCount });
            return {
                message: 'Post shared successfully',
                shareCount: post.shareCount,
            };
        }
        catch (error) {
            libs_1.logger.error('Error sharing post', { error, postId });
            throw error;
        }
    }
}
exports.default = new PostService();
//# sourceMappingURL=PostService.js.map