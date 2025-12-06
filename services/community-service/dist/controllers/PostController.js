"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const libs_1 = require("@foodie/libs");
const PostService_1 = __importDefault(require("../services/PostService"));
class PostController {
    async getAllPosts(req, res) {
        try {
            const { groupId, authorId, search, tags, sort: _sort = 'newest', isPinned, page, limit, } = req.query;
            const posts = await PostService_1.default.getAllPosts({
                groupId: groupId,
                authorId: authorId,
                search: search,
                tags: tags,
                isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
            });
            res.json({ success: true, data: posts });
        }
        catch (error) {
            libs_1.logger.error('Error fetching posts', { error: error.message });
            res
                .status(500)
                .json({ success: false, message: 'Failed to fetch posts' });
        }
    }
    async getPostById(req, res) {
        try {
            const { postId } = req.params;
            const post = await PostService_1.default.getPostById(postId);
            res.json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error fetching post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to fetch post' });
        }
    }
    async createPost(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { groupId, title, content, media, tags } = req.body;
            const post = await PostService_1.default.createPost(userId, {
                groupId,
                title,
                content,
                media,
                tags,
            });
            res.status(201).json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error creating post', { error: error.message });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to create post' });
        }
    }
    async updatePost(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { postId } = req.params;
            const { title, content, media, tags } = req.body;
            const post = await PostService_1.default.updatePost(postId, userId, {
                title,
                content,
                media,
                tags,
            });
            res.json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error updating post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to update post' });
        }
    }
    async deletePost(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { postId } = req.params;
            await PostService_1.default.deletePost(postId, userId);
            res.json({ success: true, message: 'Post deleted successfully' });
        }
        catch (error) {
            libs_1.logger.error('Error deleting post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to delete post' });
        }
    }
    async votePost(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { postId } = req.params;
            const { value } = req.body;
            const post = await PostService_1.default.votePost(postId, userId, value);
            res.json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error voting on post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to vote on post' });
        }
    }
    async removeVote(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { postId } = req.params;
            const post = await PostService_1.default.removeVote(postId, userId);
            res.json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error removing vote from post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to remove vote' });
        }
    }
    async reactToPost(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { postId } = req.params;
            const { type } = req.body;
            const post = await PostService_1.default.reactToPost(postId, userId, type);
            res.json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error reacting to post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to react to post' });
        }
    }
    async removeReaction(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { postId } = req.params;
            const post = await PostService_1.default.removeReaction(postId, userId);
            res.json({ success: true, data: post });
        }
        catch (error) {
            libs_1.logger.error('Error removing reaction from post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res
                .status(500)
                .json({ success: false, message: 'Failed to remove reaction' });
        }
    }
    async sharePost(req, res) {
        try {
            const { postId } = req.params;
            const result = await PostService_1.default.sharePost(postId);
            res.json({ success: true, ...result });
        }
        catch (error) {
            libs_1.logger.error('Error sharing post', {
                error: error.message,
                postId: req.params.postId,
            });
            if (error.isOperational) {
                res
                    .status(error.statusCode)
                    .json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to share post' });
        }
    }
}
exports.PostController = PostController;
exports.default = new PostController();
//# sourceMappingURL=PostController.js.map