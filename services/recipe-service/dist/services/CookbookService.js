"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CookbookService = void 0;
const RecipeService_1 = __importDefault(require("./RecipeService"));
const libs_1 = require("@foodie/libs");
class CookbookService {
    async generateCookbook(userId) {
        libs_1.logger.info('Generating cookbook for user', { userId });
        const { recipes: _recipes, total } = await RecipeService_1.default.getRecipesByUser(userId, 1, 100);
        libs_1.logger.info('User recipes retrieved', { userId, totalRecipes: total });
        const pdfId = `cookbook_${userId}_${Date.now()}`;
        const url = `https://storage.foodieblog.com/cookbooks/${pdfId}.pdf`;
        return {
            url,
            pdfId,
        };
    }
    async getCookbookStatus(pdfId) {
        return {
            status: 'completed',
            url: `https://storage.foodieblog.com/cookbooks/${pdfId}.pdf`,
        };
    }
}
exports.CookbookService = CookbookService;
exports.default = new CookbookService();
//# sourceMappingURL=CookbookService.js.map