"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.deleteProfile = exports.editProfile = exports.getProfile = exports.createProfile = void 0;
const UserService_1 = __importDefault(require("../services/UserService"));
const libs_1 = require("@foodie/libs");
const createProfile = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, username } = req.body;
        const user = await UserService_1.default.createProfile({
            email,
            password,
            firstName,
            lastName,
            username,
        });
        libs_1.logger.info('User profile created', { userId: user._id });
        (0, libs_1.success)(res, {
            userId: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
        }, 'Profile created successfully', undefined, 201);
    }
    catch (error) {
        libs_1.logger.error('Create profile error', { error });
        next(error);
    }
};
exports.createProfile = createProfile;
const getProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService_1.default.getUserById(id);
        (0, libs_1.success)(res, {
            userId: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
            slogan: user.slogan,
            role: user.role,
            reputation: user.reputation,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        libs_1.logger.error('Get profile error', { error });
        next(error);
    }
};
exports.getProfile = getProfile;
const editProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        const { firstName, lastName, username, bio, avatar } = req.body;
        const user = await UserService_1.default.updateProfile(userId, {
            firstName,
            lastName,
            username,
            bio,
            avatar,
        });
        libs_1.logger.info('User profile updated', { userId: user._id });
        (0, libs_1.success)(res, {
            userId: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
        }, 'Profile updated successfully');
    }
    catch (error) {
        libs_1.logger.error('Edit profile error', { error });
        next(error);
    }
};
exports.editProfile = editProfile;
const deleteProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        await UserService_1.default.deleteProfile(userId);
        libs_1.logger.info('User profile deleted', { userId });
        (0, libs_1.success)(res, null, 'Profile deleted successfully');
    }
    catch (error) {
        libs_1.logger.error('Delete profile error', { error });
        next(error);
    }
};
exports.deleteProfile = deleteProfile;
const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { users, total } = await UserService_1.default.getUsers(page, limit);
        const meta = (0, libs_1.paginationMeta)(page, limit, total);
        (0, libs_1.success)(res, users.map((user) => ({
            userId: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            slogan: user.slogan,
            reputation: user.reputation,
            createdAt: user.createdAt,
        })), 'Users retrieved successfully', meta);
    }
    catch (error) {
        libs_1.logger.error('Get users error', { error });
        next(error);
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=UserController.js.map