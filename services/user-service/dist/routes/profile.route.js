"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const libs_1 = require("@foodie/libs");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post('/create', (0, libs_1.validate)(validators_1.createProfileSchema), UserController_1.createProfile);
router.post('/edit', (0, libs_1.validate)(validators_1.editProfileSchema), UserController_1.editProfile);
router.get('/', UserController_1.getUsers);
router.get('/email/:email', UserController_1.getProfileByEmail);
router.get('/me', UserController_1.getMyProfile);
router.get('/:id', UserController_1.getProfile);
router.delete('/', UserController_1.deleteProfile);
exports.default = router;
//# sourceMappingURL=profile.route.js.map