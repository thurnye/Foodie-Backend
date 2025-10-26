export declare const auditLog: {
    profileCreated: (userId: string, email: string) => void;
    profileUpdated: (userId: string, fields: string[]) => void;
    profileDeleted: (userId: string) => void;
    reputationChanged: (userId: string, oldReputation: number, newReputation: number) => void;
};
//# sourceMappingURL=audit.d.ts.map