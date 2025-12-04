import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const commonSchemas: {
    email: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    objectId: Joi.StringSchema<string>;
    pagination: Joi.ObjectSchema<any>;
};
export declare const optionalUserFields: {
    firstName: Joi.StringSchema<string>;
    lastName: Joi.StringSchema<string>;
    username: Joi.StringSchema<string>;
    bio: Joi.StringSchema<string>;
    avatar: Joi.StringSchema<string>;
    dateOfBirth: Joi.StringSchema<string>;
    gender: Joi.StringSchema<string>;
    phoneNumber: Joi.StringSchema<string>;
    address: Joi.StringSchema<string>;
    city: Joi.StringSchema<string>;
    state: Joi.StringSchema<string>;
    country: Joi.StringSchema<string>;
    postalCode: Joi.StringSchema<string>;
    slogan: Joi.StringSchema<string>;
};
export declare const sanitize: (input: string) => string;
//# sourceMappingURL=validation.d.ts.map