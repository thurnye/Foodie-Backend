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
const mongoose_1 = __importStar(require("mongoose"));
const ReactionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
}, { _id: false });
const ReviewReplySchema = new mongoose_1.Schema({
    review: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        index: true,
    },
    parentReviewId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Reviews',
        index: true,
    },
    parentReplyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ReviewReplies',
        index: true,
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    reactions: [ReactionSchema],
}, {
    timestamps: true,
});
ReviewReplySchema.index({ parentReviewId: 1, createdAt: 1 });
ReviewReplySchema.index({ parentReplyId: 1, createdAt: 1 });
const ReviewReply = mongoose_1.default.model('ReviewReplies', ReviewReplySchema);
exports.default = ReviewReply;
//# sourceMappingURL=ReviewReply.js.map