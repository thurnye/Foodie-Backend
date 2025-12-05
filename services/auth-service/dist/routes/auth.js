"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/register', (0, libs_1.validate)(validators_1.registerSchema), AuthController_1.register);
router.post('/login', (0, libs_1.validate)(validators_1.loginSchema), AuthController_1.login);
router.post('/refresh', AuthController_1.refresh);
router.post('/logout', AuthController_1.logout);
router.post('/verify-email', AuthController_1.verifyEmail);
router.post('/resend-verification', AuthController_1.resendVerification);
router.post('/reset-request', AuthController_1.requestPasswordReset);
router.post('/reset-password', AuthController_1.resetPassword);
router.post('/change-password', AuthController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map