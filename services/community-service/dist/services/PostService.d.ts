import { Types } from 'mongoose';
import { IPostMedia } from '../models/Post.model';
import { UserData } from '../utils/userClient';
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
    page?: number;
    limit?: number;
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
declare class PostService {
    getAllPosts(filters?: GetPostsFilters): Promise<PostWithUser[]>;
    getPostById(postId: string): Promise<PostWithUser>;
    createPost(userId: string, data: CreatePostData): Promise<PostWithUser>;
    updatePost(postId: string, userId: string, updates: UpdatePostData): Promise<PostWithUser>;
    deletePost(postId: string, userId: string): Promise<void>;
    votePost(postId: string, userId: string, value: number): Promise<PostWithUser>;
    removeVote(postId: string, userId: string): Promise<PostWithUser>;
    reactToPost(postId: string, userId: string, type: string): Promise<PostWithUser>;
    removeReaction(postId: string, userId: string): Promise<PostWithUser>;
    sharePost(postId: string): Promise<{
        message: string;
        shareCount: number;
    }>;
}
declare const _default: PostService;
export default _default;
//# sourceMappingURL=PostService.d.ts.map