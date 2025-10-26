"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/login', (0, libs_1.validate)(validators_1.loginSchema), AuthController_1.login);
router.get('/me', AuthController_1.me);
exports.default = router;
//# sourceMappingURL=login.js.map