declare class ChannelService {
    getTeamChannels(teamId: string, userId: string): Promise<any[]>;
    getChannelById(channelId: string, userId: string): Promise<any>;
    createChannel(userId: string, data: {
        teamId: string;
        name: string;
        description?: string;
        type?: 'text' | 'announcement';
        isPrivate?: boolean;
    }): Promise<any>;
    updateChannel(channelId: string, userId: string, data: {
        name?: string;
        description?: string;
        type?: 'text' | 'announcement';
        isPrivate?: boolean;
    }): Promise<any>;
    deleteChannel(channelId: string, userId: string): Promise<void>;
    addMember(channelId: string, userId: string, memberUserId: string): Promise<any>;
    removeMember(channelId: string, userId: string, memberUserId: string): Promise<any>;
}
declare const _default: ChannelService;
export default _default;
//# sourceMappingURL=channel.service.d.ts.map