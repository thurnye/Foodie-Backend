"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RecipeController_1 = require("../controllers/RecipeController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/add/:userId', (0, libs_1.validate)(validators_1.addRecipeSchema), RecipeController_1.addRecipe);
router.post('/', (0, libs_1.validate)(validators_1.queryRecipesSchema), RecipeController_1.listRecipes);
router.post('/query', (0, libs_1.validate)(validators_1.queryRecipesSchema), RecipeController_1.queryRecipes);
router.post('/user/:userId', RecipeController_1.getRecipesByUser);
router.get('/:id', RecipeController_1.getRecipeById);
router.patch('/:id', (0, libs_1.validate)(validators_1.updateRecipeSchema), RecipeController_1.updateRecipe);
router.delete('/:id', RecipeController_1.deleteRecipe);
exports.default = router;
//# sourceMappingURL=recipe.routes.js.map