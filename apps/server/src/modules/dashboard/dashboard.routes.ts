import type { FastifyInstance } from 'fastify';
import { getDashboardSummary, getMetricDetail } from './dashboard.service.js';
import type { MetricType } from '@wareable/shared';

export async function dashboardRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/api/dashboard/summary', async (request) => {
    const summary = await getDashboardSummary(request.user.id, app.redis);
    return { success: true, data: summary };
  });

  const metricEndpoints: Array<{ path: string; type: MetricType }> = [
    { path: '/api/dashboard/heart-rate', type: 'heart_rate' },
    { path: '/api/dashboard/steps', type: 'steps' },
    { path: '/api/dashboard/sleep', type: 'sleep' },
    { path: '/api/dashboard/calories', type: 'calories' },
  ];

  for (const { path, type } of metricEndpoints) {
    app.get(path, async (request) => {
      const { start, end, interval } = request.query as { start?: string; end?: string; interval?: string };
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const detail = await getMetricDetail(
        request.user.id,
        type,
        start || weekAgo.toISOString(),
        end || now.toISOString(),
        interval || 'day',
        app.redis
      );
      return { success: true, data: detail };
    });
  }
}
