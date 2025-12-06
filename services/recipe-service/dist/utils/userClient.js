"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserData = fetchUserData;
exports.fetchUsersData = fetchUsersData;
const axios_1 = __importDefault(require("axios"));
const libs_1 = require("@foodie/libs");
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
async function fetchUserData(userId) {
    try {
        const response = await axios_1.default.get(`${USER_SERVICE_URL}/${userId}`, {
            timeout: 5000,
        });
        if (response.data.success && response.data.data) {
            const user = response.data.data;
            return {
                userId: user.userId,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                slogan: user.slogan,
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
async function fetchUsersData(userIds) {
    const uniqueUserIds = [...new Set(userIds)];
    const userMap = new Map();
    const results = await Promise.allSettled(uniqueUserIds.map((userId) => fetchUserData(userId)));
    results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
            userMap.set(uniqueUserIds[index], result.value);
        }
    });
    return userMap;
}
//# sourceMappingURL=userClient.js.map