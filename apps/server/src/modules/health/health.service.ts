import { query } from '../../config/database.js';
import { encrypt, decrypt } from '../../utils/encryption.js';
import type { HealthSyncRequest } from '@wareable/shared';

export async function syncHealthData(userId: string, data: HealthSyncRequest) {
  let synced = 0;
  let duplicates = 0;

  for (const metric of data.metrics) {
    const isSteps = metric.type === 'steps';
    const numericValue = 'value' in metric ? metric.value : ('totalDurationMinutes' in metric ? metric.totalDurationMinutes : null);

    // Encrypt sensitive data (everything except steps plain value)
    let encryptedData: string | null = null;
    if (!isSteps || metric.type === 'sleep') {
      encryptedData = encrypt(JSON.stringify(metric));
    }

    try {
      await query(
        `INSERT INTO health_metrics (user_id, device_id, metric_type, numeric_value, encrypted_data, recorded_at, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, device_id, metric_type, recorded_at) DO NOTHING`,
        [userId, data.deviceId, metric.type, numericValue, encryptedData, metric.recordedAt, JSON.stringify(metric.metadata || {})]
      );
      synced++;
    } catch (err: any) {
      if (err.code === '23505') {
        duplicates++;
      } else {
        throw err;
      }
    }
  }

  // Update device last_synced_at
  await query(
    'UPDATE devices SET last_synced_at = NOW() WHERE id = $1 AND user_id = $2',
    [data.deviceId, userId]
  );

  return { synced, duplicates };
}
