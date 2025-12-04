import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  changePassword,
} from '../controllers/AuthController';
import { validate } from '@foodie/libs';
import { registerSchema, loginSchema } from '../utils/validators';

const router = Router();

// POST /register - Register new user
router.post('/register', validate(registerSchema), register);

// POST /login - Login user
router.post('/login', validate(loginSchema), login);

// POST /refresh - Refresh access token
router.post('/refresh', refresh);

// POST /logout - Logout user
router.post('/logout', logout);


// POST /verify-email - Verify email address
router.post('/verify-email', verifyEmail);

// POST /resend-verification - Resend verification email
router.post('/resend-verification', resendVerification);

// POST /reset-request - Request password reset
router.post('/reset-request', requestPasswordReset);

// POST /reset-password - Reset password with token
router.post('/reset-password', resetPassword);

// POST /change-password - Change password (authenticated)
router.post('/change-password', changePassword);

export default router;
