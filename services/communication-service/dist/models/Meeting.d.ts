import mongoose, { Document } from 'mongoose';
export interface IMeeting extends Document {
    title: string;
    description?: string;
    organizer: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    teamId?: mongoose.Types.ObjectId;
    channelId?: mongoose.Types.ObjectId;
    startTime: Date;
    endTime: Date;
    duration: number;
    isRecurring: boolean;
    recurrencePattern?: 'daily' | 'weekly' | 'monthly';
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMeeting, {}, {}, {}, mongoose.Document<unknown, {}, IMeeting, {}, {}> & IMeeting & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Meeting.d.ts.map