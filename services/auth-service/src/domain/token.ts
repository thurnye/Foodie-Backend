import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken, TokenPayload } from '@foodie/libs';

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (userId: string, email: string, role?: string) => {
  const payload: TokenPayload = { userId, email, role };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

/**
 * Verify access token
 */
export const verifyAccess = (token: string): TokenPayload => {
  return verifyAccessToken(token);
};

/**
 * Verify refresh token
 */
export const verifyRefresh = (token: string): TokenPayload => {
  return verifyRefreshToken(token);
};
