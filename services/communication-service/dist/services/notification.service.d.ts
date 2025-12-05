declare class NotificationService {
    getUserNotifications(userId: string, filters?: {
        isRead?: boolean;
        type?: 'mention' | 'message' | 'meeting' | 'system';
        page?: number;
        limit?: number;
    }): Promise<any>;
    getUnreadCount(userId: string): Promise<number>;
    getNotificationById(notificationId: string, userId: string): Promise<any>;
    createNotification(data: {
        userId: string;
        type: 'mention' | 'message' | 'meeting' | 'system';
        title: string;
        message: string;
        channelId?: string;
        conversationId?: string;
        meetingId?: string;
        messageId?: string;
    }): Promise<any>;
    markAsRead(notificationId: string, userId: string): Promise<any>;
    markAllAsRead(userId: string): Promise<void>;
    deleteNotification(notificationId: string, userId: string): Promise<void>;
    deleteAllRead(userId: string): Promise<void>;
    createMentionNotification(userId: string, mentionedBy: string, messageId: string, channelId?: string, conversationId?: string): Promise<any>;
    createMeetingNotification(userId: string, meetingId: string, title: string, message: string): Promise<any>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notification.service.d.ts.map