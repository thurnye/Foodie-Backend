"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const Comment_model_1 = require("../models/Comment.model");
const Post_model_1 = require("../models/Post.model");
const libs_1 = require("@foodie/libs");
class CommentController {
    async getCommentsByPost(req, res) {
        try {
            const { postId } = req.params;
            const comments = await Comment_model_1.Comment.find({ post: postId, parentComment: null })
                .sort({ createdAt: -1 })
                .populate('author', 'firstName lastName email avatar')
                .lean();
            const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
                const replies = await Comment_model_1.Comment.find({ parentComment: comment._id })
                    .sort({ createdAt: 1 })
                    .populate('author', 'firstName lastName email avatar')
                    .lean();
                return { ...comment, replies };
            }));
            res.json({ success: true, data: commentsWithReplies });
        }
        catch (error) {
            libs_1.logger.error('Error fetching comments', { error: error.message, postId: req.params.postId });
            res.status(500).json({ success: false, message: 'Failed to fetch comments' });
        }
    }
    async createComment(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            if (!userId) {
                throw libs_1.Errors.unauthorized('User not authenticated');
            }
            const { postId, content, parentCommentId } = req.body;
            const post = await Post_model_1.Post.findById(postId);
            if (!post) {
                throw libs_1.Errors.notFound('Post not found');
            }
            if (post.isLocked) {
                throw libs_1.Errors.forbidden('Post is locked and cannot receive new comments');
            }
            if (parentCommentId) {
                const parentComment = await Comment_model_1.Comment.findById(parentCommentId);
                if (!parentComment) {
                    throw libs_1.Errors.notFound('Parent comment not found');
                }
                parentComment.replyCount += 1;
                await parentComment.save();
            }
            const comment = await Comment_model_1.Comment.create({
                post: postId,
                author: userId,
                content,
                parentComment: parentCommentId || undefined,
            });
            post.commentCount += 1;
            await post.save();
            const populatedComment = await Comment_model_1.Comment.findById(comment._id)
                .populate('author', 'firstName lastName email avatar')
                .lean();
            res.status(201).json({ success: true, data: populatedComment });
        }
        catch (error) {
            libs_1.logger.error('Error creating comment', { error: error.message });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to create comment' });
        }
    }
    async updateComment(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { commentId } = req.params;
            const { content } = req.body;
            const comment = await Comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw libs_1.Errors.notFound('Comment not found');
            }
            if (comment.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('Only the comment author can update the comment');
            }
            comment.content = content;
            comment.isEdited = true;
            await comment.save();
            const updatedComment = await Comment_model_1.Comment.findById(commentId)
                .populate('author', 'firstName lastName email avatar')
                .lean();
            res.json({ success: true, data: updatedComment });
        }
        catch (error) {
            libs_1.logger.error('Error updating comment', { error: error.message, commentId: req.params.commentId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to update comment' });
        }
    }
    async deleteComment(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { commentId } = req.params;
            const comment = await Comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw libs_1.Errors.notFound('Comment not found');
            }
            if (comment.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('Only the comment author can delete the comment');
            }
            await Comment_model_1.Comment.deleteMany({ parentComment: commentId });
            const post = await Post_model_1.Post.findById(comment.post);
            if (post) {
                const replyCount = await Comment_model_1.Comment.countDocuments({ parentComment: commentId });
                post.commentCount = Math.max(0, post.commentCount - 1 - replyCount);
                await post.save();
            }
            if (comment.parentComment) {
                const parentComment = await Comment_model_1.Comment.findById(comment.parentComment);
                if (parentComment) {
                    parentComment.replyCount = Math.max(0, parentComment.replyCount - 1);
                    await parentComment.save();
                }
            }
            await comment.deleteOne();
            res.json({ success: true, message: 'Comment deleted successfully' });
        }
        catch (error) {
            libs_1.logger.error('Error deleting comment', { error: error.message, commentId: req.params.commentId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to delete comment' });
        }
    }
    async voteComment(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { commentId } = req.params;
            const { value } = req.body;
            if (value !== 1 && value !== -1) {
                throw libs_1.Errors.badRequest('Vote value must be 1 or -1');
            }
            const comment = await Comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw libs_1.Errors.notFound('Comment not found');
            }
            const existingVoteIndex = comment.votes.findIndex(v => v.user.toString() === userId);
            if (existingVoteIndex > -1) {
                comment.votes[existingVoteIndex].value = value;
            }
            else {
                comment.votes.push({
                    user: userId,
                    value,
                    createdAt: new Date(),
                });
            }
            comment.voteCount = comment.votes.reduce((sum, vote) => sum + vote.value, 0);
            await comment.save();
            const updatedComment = await Comment_model_1.Comment.findById(commentId)
                .populate('author', 'firstName lastName email avatar')
                .lean();
            res.json({ success: true, data: updatedComment });
        }
        catch (error) {
            libs_1.logger.error('Error voting on comment', { error: error.message, commentId: req.params.commentId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to vote on comment' });
        }
    }
    async removeVote(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { commentId } = req.params;
            const comment = await Comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw libs_1.Errors.notFound('Comment not found');
            }
            const voteIndex = comment.votes.findIndex(v => v.user.toString() === userId);
            if (voteIndex > -1) {
                comment.votes.splice(voteIndex, 1);
                comment.voteCount = comment.votes.reduce((sum, vote) => sum + vote.value, 0);
                await comment.save();
            }
            const updatedComment = await Comment_model_1.Comment.findById(commentId)
                .populate('author', 'firstName lastName email avatar')
                .lean();
            res.json({ success: true, data: updatedComment });
        }
        catch (error) {
            libs_1.logger.error('Error removing vote from comment', { error: error.message, commentId: req.params.commentId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to remove vote' });
        }
    }
    async reactToComment(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { commentId } = req.params;
            const { type } = req.body;
            const validReactions = ['like', 'love', 'fire', 'laugh', 'sad', 'wow'];
            if (!validReactions.includes(type)) {
                throw libs_1.Errors.badRequest('Invalid reaction type');
            }
            const comment = await Comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw libs_1.Errors.notFound('Comment not found');
            }
            const existingReactionIndex = comment.reactions.findIndex(r => r.user.toString() === userId);
            if (existingReactionIndex > -1) {
                comment.reactions[existingReactionIndex].type = type;
            }
            else {
                comment.reactions.push({
                    user: userId,
                    type,
                    createdAt: new Date(),
                });
            }
            comment.reactionCount = comment.reactions.length;
            await comment.save();
            const updatedComment = await Comment_model_1.Comment.findById(commentId)
                .populate('author', 'firstName lastName email avatar')
                .lean();
            res.json({ success: true, data: updatedComment });
        }
        catch (error) {
            libs_1.logger.error('Error reacting to comment', { error: error.message, commentId: req.params.commentId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to react to comment' });
        }
    }
    async removeReaction(req, res) {
        try {
            const userId = req.headers['x-user-id'];
            const { commentId } = req.params;
            const comment = await Comment_model_1.Comment.findById(commentId);
            if (!comment) {
                throw libs_1.Errors.notFound('Comment not found');
            }
            const reactionIndex = comment.reactions.findIndex(r => r.user.toString() === userId);
            if (reactionIndex > -1) {
                comment.reactions.splice(reactionIndex, 1);
                comment.reactionCount = comment.reactions.length;
                await comment.save();
            }
            const updatedComment = await Comment_model_1.Comment.findById(commentId)
                .populate('author', 'firstName lastName email avatar')
                .lean();
            res.json({ success: true, data: updatedComment });
        }
        catch (error) {
            libs_1.logger.error('Error removing reaction from comment', { error: error.message, commentId: req.params.commentId });
            if (error.isOperational) {
                res.status(error.statusCode).json({ success: false, message: error.message });
                return;
            }
            res.status(500).json({ success: false, message: 'Failed to remove reaction' });
        }
    }
}
exports.CommentController = CommentController;
exports.default = new CommentController();
//# sourceMappingURL=CommentController.js.map