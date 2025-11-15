import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const validate: (schema: Joi.Schema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createCookbookSchema: Joi.ObjectSchema<any>;
export declare const updateCookbookSchema: Joi.ObjectSchema<any>;
export declare const queryCookbooksSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validators.d.ts.map