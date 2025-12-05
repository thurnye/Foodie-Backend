"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ReactionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'love', 'fire', 'laugh', 'sad', 'wow'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const VoteSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    value: {
        type: Number,
        enum: [1, -1],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const PostMediaSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    thumbnail: String,
    alt: String,
});
const PostSchema = new mongoose_1.Schema({
    group: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Group',
        required: true,
        index: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    media: [PostMediaSchema],
    votes: [VoteSchema],
    voteCount: {
        type: Number,
        default: 0,
    },
    reactions: [ReactionSchema],
    reactionCount: {
        type: Number,
        default: 0,
    },
    commentCount: {
        type: Number,
        default: 0,
    },
    shareCount: {
        type: Number,
        default: 0,
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    isLocked: {
        type: Boolean,
        default: false,
    },
    tags: [{
            type: String,
            trim: true,
        }],
}, {
    timestamps: true,
});
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ voteCount: -1 });
PostSchema.index({ group: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.methods.calculateVoteCount = function () {
    this.voteCount = this.votes.reduce((sum, vote) => sum + vote.value, 0);
    return this.voteCount;
};
PostSchema.methods.calculateReactionCount = function () {
    this.reactionCount = this.reactions.length;
    return this.reactionCount;
};
exports.Post = mongoose_1.default.model('Post', PostSchema);
//# sourceMappingURL=Post.model.js.map