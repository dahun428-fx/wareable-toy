import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHealthAdapter } from '../health/health-adapter';
import { apiClient } from '../api';
import type { HealthSample, SleepSample } from '@wareable/shared';

const LAST_SYNC_KEY = 'lastSyncTimestamp';
const adapter = createHealthAdapter();

export async function syncHealthData(deviceId: string): Promise<{ synced: number }> {
  const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
  const start = lastSync ? new Date(lastSync) : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const end = new Date();

  // Collect data from all sources
  const [heartRate, steps, sleep, calories] = await Promise.all([
    adapter.getHeartRate(start, end),
    adapter.getSteps(start, end),
    adapter.getSleep(start, end),
    adapter.getCalories(start, end),
  ]);

  const metrics: Array<HealthSample | SleepSample> = [...heartRate, ...steps, ...sleep, ...calories];

  if (metrics.length === 0) {
    return { synced: 0 };
  }

  // Batch upload (max 100 per request)
  let totalSynced = 0;
  for (let i = 0; i < metrics.length; i += 100) {
    const batch = metrics.slice(i, i + 100);
    const { data } = await apiClient.post('/api/health/sync', {
      deviceId,
      metrics: batch,
    });
    totalSynced += data.data.synced;
  }

  await AsyncStorage.setItem(LAST_SYNC_KEY, end.toISOString());
  return { synced: totalSynced };
}
