import { Router } from 'express';
import GroupController from '../controllers/GroupController';
import PostController from '../controllers/PostController';
import CommentController from '../controllers/CommentController';

const router = Router();

// ==================== GROUP ROUTES ====================
router.get('/groups', GroupController.getAllGroups);
router.get('/groups/my-groups', GroupController.getMyGroups);
router.get('/groups/:groupId', GroupController.getGroupById);
router.post('/groups', GroupController.createGroup);
router.put('/groups/:groupId', GroupController.updateGroup);
router.delete('/groups/:groupId', GroupController.deleteGroup);
router.post('/groups/:groupId/join', GroupController.joinGroup);
router.post('/groups/:groupId/leave', GroupController.leaveGroup);
router.delete('/groups/:groupId/join-request', GroupController.cancelJoinRequest);
router.post('/groups/:groupId/join-request/:userId/approve', GroupController.approveJoinRequest);
router.post('/groups/:groupId/join-request/:userId/reject', GroupController.rejectJoinRequest);

// ==================== POST ROUTES ====================
router.get('/posts', PostController.getAllPosts);
router.get('/posts/:postId', PostController.getPostById);
router.post('/posts', PostController.createPost);
router.put('/posts/:postId', PostController.updatePost);
router.delete('/posts/:postId', PostController.deletePost);

// Post Voting
router.post('/posts/:postId/vote', PostController.votePost);
router.delete('/posts/:postId/vote', PostController.removeVote);

// Post Reactions
router.post('/posts/:postId/react', PostController.reactToPost);
router.delete('/posts/:postId/react', PostController.removeReaction);

// Post Sharing
router.post('/posts/:postId/share', PostController.sharePost);

// ==================== COMMENT ROUTES ====================
router.get('/posts/:postId/comments', CommentController.getCommentsByPost);
router.post('/comments', CommentController.createComment);
router.put('/comments/:commentId', CommentController.updateComment);
router.delete('/comments/:commentId', CommentController.deleteComment);

// Comment Voting
router.post('/comments/:commentId/vote', CommentController.voteComment);
router.delete('/comments/:commentId/vote', CommentController.removeVote);

// Comment Reactions
router.post('/comments/:commentId/react', CommentController.reactToComment);
router.delete('/comments/:commentId/react', CommentController.removeReaction);

export default router;
