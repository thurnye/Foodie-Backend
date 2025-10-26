export declare const auditLog: {
    registration: (userId: string, email: string, ip?: string) => void;
    login: (userId: string, email: string, ip?: string) => void;
    loginFailed: (email: string, ip?: string) => void;
    logout: (userId: string, email: string) => void;
    passwordChange: (userId: string, email: string) => void;
    passwordResetRequest: (email: string, ip?: string) => void;
    emailVerified: (userId: string, email: string) => void;
};
//# sourceMappingURL=audit.d.ts.map