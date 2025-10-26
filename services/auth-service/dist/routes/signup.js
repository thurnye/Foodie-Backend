"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/register', (0, libs_1.validate)(validators_1.registerSchema), AuthController_1.register);
exports.default = router;
//# sourceMappingURL=signup.js.map