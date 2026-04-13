import Fastify from 'fastify';
import { loggerConfig } from './utils/logger.js';
import { corsPlugin } from './plugins/cors.plugin.js';
import { authPlugin } from './plugins/auth.plugin.js';
import { redisPlugin } from './plugins/redis.plugin.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { devicesRoutes } from './modules/devices/devices.routes.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes.js';
import { websocketPlugin } from './plugins/websocket.plugin.js';
import { realtimeRoutes } from './modules/realtime/realtime.gateway.js';

export async function createApp() {
  const app = Fastify({ logger: loggerConfig });

  // Plugins
  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(redisPlugin);
  await app.register(websocketPlugin);

  // Routes
  await app.register(authRoutes);
  await app.register(devicesRoutes);
  await app.register(healthRoutes);
  await app.register(dashboardRoutes);
  await app.register(realtimeRoutes);

  // Health check
  app.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  return app;
}
