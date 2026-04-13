import type { FastifyInstance } from 'fastify';
import type { WebSocket } from '@fastify/websocket';

export async function realtimeRoutes(app: FastifyInstance) {
  app.get('/api/ws', { websocket: true }, async (socket: WebSocket, request) => {
    // Authenticate via query param
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(4001, 'Missing token');
      return;
    }

    let userId: string;
    try {
      const payload = app.jwt.verify<{ sub: string }>(token);
      userId = payload.sub;
    } catch {
      socket.close(4001, 'Invalid token');
      return;
    }

    app.log.info({ userId }, 'WebSocket client connected');

    // Subscribe to Redis channel for this user
    const channel = `health:${userId}`;

    const messageHandler = (ch: string, message: string) => {
      if (ch === channel && socket.readyState === socket.OPEN) {
        socket.send(message);
      }
    };

    await app.redisSub.subscribe(channel);
    app.redisSub.on('message', messageHandler);

    // Send initial connection confirmation
    socket.send(JSON.stringify({ type: 'connected', data: { userId } }));

    // Handle client messages (ping/pong keepalive)
    socket.on('message', (data: Buffer | ArrayBuffer | Buffer[]) => {
      const msg = data.toString();
      if (msg === 'ping') {
        socket.send(JSON.stringify({ type: 'pong' }));
      }
    });

    // Cleanup on disconnect
    socket.on('close', async () => {
      app.log.info({ userId }, 'WebSocket client disconnected');
      app.redisSub.removeListener('message', messageHandler);
      // Only unsubscribe if no other listeners
      const listenerCount = app.redisSub.listenerCount('message');
      if (listenerCount === 0) {
        await app.redisSub.unsubscribe(channel);
      }
    });

    socket.on('error', (err: Error) => {
      app.log.error({ err, userId }, 'WebSocket error');
    });
  });
}
