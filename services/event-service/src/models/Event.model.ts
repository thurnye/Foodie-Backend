import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEventLocation {
  type: 'venue' | 'online';
  venueName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  onlineUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface ITicketTier {
  _id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  quantitySold: number;
  salesStartDate: Date;
  salesEndDate: Date;
}

export interface IEventImage {
  url: string;
  alt?: string;
  isCover?: boolean;
}

export interface IAttendee {
  user: Types.ObjectId;
  ticketTier: string;
  registeredAt: Date;
  attendanceStatus: 'registered' | 'checked-in' | 'cancelled';
}

export interface IEvent extends Document {
  title: string;
  description: string;
  organizer: Types.ObjectId;
  category: string;
  tags: string[];
  startDate: Date;
  endDate: Date;
  location: IEventLocation;
  images: IEventImage[];
  ticketTiers: ITicketTier[];
  capacity: number;
  attendeeCount: number;
  attendees: IAttendee[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventLocationSchema = new Schema<IEventLocation>({
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

const TicketTierSchema = new Schema<ITicketTier>({
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

const EventImageSchema = new Schema<IEventImage>({
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

const AttendeeSchema = new Schema<IAttendee>({
  user: {
    type: Schema.Types.ObjectId,
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

const EventSchema = new Schema<IEvent>(
  {
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
      type: Schema.Types.ObjectId,
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
        validator: function(this: IEvent, value: Date) {
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
        validator: function(value: ITicketTier[]) {
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
EventSchema.index({ organizer: 1, createdAt: -1 });
EventSchema.index({ status: 1, startDate: 1 });
EventSchema.index({ category: 1, startDate: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ 'location.city': 1, startDate: 1 });
EventSchema.index({ isFeatured: 1, startDate: 1 });

// Ensure at least one image is set as cover when images exist
EventSchema.pre('save', function(next) {
  if (this.images && this.images.length > 0) {
    const hasCover = this.images.some(img => img.isCover);
    if (!hasCover) {
      this.images[0].isCover = true;
    }
  }
  next();
});

// Update attendeeCount based on attendees array
EventSchema.pre('save', function(next) {
  this.attendeeCount = this.attendees.filter(
    attendee => attendee.attendanceStatus !== 'cancelled'
  ).length;
  next();
});

export const Event = mongoose.model<IEvent>('Event', EventSchema);
