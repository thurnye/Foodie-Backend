import { logger } from '@foodie/libs';

/**
 * Audit logger for user service events
 */
export const auditLog = {
  /**
   * Log profile creation
   */
  profileCreated: (userId: string, email: string) => {
    logger.info('AUDIT: Profile Created', {
      event: 'user.profile.created',
      userId,
      email,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log profile update
   */
  profileUpdated: (userId: string, fields: string[]) => {
    logger.info('AUDIT: Profile Updated', {
      event: 'user.profile.updated',
      userId,
      fields,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log profile deletion
   */
  profileDeleted: (userId: string) => {
    logger.info('AUDIT: Profile Deleted', {
      event: 'user.profile.deleted',
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log reputation change
   */
  reputationChanged: (userId: string, oldReputation: number, newReputation: number) => {
    logger.info('AUDIT: Reputation Changed', {
      event: 'user.reputation.changed',
      userId,
      oldReputation,
      newReputation,
      change: newReputation - oldReputation,
      timestamp: new Date().toISOString(),
    });
  },
};
