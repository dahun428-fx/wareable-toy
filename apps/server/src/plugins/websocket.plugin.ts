import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';

async function websocketPluginFn(app: FastifyInstance) {
  await app.register(websocket);
}

export const websocketPlugin = fp(websocketPluginFn, { name: 'websocket' });
