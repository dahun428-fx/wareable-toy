import { z } from 'zod';

export const metricTypeSchema = z.enum(['heart_rate', 'steps', 'sleep', 'calories', 'exercise']);

export const healthSampleSchema = z.object({
  type: metricTypeSchema,
  value: z.number(),
  recordedAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});

export const sleepStageSchema = z.object({
  stage: z.enum(['awake', 'light', 'deep', 'rem']),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  durationMinutes: z.number().positive(),
});

export const sleepSampleSchema = z.object({
  type: z.literal('sleep'),
  totalDurationMinutes: z.number().positive(),
  stages: z.array(sleepStageSchema),
  recordedAt: z.string().datetime(),
  metadata: z.record(z.unknown()).optional(),
});

export const healthSyncRequestSchema = z.object({
  deviceId: z.string().uuid(),
  metrics: z.array(z.union([healthSampleSchema, sleepSampleSchema])),
});

export const dateRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
});

export const aggregationIntervalSchema = z.enum(['hour', 'day', 'week', 'month']);
