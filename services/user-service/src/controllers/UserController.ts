import { Request, Response, NextFunction } from 'express';
import UserService from '../services/UserService';
import { success, fail, paginationMeta, logger } from '@foodie/libs';

/**
 * Create user profile
 */
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, username } = req.body;

    const user = await UserService.createProfile({
      email,
      password,
      firstName,
      lastName,
      username,
    });

    logger.info('User profile created', { userId: user._id });

    success(
      res,
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      'Profile created successfully',
      undefined,
      201
    );
  } catch (error) {
    logger.error('Create profile error', { error });
    next(error);
  }
};

/**
 * Get user profile by ID
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    // console.log('USERID:::', id)
    const user = await UserService.getUserById(id);

    success(res, {
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
  } catch (error) {
    logger.error('Get profile error', { error });
    next(error);
  }
};

/**
 * Get user profile by ID
 */
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;

    const user = await UserService.getUserById(userId);

    success(res, {
      userId: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      avatar: user.avatar,
      slogan: user.slogan,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      phoneNumber: user.phoneNumber,
      address: user.address,
      city: user.city,
      state: user.state,
      country: user.country,
      postalCode: user.postalCode,
      role: user.role,
      reputation: user.reputation,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    });
  } catch (error) {
    logger.error('Get profile error', { error });
    next(error);
  }
};

/**
 * Get user profile by Email
 */
export const getProfileByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.params;

    const user = await UserService.getUserByEmail(email);

    success(res, {
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
  } catch (error) {
    logger.error('Get profile error', { error });
    next(error);
  }
};

/**
 * Update user profile
 */
export const editProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // User ID should come from authenticated user
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const {
      firstName,
      lastName,
      username,
      bio,
      avatar,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      city,
      state,
      country,
      postalCode,
    } = req.body;

    const user = await UserService.updateProfile(userId, {
      firstName,
      lastName,
      username,
      bio,
      avatar,
      dateOfBirth,
      gender,
      phoneNumber,
      address,
      city,
      state,
      country,
      postalCode,
    });

    logger.info('User profile updated', { userId: user._id });

    success(
      res,
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        postalCode: user.postalCode,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    logger.error('Edit profile error', { error });
    next(error);
  }
};

/**
 * Delete user profile
 */
export const deleteProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    await UserService.deleteProfile(userId);

    logger.info('User profile deleted', { userId });

    success(res, null, 'Profile deleted successfully');
  } catch (error) {
    logger.error('Delete profile error', { error });
    next(error);
  }
};

/**
 * Get all users (with pagination)
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { users, total } = await UserService.getUsers(page, limit);

    const meta = paginationMeta(page, limit, total);

    success(
      res,
      users.map((user) => ({
        userId: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        slogan: user.slogan,
        reputation: user.reputation,
        createdAt: user.createdAt,
      })),
      'Users retrieved successfully',
      meta
    );
  } catch (error) {
    logger.error('Get users error', { error });
    next(error);
  }
};
