import { Request, Response, NextFunction } from 'express';
export declare const addRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listRecipes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const queryRecipes: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRecipesByUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRecipeById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=RecipeController.d.ts.map