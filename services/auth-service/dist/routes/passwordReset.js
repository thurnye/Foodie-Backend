"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/reset-request', (0, libs_1.validate)(validators_1.resetRequestSchema), AuthController_1.requestPasswordReset);
router.post('/reset', (0, libs_1.validate)(validators_1.resetPasswordSchema), AuthController_1.resetPassword);
router.post('/change', (0, libs_1.validate)(validators_1.changePasswordSchema), AuthController_1.changePassword);
router.post('/email/verify', (0, libs_1.validate)(validators_1.verifyEmailSchema), AuthController_1.verifyEmail);
router.post('/email/resend-verification', (0, libs_1.validate)(validators_1.resetRequestSchema), AuthController_1.resendVerification);
exports.default = router;
//# sourceMappingURL=passwordReset.js.map