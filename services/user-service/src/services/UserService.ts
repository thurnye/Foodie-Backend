import User, { IUser } from '../db/User';
import { Errors } from '@foodie/libs';

/**
 * User service - business logic for user operations
 */
export class UserService {
  /**
   * Create user profile (called after registration)
   */
  async createProfile(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    bio?: string;
  }): Promise<IUser> {
    const user = await User.create(data);
    return user;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw Errors.notFound('User not found');
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser> {
    const user = await User.findOne({ email });
    if (!user) {
      throw Errors.notFound('User not found');
    }
    return user;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<IUser> {
    const user = await User.findOne({ username });
    if (!user) {
      throw Errors.notFound('User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: {
      firstName?: string;
      lastName?: string;
      username?: string;
      bio?: string;
      avatar?: string;
    }
  ): Promise<IUser> {
    // Check if username is being updated and if it's already taken
    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw Errors.conflict('Username is already taken');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw Errors.notFound('User not found');
    }

    return user;
  }

  /**
   * Delete user profile
   */
  async deleteProfile(userId: string): Promise<void> {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw Errors.notFound('User not found');
    }
  }

  /**
   * Update user reputation
   */
  async updateReputation(userId: string, points: number): Promise<IUser> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { reputation: points } },
      { new: true }
    );

    if (!user) {
      throw Errors.notFound('User not found');
    }

    return user;
  }

  /**
   * Get users with pagination
   */
  async getUsers(
    page = 1,
    limit = 12
  ): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return { users, total };
  }
}

export default new UserService();
