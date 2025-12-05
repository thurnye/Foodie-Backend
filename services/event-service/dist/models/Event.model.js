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
exports.Event = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EventLocationSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['venue', 'online'],
        required: true,
    },
    venueName: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    onlineUrl: String,
    latitude: Number,
    longitude: Number,
});
const TicketTierSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    quantitySold: {
        type: Number,
        default: 0,
        min: 0,
    },
    salesStartDate: {
        type: Date,
        required: true,
    },
    salesEndDate: {
        type: Date,
        required: true,
    },
});
const EventImageSchema = new mongoose_1.Schema({
    url: {
        type: String,
        required: true,
    },
    alt: String,
    isCover: {
        type: Boolean,
        default: false,
    },
});
const AttendeeSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ticketTier: {
        type: String,
        required: true,
    },
    registeredAt: {
        type: Date,
        default: Date.now,
    },
    attendanceStatus: {
        type: String,
        enum: ['registered', 'checked-in', 'cancelled'],
        default: 'registered',
    },
});
const EventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'cooking-class',
            'food-festival',
            'wine-tasting',
            'restaurant-event',
            'pop-up',
            'networking',
            'workshop',
            'other',
        ],
    },
    tags: [{
            type: String,
            trim: true,
        }],
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date',
        },
    },
    location: {
        type: EventLocationSchema,
        required: true,
    },
    images: [EventImageSchema],
    ticketTiers: {
        type: [TicketTierSchema],
        required: true,
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: 'At least one ticket tier is required',
        },
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
    },
    attendeeCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    attendees: [AttendeeSchema],
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'draft',
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
EventSchema.index({ organizer: 1, createdAt: -1 });
EventSchema.index({ status: 1, startDate: 1 });
EventSchema.index({ category: 1, startDate: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ 'location.city': 1, startDate: 1 });
EventSchema.index({ isFeatured: 1, startDate: 1 });
EventSchema.pre('save', function (next) {
    if (this.images && this.images.length > 0) {
        const hasCover = this.images.some(img => img.isCover);
        if (!hasCover) {
            this.images[0].isCover = true;
        }
    }
    next();
});
EventSchema.pre('save', function (next) {
    this.attendeeCount = this.attendees.filter(attendee => attendee.attendanceStatus !== 'cancelled').length;
    next();
});
exports.Event = mongoose_1.default.model('Event', EventSchema);
//# sourceMappingURL=Event.model.js.map