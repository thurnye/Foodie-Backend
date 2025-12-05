"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = __importDefault(require("../db/User"));
const libs_1 = require("@foodie/libs");
class UserService {
    async createProfile(data) {
        const user = await User_1.default.create(data);
        return user;
    }
    async getUserById(userId) {
        const user = await User_1.default.findById(userId);
        if (!user) {
            throw libs_1.Errors.notFound('User not found');
        }
        return user;
    }
    async getUserByEmail(email) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            throw libs_1.Errors.notFound('User not found');
        }
        return user;
    }
    async getUserByUsername(username) {
        const user = await User_1.default.findOne({ username });
        if (!user) {
            throw libs_1.Errors.notFound('User not found');
        }
        return user;
    }
    async updateProfile(userId, updates) {
        if (updates.username) {
            const existingUser = await User_1.default.findOne({ username: updates.username });
            if (existingUser && existingUser._id.toString() !== userId) {
                throw libs_1.Errors.conflict('Username is already taken');
            }
        }
        const user = await User_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!user) {
            throw libs_1.Errors.notFound('User not found');
        }
        return user;
    }
    async deleteProfile(userId) {
        const user = await User_1.default.findByIdAndDelete(userId);
        if (!user) {
            throw libs_1.Errors.notFound('User not found');
        }
    }
    async updateReputation(userId, points) {
        const user = await User_1.default.findByIdAndUpdate(userId, { $inc: { reputation: points } }, { new: true });
        if (!user) {
            throw libs_1.Errors.notFound('User not found');
        }
        return user;
    }
    async getUsers(page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_1.default.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
            User_1.default.countDocuments(),
        ]);
        return { users, total };
    }
}
exports.UserService = UserService;
exports.default = new UserService();
//# sourceMappingURL=UserService.js.map