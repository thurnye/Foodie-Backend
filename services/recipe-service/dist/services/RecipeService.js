"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const Recipe_1 = __importDefault(require("../db/Recipe"));
const libs_1 = require("@foodie/libs");
const filters_1 = require("../utils/filters");
const userClient_1 = require("../utils/userClient");
class RecipeService {
    async populateAuthors(recipes) {
        if (recipes.length === 0)
            return recipes;
        const authorIds = recipes
            .map(recipe => recipe.author?.toString())
            .filter((id) => !!id);
        const authorsMap = await (0, userClient_1.fetchUsersData)(authorIds);
        return recipes.map(recipe => ({
            ...recipe,
            author: authorsMap.get(recipe.author?.toString()) || recipe.author,
        }));
    }
    async createRecipe(userId, recipeData) {
        const recipe = await Recipe_1.default.create({
            ...recipeData,
            author: userId,
        });
        return recipe;
    }
    async getRecipeById(recipeId) {
        const recipe = await Recipe_1.default.findOne({ _id: recipeId, isActive: true }).lean();
        if (!recipe) {
            throw libs_1.Errors.notFound('Recipe not found');
        }
        const [populatedRecipe] = await this.populateAuthors([recipe]);
        return populatedRecipe;
    }
    async getRecipes(queryParams) {
        libs_1.logger.info('Query Params:', queryParams);
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 12;
        const skip = (page - 1) * limit;
        console.log('♦️ Pagination - Page:', page, 'Limit:', limit, 'Skip:', skip);
        const filter = { ...(0, filters_1.buildRecipeFilter)(queryParams), isActive: true };
        const sort = (0, filters_1.buildSortOptions)(queryParams.sortBy, queryParams.sortOrder);
        console.log('♦️ Filter:', filter);
        const [recipes, total] = await Promise.all([
            Recipe_1.default.find(filter)
                .select('_id details.thumbnail basicInfo.recipeName basicInfo.level basicInfo.duration author averageRating totalReviews')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Recipe_1.default.countDocuments(filter),
        ]);
        console.log('Recipes fetched:', total);
        const populatedRecipes = await this.populateAuthors(recipes);
        return { recipes: populatedRecipes, total };
    }
    async getRecipesByUser(userId, page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const [recipes, total] = await Promise.all([
            Recipe_1.default.find({ author: userId, isActive: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Recipe_1.default.countDocuments({ author: userId, isActive: true }),
        ]);
        const populatedRecipes = await this.populateAuthors(recipes);
        return { recipes: populatedRecipes, total };
    }
    async updateRecipe(recipeId, userId, updates) {
        const recipe = await Recipe_1.default.findOne({ _id: recipeId, isActive: true });
        if (!recipe) {
            throw libs_1.Errors.notFound('Recipe not found');
        }
        if (recipe.author.toString() !== userId) {
            throw libs_1.Errors.forbidden('You can only update your own recipes');
        }
        Object.assign(recipe, updates);
        await recipe.save();
        return recipe;
    }
    async deleteRecipe(recipeId, userId) {
        const recipe = await Recipe_1.default.findOne({ _id: recipeId, isActive: true });
        if (!recipe) {
            throw libs_1.Errors.notFound('Recipe not found');
        }
        if (recipe.author.toString() !== userId) {
            throw libs_1.Errors.forbidden('You can only delete your own recipes');
        }
        recipe.isActive = false;
        await recipe.save();
    }
    async addReviewToRecipe(recipeId, reviewId) {
        await Recipe_1.default.findOneAndUpdate({ _id: recipeId, isActive: true }, { $push: { reviews: { review: reviewId } } });
    }
    async updateRecipeRating(recipeId, averageRating, totalReviews) {
        await Recipe_1.default.findOneAndUpdate({ _id: recipeId, isActive: true }, { averageRating, totalReviews });
    }
    async searchRecipes(searchParams) {
        return this.getRecipes(searchParams);
    }
}
exports.RecipeService = RecipeService;
exports.default = new RecipeService();
//# sourceMappingURL=RecipeService.js.map