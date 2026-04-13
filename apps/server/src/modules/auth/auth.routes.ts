import type { FastifyInstance } from 'fastify';
import { verifyGoogleToken, upsertUser, issueTokens, refreshAccessToken, revokeRefreshToken, getUserById } from './auth.service.js';
import { googleOAuthSchema, refreshTokenSchema } from '@wareable/shared';

export async function authRoutes(app: FastifyInstance) {
  // POST /api/auth/google
  app.post('/api/auth/google', async (request, reply) => {
    try {
      const { idToken } = googleOAuthSchema.parse(request.body);
      const googleData = await verifyGoogleToken(idToken);
      const user = await upsertUser(googleData);
      const tokens = await issueTokens(app, user);
      return { success: true, data: { user, tokens } };
    } catch (err: any) {
      app.log.error({ err }, 'Google auth failed');
      return reply.status(401).send({
        success: false,
        error: { code: 'AUTH_FAILED', message: 'Google authentication failed' },
      });
    }
  });

  // POST /api/auth/refresh
  app.post('/api/auth/refresh', async (request, reply) => {
    try {
      const { refreshToken } = refreshTokenSchema.parse(request.body);
      const tokens = await refreshAccessToken(app, refreshToken);
      return { success: true, data: { tokens } };
    } catch (err: any) {
      return reply.status(401).send({
        success: false,
        error: { code: 'REFRESH_FAILED', message: 'Token refresh failed' },
      });
    }
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', { preHandler: [app.authenticate] }, async (request) => {
    await revokeRefreshToken(request.user.id);
    return { success: true, data: { message: 'Logged out' } };
  });

  // GET /api/users/me
  app.get('/api/users/me', { preHandler: [app.authenticate] }, async (request, reply) => {
    const user = await getUserById(request.user.id);
    if (!user) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }
    return { success: true, data: user };
  });
}
