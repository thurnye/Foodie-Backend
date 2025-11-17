"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editProfileSchema = exports.createProfileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createProfileSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().optional().trim(),
    lastName: joi_1.default.string().optional().trim(),
    username: joi_1.default.string().alphanum().min(3).max(30).optional().trim(),
});
exports.editProfileSchema = joi_1.default.object({
    firstName: joi_1.default.string().optional().trim(),
    lastName: joi_1.default.string().optional().trim(),
    username: joi_1.default.string().alphanum().min(3).max(30).optional().trim(),
    bio: joi_1.default.string().max(500).optional().trim(),
    avatar: joi_1.default.string().uri().optional(),
}).min(1);
//# sourceMappingURL=validators.js.map