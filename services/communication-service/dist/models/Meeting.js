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
const MeetingSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizer is required'],
    },
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Team',
    },
    channelId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Channel',
    },
    startTime: {
        type: Date,
        required: [true, 'Start time is required'],
    },
    endTime: {
        type: Date,
        required: [true, 'End time is required'],
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurrencePattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled',
    },
    link: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});
MeetingSchema.pre('save', function (next) {
    if (this.endTime <= this.startTime) {
        next(new Error('End time must be after start time'));
    }
    else {
        next();
    }
});
MeetingSchema.index({ organizer: 1 });
MeetingSchema.index({ participants: 1 });
MeetingSchema.index({ startTime: 1 });
MeetingSchema.index({ status: 1 });
MeetingSchema.index({ teamId: 1 });
MeetingSchema.index({ channelId: 1 });
exports.default = mongoose_1.default.model('Meeting', MeetingSchema);
//# sourceMappingURL=Meeting.js.map