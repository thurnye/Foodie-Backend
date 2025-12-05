"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.requestPasswordReset = exports.resendVerification = exports.verifyEmail = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const User_1 = __importDefault(require("../db/User"));
const password_1 = require("../domain/password");
const token_1 = require("../domain/token");
const libs_1 = require("@foodie/libs");
const register = async (req, res, _next) => {
    try {
        const { email, password, firstName, lastName, username } = req.body;
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            (0, libs_1.fail)(res, 'User with this email already exists', 409);
            return;
        }
        if (username) {
            const existingUsername = await User_1.default.findOne({ username });
            if (existingUsername) {
                (0, libs_1.fail)(res, 'Username is already taken', 409);
                return;
            }
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const emailVerificationToken = (0, password_1.generateToken)();
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await User_1.default.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            username,
            emailVerificationToken,
            emailVerificationExpires,
        });
        libs_1.logger.info('User registered', { userId: user._id, email: user.email, _id: user._id });
        (0, libs_1.success)(res, {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
        }, 'Registration successful. Please check your email to verify your account.', undefined, 201);
    }
    catch (error) {
        libs_1.logger.error('Registration error', { error });
        _next(error);
    }
};
exports.register = register;
const login = async (req, res, _next) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt for email:', { email, password });
        const user = await User_1.default.findOne({ email }).select('+password +refreshTokens');
        if (!user) {
            (0, libs_1.fail)(res, 'Invalid email or password', 401);
            return;
        }
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            (0, libs_1.fail)(res, 'Invalid email or password', 401);
        }
        const { accessToken, refreshToken } = (0, token_1.generateTokens)(user._id.toString(), user.email, user.role);
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.setHeader('x-access-token', accessToken);
        libs_1.logger.info('User logged in', { userId: user._id, email: user.email });
        (0, libs_1.success)(res, {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            accessToken,
        }, 'Login successful');
    }
    catch (error) {
        libs_1.logger.error('Login error', { error });
        _next(error);
    }
};
exports.login = login;
const refresh = async (req, res, _next) => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) {
            (0, libs_1.fail)(res, 'Refresh token not found', 401);
            return;
        }
        const payload = (0, token_1.verifyRefresh)(refreshToken);
        const user = await User_1.default.findById(payload.userId).select('+refreshTokens');
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            (0, libs_1.fail)(res, 'Invalid refresh token', 401);
            return;
        }
        user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        const { accessToken, refreshToken: newRefreshToken } = (0, token_1.generateTokens)(user._id.toString(), user.email, user.role);
        user.refreshTokens.push(newRefreshToken);
        await user.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.setHeader('x-access-token', accessToken);
        libs_1.logger.info('Token refreshed', { userId: user._id });
        (0, libs_1.success)(res, {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            avatar: user.avatar,
            role: user.role,
            accessToken,
        }, 'Token refreshed successfully');
    }
    catch (error) {
        libs_1.logger.error('Token refresh error', { error });
        (0, libs_1.fail)(res, 'Invalid or expired refresh token', 401);
    }
};
exports.refresh = refresh;
const logout = async (req, res, _next) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const payload = (0, token_1.verifyRefresh)(refreshToken);
            const user = await User_1.default.findById(payload.userId).select('+refreshTokens');
            if (user) {
                user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
                await user.save();
                libs_1.logger.info('User logged out', { userId: user._id });
            }
        }
        res.clearCookie('refreshToken');
        (0, libs_1.success)(res, null, 'Logout successful');
    }
    catch (error) {
        libs_1.logger.error('Logout error', { error });
        res.clearCookie('refreshToken');
        (0, libs_1.success)(res, null, 'Logout successful');
    }
};
exports.logout = logout;
const verifyEmail = async (req, res, _next) => {
    try {
        const { token } = req.body;
        const user = await User_1.default.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() },
        }).select('+emailVerificationToken +emailVerificationExpires');
        if (!user) {
            (0, libs_1.fail)(res, 'Invalid or expired verification token', 400);
            return;
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        libs_1.logger.info('Email verified', { userId: user._id, email: user.email });
        (0, libs_1.success)(res, null, 'Email verified successfully');
    }
    catch (error) {
        libs_1.logger.error('Email verification error', { error });
        _next(error);
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res, _next) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email }).select('+emailVerificationToken');
        if (!user) {
            (0, libs_1.success)(res, null, 'If the email exists, a verification link has been sent');
            return;
        }
        if (user.isEmailVerified) {
            (0, libs_1.fail)(res, 'Email is already verified', 400);
            return;
        }
        const emailVerificationToken = (0, password_1.generateToken)();
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;
        await user.save();
        libs_1.logger.info('Verification email resent', {
            userId: user._id,
            email: user.email,
        });
        (0, libs_1.success)(res, null, 'Verification email sent');
    }
    catch (error) {
        libs_1.logger.error('Resend verification error', { error });
        _next(error);
    }
};
exports.resendVerification = resendVerification;
const requestPasswordReset = async (req, res, _next) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email }).select('+passwordResetToken');
        if (!user) {
            (0, libs_1.success)(res, null, 'If the email exists, a password reset link has been sent');
            return;
        }
        const passwordResetToken = (0, password_1.generateToken)();
        const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        user.passwordResetToken = passwordResetToken;
        user.passwordResetExpires = passwordResetExpires;
        await user.save();
        libs_1.logger.info('Password reset requested', {
            userId: user._id,
            email: user.email,
        });
        (0, libs_1.success)(res, null, 'Password reset link sent to your email');
    }
    catch (error) {
        libs_1.logger.error('Password reset request error', { error });
        _next(error);
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res, _next) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User_1.default.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        }).select('+password +passwordResetToken +passwordResetExpires');
        if (!user) {
            (0, libs_1.fail)(res, 'Invalid or expired reset token', 400);
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        libs_1.logger.info('Password reset successful', {
            userId: user._id,
            email: user.email,
        });
        (0, libs_1.success)(res, null, 'Password reset successful');
    }
    catch (error) {
        libs_1.logger.error('Password reset error', { error });
        _next(error);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (req, res, _next) => {
    try {
        const userId = req.headers['x-user-id'];
        const { oldPassword, newPassword } = req.body;
        console.log("CHANGE PASSWORD BODY:::", req.body);
        console.log("CHANGE PASSWORD BODY userId:::", userId);
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        const user = await User_1.default.findById(userId).select('+password');
        if (!user) {
            (0, libs_1.fail)(res, 'User not found', 404);
            return;
        }
        const isPasswordValid = await (0, password_1.comparePassword)(oldPassword, user.password);
        if (!isPasswordValid) {
            (0, libs_1.fail)(res, 'Current password is incorrect', 401);
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        user.password = hashedPassword;
        await user.save();
        libs_1.logger.info('Password changed', { userId: user._id, email: user.email });
        (0, libs_1.success)(res, null, 'Password changed successfully');
    }
    catch (error) {
        libs_1.logger.error('Password change error', { error });
        _next(error);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=AuthController.js.map