declare class MessageService {
    getChannelMessages(channelId: string, userId: string, page?: number, limit?: number): Promise<any>;
    getConversationMessages(conversationId: string, userId: string, page?: number, limit?: number): Promise<any>;
    getMessageById(messageId: string, userId: string): Promise<any>;
    createMessage(userId: string, data: {
        channelId?: string;
        conversationId?: string;
        content: string;
        type?: 'text' | 'file' | 'image' | 'video' | 'system';
        attachments?: any[];
        mentions?: string[];
        replyTo?: string;
    }): Promise<any>;
    updateMessage(messageId: string, userId: string, data: {
        content: string;
    }): Promise<any>;
    deleteMessage(messageId: string, userId: string): Promise<void>;
    addReaction(messageId: string, userId: string, emoji: string): Promise<any>;
}
declare const _default: MessageService;
export default _default;
//# sourceMappingURL=message.service.d.ts.map