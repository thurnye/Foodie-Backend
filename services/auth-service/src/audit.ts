import { logger } from '@foodie/libs';

/**
 * Audit logger for authentication events
 */
export const auditLog = {
  /**
   * Log user registration
   */
  registration: (userId: string, email: string, ip?: string) => {
    logger.info('AUDIT: User Registration', {
      event: 'user.register',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log user login
   */
  login: (userId: string, email: string, ip?: string) => {
    logger.info('AUDIT: User Login', {
      event: 'user.login',
      userId,
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log failed login attempt
   */
  loginFailed: (email: string, ip?: string) => {
    logger.warn('AUDIT: Failed Login Attempt', {
      event: 'user.login.failed',
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log user logout
   */
  logout: (userId: string, email: string) => {
    logger.info('AUDIT: User Logout', {
      event: 'user.logout',
      userId,
      email,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log password change
   */
  passwordChange: (userId: string, email: string) => {
    logger.info('AUDIT: Password Changed', {
      event: 'user.password.change',
      userId,
      email,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log password reset request
   */
  passwordResetRequest: (email: string, ip?: string) => {
    logger.info('AUDIT: Password Reset Requested', {
      event: 'user.password.reset.request',
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log email verification
   */
  emailVerified: (userId: string, email: string) => {
    logger.info('AUDIT: Email Verified', {
      event: 'user.email.verified',
      userId,
      email,
      timestamp: new Date().toISOString(),
    });
  },
};
