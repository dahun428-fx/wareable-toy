import type { FastifyInstance } from 'fastify';
import { getDevices, createDevice, updateDevice, deleteDevice } from './devices.service.js';
import { createDeviceSchema, updateDeviceSchema } from '@wareable/shared';

export async function devicesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/api/devices', async (request) => {
    const devices = await getDevices(request.user.id);
    return { success: true, data: devices };
  });

  app.post('/api/devices', async (request, reply) => {
    try {
      const data = createDeviceSchema.parse(request.body);
      const device = await createDevice(request.user.id, data);
      return reply.status(201).send({ success: true, data: device });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.status(409).send({ success: false, error: { code: 'DUPLICATE', message: 'Device already registered' } });
      }
      throw err;
    }
  });

  app.patch('/api/devices/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = updateDeviceSchema.parse(request.body);
    const device = await updateDevice(request.user.id, id, data);
    if (!device) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Device not found' } });
    }
    return { success: true, data: device };
  });

  app.delete('/api/devices/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await deleteDevice(request.user.id, id);
    if (!deleted) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Device not found' } });
    }
    return { success: true, data: { message: 'Device deleted' } };
  });
}
