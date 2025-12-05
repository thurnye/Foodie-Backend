declare class ConversationService {
    getUserConversations(userId: string): Promise<any[]>;
    getConversationById(conversationId: string, userId: string): Promise<any>;
    createConversation(userId: string, participantIds: string[]): Promise<any>;
    deleteConversation(conversationId: string, userId: string): Promise<void>;
    addParticipant(conversationId: string, userId: string, newParticipantId: string): Promise<any>;
    removeParticipant(conversationId: string, userId: string, participantId: string): Promise<any>;
    findOrCreateDirectConversation(userId: string, otherUserId: string): Promise<any>;
}
declare const _default: ConversationService;
export default _default;
//# sourceMappingURL=conversation.service.d.ts.map