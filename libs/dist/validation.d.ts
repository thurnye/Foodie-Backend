import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    email: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    objectId: Joi.StringSchema<string>;
    pagination: Joi.ObjectSchema<any>;
};
export declare const sanitize: (input: string) => string;
//# sourceMappingURL=validation.d.ts.map