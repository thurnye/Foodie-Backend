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
exports.Comment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
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
const CommentSchema = new mongoose_1.Schema({
    post: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true,
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    parentComment: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Comment',
        index: true,
    },
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
    replyCount: {
        type: Number,
        default: 0,
    },
    isEdited: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.methods.calculateVoteCount = function () {
    this.voteCount = this.votes.reduce((sum, vote) => sum + vote.value, 0);
    return this.voteCount;
};
CommentSchema.methods.calculateReactionCount = function () {
    this.reactionCount = this.reactions.length;
    return this.reactionCount;
};
exports.Comment = mongoose_1.default.model('Comment', CommentSchema);
//# sourceMappingURL=Comment.model.js.map