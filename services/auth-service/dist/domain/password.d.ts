export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const validatePasswordPolicy: (password: string) => {
    valid: boolean;
    message?: string;
};
export declare const generateToken: () => string;
//# sourceMappingURL=password.d.ts.map