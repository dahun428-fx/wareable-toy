import { OAuth2Client } from 'google-auth-library';
import { randomBytes, createHash } from 'node:crypto';
import { query } from '../../config/database.js';
import { env } from '../../config/env.js';
import type { User, AuthTokens } from '@wareable/shared';
import type { FastifyInstance } from 'fastify';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export async function verifyGoogleToken(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) throw new Error('Invalid Google token');
  return {
    googleId: payload.sub,
    email: payload.email!,
    displayName: payload.name || payload.email!,
    avatarUrl: payload.picture || null,
  };
}

export async function upsertUser(googleData: {
  googleId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}): Promise<User> {
  const result = await query<any>(
    `INSERT INTO users (google_id, email, display_name, avatar_url)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (google_id) DO UPDATE SET
       email = EXCLUDED.email,
       display_name = EXCLUDED.display_name,
       avatar_url = EXCLUDED.avatar_url,
       updated_at = NOW()
     RETURNING id, google_id as "googleId", email, display_name as "displayName",
               avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"`,
    [googleData.googleId, googleData.email, googleData.displayName, googleData.avatarUrl]
  );
  return result.rows[0];
}

export async function issueTokens(app: FastifyInstance, user: User): Promise<AuthTokens> {
  const accessToken = app.jwt.sign(
    { sub: user.id, email: user.email },
    { expiresIn: '15m' }
  );

  const refreshToken = randomBytes(40).toString('hex');
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [user.id, tokenHash, expiresAt.toISOString()]
  );

  return { accessToken, refreshToken };
}

export async function refreshAccessToken(app: FastifyInstance, refreshToken: string): Promise<AuthTokens> {
  const tokenHash = createHash('sha256').update(refreshToken).digest('hex');

  const result = await query<any>(
    `SELECT rt.id, rt.user_id, u.email
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked = false AND rt.expires_at > NOW()`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired refresh token');
  }

  const { user_id, email } = result.rows[0];

  // Revoke old token
  await query('UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1', [tokenHash]);

  // Get full user
  const userResult = await query<any>(
    `SELECT id, google_id as "googleId", email, display_name as "displayName",
            avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE id = $1`,
    [user_id]
  );

  return issueTokens(app, userResult.rows[0]);
}

export async function revokeRefreshToken(userId: string): Promise<void> {
  await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = $1 AND revoked = false', [userId]);
}

export async function getUserById(userId: string): Promise<User | null> {
  const result = await query<any>(
    `SELECT id, google_id as "googleId", email, display_name as "displayName",
            avatar_url as "avatarUrl", created_at as "createdAt", updated_at as "updatedAt"
     FROM users WHERE id = $1`,
    [userId]
  );
  return result.rows[0] || null;
}
