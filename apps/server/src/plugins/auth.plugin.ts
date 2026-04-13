import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';
import { env } from '../config/env.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; email: string };
    user: { id: string; email: string };
  }
}

async function authPluginFn(app: FastifyInstance) {
  await app.register(fjwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: '15m' },
  });

  app.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(authPluginFn, { name: 'auth' });
