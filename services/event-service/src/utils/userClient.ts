import axios from 'axios';
import { logger } from '@foodie/libs';
import { UserData } from '../types/event.services.types';

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://localhost:3002';

/**
 * Fetch user data from user-service
 */
export async function fetchUserData(userId: string): Promise<UserData | null> {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/${userId}`, {
      timeout: 5000,
    });

    if (response.data.success && response.data.data) {
      const user = response.data.data;
      // console.log('Fetched user data:', user);
      return {
        _id: user._id || userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
      };
    }

    return null;
  } catch (error: any) {
    logger.warn('Failed to fetch user data', {
      userId,
      error: error.message,
    });
    return null;
  }
}
