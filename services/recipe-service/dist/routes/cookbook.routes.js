"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CookbookController_1 = require("../controllers/CookbookController");
const router = (0, express_1.Router)();
router.post('/generateCookBook/:userId', CookbookController_1.generateCookbook);
router.get('/cookbook/:pdfId', CookbookController_1.getCookbookStatus);
exports.default = router;
//# sourceMappingURL=cookbook.routes.js.map