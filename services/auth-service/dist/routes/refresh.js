"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
router.post('/refresh', AuthController_1.refresh);
exports.default = router;
//# sourceMappingURL=refresh.js.map