"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const libs_1 = require("@foodie/libs");
exports.auditLog = {
    profileCreated: (userId, email) => {
        libs_1.logger.info('AUDIT: Profile Created', {
            event: 'user.profile.created',
            userId,
            email,
            timestamp: new Date().toISOString(),
        });
    },
    profileUpdated: (userId, fields) => {
        libs_1.logger.info('AUDIT: Profile Updated', {
            event: 'user.profile.updated',
            userId,
            fields,
            timestamp: new Date().toISOString(),
        });
    },
    profileDeleted: (userId) => {
        libs_1.logger.info('AUDIT: Profile Deleted', {
            event: 'user.profile.deleted',
            userId,
            timestamp: new Date().toISOString(),
        });
    },
    reputationChanged: (userId, oldReputation, newReputation) => {
        libs_1.logger.info('AUDIT: Reputation Changed', {
            event: 'user.reputation.changed',
            userId,
            oldReputation,
            newReputation,
            change: newReputation - oldReputation,
            timestamp: new Date().toISOString(),
        });
    },
};
//# sourceMappingURL=audit.js.map