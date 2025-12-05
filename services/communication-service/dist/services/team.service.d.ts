declare class TeamService {
    private populateTeamUserData;
    getUserTeams(userId: string): Promise<any[]>;
    getTeamById(teamId: string, userId: string): Promise<any>;
    createTeam(userId: string, data: {
        name: string;
        description?: string;
        avatar?: string;
    }): Promise<any>;
    updateTeam(teamId: string, userId: string, data: {
        name?: string;
        description?: string;
        avatar?: string;
    }): Promise<any>;
    deleteTeam(teamId: string, userId: string): Promise<void>;
    addMember(teamId: string, userId: string, memberUserId: string): Promise<any>;
    removeMember(teamId: string, userId: string, memberUserId: string): Promise<any>;
    inviteMemberByEmail(teamId: string, userId: string, email: string): Promise<any>;
}
declare const _default: TeamService;
export default _default;
//# sourceMappingURL=team.service.d.ts.map