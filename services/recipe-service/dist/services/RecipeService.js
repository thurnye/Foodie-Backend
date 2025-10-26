"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const Recipe_1 = __importDefault(require("../db/Recipe"));
const libs_1 = require("@foodie/libs");
const filters_1 = require("../utils/filters");
class RecipeService {
    async createRecipe(userId, recipeData) {
        const recipe = await Recipe_1.default.create({
            ...recipeData,
            author: userId,
        });
        return recipe;
    }
    async getRecipeById(recipeId) {
        const recipe = await Recipe_1.default.findById(recipeId).lean();
        if (!recipe) {
            throw libs_1.Errors.notFound('Recipe not found');
        }
        return recipe;
    }
    async getRecipes(queryParams) {
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 12;
        const skip = (page - 1) * limit;
        const filter = (0, filters_1.buildRecipeFilter)(queryParams);
        const sort = (0, filters_1.buildSortOptions)(queryParams.sortBy, queryParams.sortOrder);
        const [recipes, total] = await Promise.all([
            Recipe_1.default.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            Recipe_1.default.countDocuments(filter),
        ]);
        return { recipes: recipes, total };
    }
    async getRecipesByUser(userId, page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const [recipes, total] = await Promise.all([
            Recipe_1.default.find({ author: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Recipe_1.default.countDocuments({ author: userId }),
        ]);
        return { recipes: recipes, total };
    }
    async updateRecipe(recipeId, userId, updates) {
        const recipe = await Recipe_1.default.findById(recipeId);
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
        const recipe = await Recipe_1.default.findById(recipeId);
        if (!recipe) {
            throw libs_1.Errors.notFound('Recipe not found');
        }
        if (recipe.author.toString() !== userId) {
            throw libs_1.Errors.forbidden('You can only delete your own recipes');
        }
        await Recipe_1.default.findByIdAndDelete(recipeId);
    }
    async addReviewToRecipe(recipeId, reviewId) {
        await Recipe_1.default.findByIdAndUpdate(recipeId, {
            $push: { reviews: { review: reviewId } },
        });
    }
    async updateRecipeRating(recipeId, averageRating, totalReviews) {
        await Recipe_1.default.findByIdAndUpdate(recipeId, {
            averageRating,
            totalReviews,
        });
    }
    async searchRecipes(searchParams) {
        return this.getRecipes(searchParams);
    }
}
exports.RecipeService = RecipeService;
exports.default = new RecipeService();
//# sourceMappingURL=RecipeService.js.map