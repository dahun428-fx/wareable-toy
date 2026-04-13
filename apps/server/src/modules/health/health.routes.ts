import type { FastifyInstance } from 'fastify';
import { syncHealthData } from './health.service.js';
import { healthSyncRequestSchema } from '@wareable/shared';

export async function healthRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/api/health/sync', async (request, reply) => {
    const data = healthSyncRequestSchema.parse(request.body);
    const result = await syncHealthData(request.user.id, data);

    // Publish to Redis for real-time updates
    const latestHeartRate = data.metrics.find((m) => m.type === 'heart_rate');
    if (latestHeartRate && 'value' in latestHeartRate) {
      await app.redis.publish(
        `health:${request.user.id}`,
        JSON.stringify({ type: 'heart_rate_update', data: { bpm: latestHeartRate.value, recordedAt: latestHeartRate.recordedAt } })
      );
    }

    // Invalidate dashboard cache
    const cachePattern = `dashboard:${request.user.id}:*`;
    const keys = await app.redis.keys(cachePattern);
    if (keys.length > 0) {
      await app.redis.del(...keys);
    }

    return { success: true, data: result };
  });
}
