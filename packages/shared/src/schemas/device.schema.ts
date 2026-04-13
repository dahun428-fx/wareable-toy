import { z } from 'zod';

export const devicePlatformSchema = z.enum(['ios_healthkit', 'android_health_connect', 'samsung_health']);

export const createDeviceSchema = z.object({
  platform: devicePlatformSchema,
  deviceName: z.string().optional(),
  deviceModel: z.string().optional(),
});

export const updateDeviceSchema = z.object({
  deviceName: z.string().optional(),
  deviceModel: z.string().optional(),
  isActive: z.boolean().optional(),
});
