"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserData = fetchUserData;
const axios_1 = __importDefault(require("axios"));
const libs_1 = require("@foodie/libs");
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
async function fetchUserData(userId) {
    try {
        const response = await axios_1.default.get(`${USER_SERVICE_URL}/${userId}`, {
            timeout: 5000,
        });
        if (response.data.success && response.data.data) {
            const user = response.data.data;
            return {
                _id: user._id || userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar,
                aboutMe: user.bio || user.aboutMe,
            };
        }
        return null;
    }
    catch (error) {
        libs_1.logger.warn('Failed to fetch user data', {
            userId,
            error: error.message,
        });
        return null;
    }
}
//# sourceMappingURL=userClient.js.map