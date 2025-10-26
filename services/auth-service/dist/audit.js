"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const libs_1 = require("@foodie/libs");
exports.auditLog = {
    registration: (userId, email, ip) => {
        libs_1.logger.info('AUDIT: User Registration', {
            event: 'user.register',
            userId,
            email,
            ip,
            timestamp: new Date().toISOString(),
        });
    },
    login: (userId, email, ip) => {
        libs_1.logger.info('AUDIT: User Login', {
            event: 'user.login',
            userId,
            email,
            ip,
            timestamp: new Date().toISOString(),
        });
    },
    loginFailed: (email, ip) => {
        libs_1.logger.warn('AUDIT: Failed Login Attempt', {
            event: 'user.login.failed',
            email,
            ip,
            timestamp: new Date().toISOString(),
        });
    },
    logout: (userId, email) => {
        libs_1.logger.info('AUDIT: User Logout', {
            event: 'user.logout',
            userId,
            email,
            timestamp: new Date().toISOString(),
        });
    },
    passwordChange: (userId, email) => {
        libs_1.logger.info('AUDIT: Password Changed', {
            event: 'user.password.change',
            userId,
            email,
            timestamp: new Date().toISOString(),
        });
    },
    passwordResetRequest: (email, ip) => {
        libs_1.logger.info('AUDIT: Password Reset Requested', {
            event: 'user.password.reset.request',
            email,
            ip,
            timestamp: new Date().toISOString(),
        });
    },
    emailVerified: (userId, email) => {
        libs_1.logger.info('AUDIT: Email Verified', {
            event: 'user.email.verified',
            userId,
            email,
            timestamp: new Date().toISOString(),
        });
    },
};
//# sourceMappingURL=audit.js.map