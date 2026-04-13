import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Redis from 'ioredis';
import { env } from '../config/env.js';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
    redisSub: Redis;
  }
}

async function redisPluginFn(app: FastifyInstance) {
  const redis = new Redis(env.REDIS_URL);
  const redisSub = new Redis(env.REDIS_URL);

  app.decorate('redis', redis);
  app.decorate('redisSub', redisSub);

  app.addHook('onClose', async () => {
    await redis.quit();
    await redisSub.quit();
  });
}

export const redisPlugin = fp(redisPluginFn, { name: 'redis' });
