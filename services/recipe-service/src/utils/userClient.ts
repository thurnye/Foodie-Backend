import axios from 'axios';
import { logger } from '@foodie/libs';

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://localhost:3002';

export interface UserData {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  slogan: string;
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
      return {
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        slogan: user.slogan
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

/**
 * Fetch multiple users data in batch
 */
export async function fetchUsersData(
  userIds: string[]
): Promise<Map<string, UserData>> {
  const uniqueUserIds = [...new Set(userIds)];
  const userMap = new Map<string, UserData>();

  // Fetch all users in parallel
  const results = await Promise.allSettled(
    uniqueUserIds.map((userId) => fetchUserData(userId))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      userMap.set(uniqueUserIds[index], result.value);
    }
  });

  return userMap;
}
