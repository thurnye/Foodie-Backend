"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRecipeData = fetchRecipeData;
const axios_1 = __importDefault(require("axios"));
const libs_1 = require("@foodie/libs");
const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL;
async function fetchRecipeData(recipeId) {
    try {
        const response = await axios_1.default.get(`${RECIPE_SERVICE_URL}/${recipeId}`, {
            timeout: 5000,
        });
        if (response.data.success && response.data.data) {
            const recipe = response.data.data;
            return recipe;
        }
        return null;
    }
    catch (error) {
        libs_1.logger.warn('Failed to fetch recipe data', {
            recipeId,
            error: error.message,
        });
        return null;
    }
}
//# sourceMappingURL=recipeClient.js.map