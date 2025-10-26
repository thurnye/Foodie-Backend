"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ReviewController_1 = require("../controllers/ReviewController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/recipe', (0, libs_1.validate)(validators_1.addReviewSchema), ReviewController_1.addReview);
router.get('/recipe/:recipeId', ReviewController_1.getReviewsForRecipe);
router.get('/user/:recipeId', ReviewController_1.getUserReviewForRecipe);
router.patch('/:reviewId', (0, libs_1.validate)(validators_1.updateReviewSchema), ReviewController_1.updateReview);
router.delete('/:reviewId', ReviewController_1.deleteReview);
exports.default = router;
//# sourceMappingURL=review.routes.js.map