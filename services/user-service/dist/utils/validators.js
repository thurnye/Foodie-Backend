"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editProfileSchema = exports.createProfileSchema = void 0;
const libs_1 = require("@foodie/libs");
const joi_1 = __importDefault(require("joi"));
exports.createProfileSchema = joi_1.default.object({
    email: libs_1.commonSchemas.email,
    password: libs_1.commonSchemas.password,
    ...libs_1.optionalUserFields,
    firstName: libs_1.optionalUserFields.firstName.required(),
    lastName: libs_1.optionalUserFields.lastName.required(),
});
exports.editProfileSchema = joi_1.default.object({
    ...libs_1.optionalUserFields,
}).min(1);
//# sourceMappingURL=validators.js.map