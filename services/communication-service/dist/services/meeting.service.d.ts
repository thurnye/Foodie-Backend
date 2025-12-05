declare class MeetingService {
    getUserMeetings(userId: string, filters?: {
        status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
        startDate?: string;
        endDate?: string;
    }): Promise<any[]>;
    getMeetingById(meetingId: string, userId: string): Promise<any>;
    createMeeting(userId: string, data: {
        title: string;
        description?: string;
        participants: string[];
        teamId?: string;
        channelId?: string;
        startTime: Date;
        endTime: Date;
        duration: number;
        isRecurring?: boolean;
        recurrencePattern?: 'daily' | 'weekly' | 'monthly';
        link?: string;
    }): Promise<any>;
    updateMeeting(meetingId: string, userId: string, data: {
        title?: string;
        description?: string;
        participants?: string[];
        startTime?: Date;
        endTime?: Date;
        duration?: number;
        isRecurring?: boolean;
        recurrencePattern?: 'daily' | 'weekly' | 'monthly';
        status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
        link?: string;
    }): Promise<any>;
    deleteMeeting(meetingId: string, userId: string): Promise<void>;
    addParticipant(meetingId: string, userId: string, participantId: string): Promise<any>;
    removeParticipant(meetingId: string, userId: string, participantId: string): Promise<any>;
    getUpcomingMeetings(userId: string): Promise<any[]>;
}
declare const _default: MeetingService;
export default _default;
//# sourceMappingURL=meeting.service.d.ts.map