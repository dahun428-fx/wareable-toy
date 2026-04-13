export type MetricType = 'heart_rate' | 'steps' | 'sleep' | 'calories' | 'exercise';

export interface HealthSample {
  type: MetricType;
  value: number;
  recordedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SleepStage {
  stage: 'awake' | 'light' | 'deep' | 'rem';
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface SleepSample {
  type: 'sleep';
  totalDurationMinutes: number;
  stages: SleepStage[];
  recordedAt: string;
  metadata?: Record<string, unknown>;
}

export interface HealthMetric {
  id: string;
  userId: string;
  deviceId: string | null;
  metricType: MetricType;
  numericValue: number | null;
  data: HealthSample | SleepSample | null;
  recordedAt: string;
  syncedAt: string;
  metadata: Record<string, unknown>;
}

export interface HealthSyncRequest {
  deviceId: string;
  metrics: Array<HealthSample | SleepSample>;
}

export interface HealthSyncResponse {
  synced: number;
  duplicates: number;
}
