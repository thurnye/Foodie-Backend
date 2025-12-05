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
const AttachmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: {
        type: String,
        enum: ['image', 'video', 'audio', 'document', 'other'],
        required: true,
    },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    preview: { type: String },
});
const ReactionSchema = new mongoose_1.Schema({
    emoji: { type: String, required: true },
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    count: { type: Number, default: 0 },
});
const MessageSchema = new mongoose_1.Schema({
    channelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Channel',
    },
    conversationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Conversation',
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender is required'],
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    type: {
        type: String,
        enum: ['text', 'file', 'image', 'video', 'system'],
        default: 'text',
    },
    attachments: [AttachmentSchema],
    mentions: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    reactions: [ReactionSchema],
    isEdited: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    replyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Message',
    },
}, {
    timestamps: true,
});
MessageSchema.pre('save', function (next) {
    if (!this.channelId && !this.conversationId) {
        next(new Error('Message must belong to either a channel or a conversation'));
    }
    else if (this.channelId && this.conversationId) {
        next(new Error('Message cannot belong to both a channel and a conversation'));
    }
    else {
        next();
    }
});
MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ mentions: 1 });
exports.default = mongoose_1.default.model('Message', MessageSchema);
//# sourceMappingURL=Message.js.map