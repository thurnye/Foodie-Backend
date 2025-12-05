import { Request, Response, NextFunction } from 'express';
export declare const register: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const refresh: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const logout: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const verifyEmail: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const resendVerification: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const requestPasswordReset: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
export declare const changePassword: (req: Request, res: Response, _next: NextFunction) => Promise<void>;
//# sourceMappingURL=AuthController.d.ts.map