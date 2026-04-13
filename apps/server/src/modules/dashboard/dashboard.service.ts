import { query } from '../../config/database.js';
import { decrypt } from '../../utils/encryption.js';
import type { MetricType, DashboardSummary, MetricDetail, TimeSeriesPoint } from '@wareable/shared';
import { METRIC_UNITS } from '@wareable/shared';
import type Redis from 'ioredis';

const CACHE_TTL = 60; // seconds

export async function getDashboardSummary(userId: string, redis: Redis): Promise<DashboardSummary> {
  const cacheKey = `dashboard:${userId}:summary`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const metricTypes: MetricType[] = ['heart_rate', 'steps', 'sleep', 'calories'];
  const summary: any = {};

  for (const type of metricTypes) {
    const latest = await query<any>(
      `SELECT numeric_value, encrypted_data, recorded_at
       FROM health_metrics
       WHERE user_id = $1 AND metric_type = $2
       ORDER BY recorded_at DESC LIMIT 1`,
      [userId, type]
    );

    const prev = await query<any>(
      `SELECT AVG(numeric_value) as avg_value
       FROM health_metrics
       WHERE user_id = $1 AND metric_type = $2
         AND recorded_at >= NOW() - INTERVAL '2 days'
         AND recorded_at < NOW() - INTERVAL '1 day'`,
      [userId, type]
    );

    let latestValue: number | null = null;
    let updatedAt: string | null = null;

    if (latest.rows.length > 0) {
      latestValue = latest.rows[0].numeric_value;
      updatedAt = latest.rows[0].recorded_at;

      // For encrypted types, try to get value from encrypted_data
      if (latestValue === null && latest.rows[0].encrypted_data) {
        try {
          const decrypted = JSON.parse(decrypt(latest.rows[0].encrypted_data));
          if (decrypted.bpm) latestValue = decrypted.bpm;
          else if (decrypted.calories) latestValue = decrypted.calories;
          else if (decrypted.totalDurationMinutes) latestValue = Math.round(decrypted.totalDurationMinutes / 60 * 10) / 10;
        } catch {}
      }
    }

    const prevAvg = prev.rows[0]?.avg_value;
    const trend = latestValue && prevAvg ? Math.round((latestValue - prevAvg) / prevAvg * 100) : null;

    const key = type === 'heart_rate' ? 'heartRate' : type;
    summary[key] = {
      type,
      latestValue,
      unit: METRIC_UNITS[type],
      trend,
      updatedAt,
    };
  }

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(summary));
  return summary;
}

export async function getMetricDetail(
  userId: string,
  metricType: MetricType,
  start: string,
  end: string,
  interval: string,
  redis: Redis
): Promise<MetricDetail> {
  const cacheKey = `dashboard:${userId}:${metricType}:${start}:${end}:${interval}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Get raw data points
  const result = await query<any>(
    `SELECT numeric_value, encrypted_data, recorded_at
     FROM health_metrics
     WHERE user_id = $1 AND metric_type = $2
       AND recorded_at >= $3 AND recorded_at <= $4
     ORDER BY recorded_at ASC`,
    [userId, metricType, start, end]
  );

  const data: TimeSeriesPoint[] = result.rows.map((row: any) => {
    let value = row.numeric_value;
    if (value === null && row.encrypted_data) {
      try {
        const decrypted = JSON.parse(decrypt(row.encrypted_data));
        if (decrypted.bpm) value = decrypted.bpm;
        else if (decrypted.calories) value = decrypted.calories;
        else if (decrypted.totalDurationMinutes) value = Math.round(decrypted.totalDurationMinutes / 60 * 10) / 10;
      } catch {}
    }
    return { timestamp: row.recorded_at, value: value ?? 0 };
  });

  const values = data.map((d) => d.value).filter((v) => v > 0);
  const stats = {
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    avg: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10 : 0,
    total: values.reduce((a, b) => a + b, 0),
  };

  const detail: MetricDetail = {
    type: metricType,
    data,
    aggregation: interval as any,
    range: { start, end },
    stats,
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(detail));
  return detail;
}
