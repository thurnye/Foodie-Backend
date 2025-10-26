"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
router.post('/logout', AuthController_1.logout);
exports.default = router;
//# sourceMappingURL=logout.js.map