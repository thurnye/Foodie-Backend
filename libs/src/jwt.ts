import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string;
}

/**
 * Sign access token (short-lived)
 */
export const signAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
  const expiresIn: string | undefined = process.env.JWT_ACCESS_EXPIRES_IN || '15m';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Sign refresh token (long-lived)
 */
export const signRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
  const expiresIn: string | undefined = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
  return jwt.verify(token, secret) as TokenPayload;
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
  return jwt.verify(token, secret) as TokenPayload;
};

/**
 * Decode token without verification (for debugging)
 */
export const decodeToken = (token: string): TokenPayload | null => {
  return jwt.decode(token) as TokenPayload | null;
};
