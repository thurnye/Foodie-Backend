import axios from 'axios';
import { logger } from '@foodie/libs';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL!;

export interface UserData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
}

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
