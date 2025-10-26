import { Request, Response, NextFunction } from 'express';
import User from '../db/User';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../domain/password';
import { generateTokens, verifyRefresh } from '../domain/token';
import { success, fail, logger } from '@foodie/libs';

/**
 * Register new user
 */
export const register = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      fail(res, 'User with this email already exists', 409);
      return;
    }

    // Check if username is taken
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        fail(res, 'Username is already taken', 409);
        return;
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      emailVerificationToken,
      emailVerificationExpires,
    });

    logger.info('User registered', { userId: user._id, email: user.email });

    // TODO: Send verification email

    success(
      res,
      {
        userId: user._id,
        email: user.email,
        username: user.username,
      },
      'Registration successful. Please check your email to verify your account.',
      undefined,
      201
    );
  } catch (error) {
    logger.error('Registration error', { error });
    _next(error);
  }
};

/**
 * Login user
 */
export const login = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', { email, password });

    // Find user with password field
    const user = await User.findOne({ email }).select(
      '+password +refreshTokens'
    );
    if (!user) {
      fail(res, 'Invalid email or password', 401);
      return;
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      fail(res, 'Invalid email or password', 401);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );

    // Store refresh token in database
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set access token in header
    res.setHeader('x-access-token', accessToken);

    logger.info('User logged in', { userId: user._id, email: user.email });

    success(
      res,
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        accessToken,
      },
      'Login successful'
    );
  } catch (error) {
    logger.error('Login error', { error });
    _next(error);
  }
};

/**
 * Refresh access token
 */
export const refresh = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      fail(res, 'Refresh token not found', 401);
      return;
    }

    // Verify refresh token
    const payload = verifyRefresh(refreshToken);

    // Find user and check if refresh token exists in database
    const user = await User.findById(payload.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      fail(res, 'Invalid refresh token', 401);
      return;
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken
    );

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
      user.email,
      user.role
    );

    // Store new refresh token
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Update cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Set access token in header
    res.setHeader('x-access-token', accessToken);

    logger.info('Token refreshed', { userId: user._id });

    success(res, { accessToken }, 'Token refreshed successfully');
  } catch (error) {
    logger.error('Token refresh error', { error });
    fail(res, 'Invalid or expired refresh token', 401);
  }
};

/**
 * Logout user
 */
export const logout = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // Remove refresh token from database
      const payload = verifyRefresh(refreshToken);
      const user = await User.findById(payload.userId).select('+refreshTokens');

      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (token) => token !== refreshToken
        );
        await user.save();
        logger.info('User logged out', { userId: user._id });
      }
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    success(res, null, 'Logout successful');
  } catch (error) {
    logger.error('Logout error', { error });
    // Even if there's an error, clear the cookie
    res.clearCookie('refreshToken');
    success(res, null, 'Logout successful');
  }
};

/**
 * Get current user
 */
export const me = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    // User ID is set by auth middleware
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      fail(res, 'User not found', 404);
      return;
    }

    success(res, {
      userId: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      role: user.role,
      reputation: user.reputation,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    logger.error('Get user error', { error });
    _next(error);
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      fail(res, 'Invalid or expired verification token', 400);
      return;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info('Email verified', { userId: user._id, email: user.email });

    success(res, null, 'Email verified successfully');
  } catch (error) {
    logger.error('Email verification error', { error });
    _next(error);
  }
};

/**
 * Resend verification email
 */
export const resendVerification = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select(
      '+emailVerificationToken'
    );

    if (!user) {
      // Don't reveal if user exists
      success(
        res,
        null,
        'If the email exists, a verification link has been sent'
      );
      return;
    }

    if (user.isEmailVerified) {
      fail(res, 'Email is already verified', 400);
      return;
    }

    // Generate new token
    const emailVerificationToken = generateToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    logger.info('Verification email resent', {
      userId: user._id,
      email: user.email,
    });

    // TODO: Send verification email

    success(res, null, 'Verification email sent');
  } catch (error) {
    logger.error('Resend verification error', { error });
    _next(error);
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email }).select('+passwordResetToken');

    if (!user) {
      // Don't reveal if user exists
      success(
        res,
        null,
        'If the email exists, a password reset link has been sent'
      );
      return;
    }

    // Generate reset token
    const passwordResetToken = generateToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    logger.info('Password reset requested', {
      userId: user._id,
      email: user.email,
    });

    // TODO: Send password reset email

    success(res, null, 'Password reset link sent to your email');
  } catch (error) {
    logger.error('Password reset request error', { error });
    _next(error);
  }
};

/**
 * Reset password
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpires');

    if (!user) {
      fail(res, 'Invalid or expired reset token', 400);
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info('Password reset successful', {
      userId: user._id,
      email: user.email,
    });

    success(res, null, 'Password reset successful');
  } catch (error) {
    logger.error('Password reset error', { error });
    _next(error);
  }
};

/**
 * Change password (authenticated user)
 */
export const changePassword = async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      fail(res, 'User not found', 404);
      return;
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      fail(res, 'Current password is incorrect', 401);
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    logger.info('Password changed', { userId: user._id, email: user.email });

    success(res, null, 'Password changed successfully');
  } catch (error) {
    logger.error('Password change error', { error });
    _next(error);
  }
};
