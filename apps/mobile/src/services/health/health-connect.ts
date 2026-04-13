import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';
import type { HealthAdapter } from './health-adapter';
import type { HealthSample, SleepSample } from '@wareable/shared';

export class HealthConnectAdapter implements HealthAdapter {
  async requestPermissions(): Promise<boolean> {
    try {
      await initialize();
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'SleepSession' },
        { accessType: 'read', recordType: 'TotalCaloriesBurned' },
      ]);
      return granted.length > 0;
    } catch {
      return false;
    }
  }

  async getHeartRate(start: Date, end: Date): Promise<HealthSample[]> {
    try {
      const result = await readRecords('HeartRate', {
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
      });
      return result.records.flatMap((record: any) =>
        record.samples.map((s: any) => ({
          type: 'heart_rate' as const,
          value: s.beatsPerMinute,
          recordedAt: s.time,
        }))
      );
    } catch { return []; }
  }

  async getSteps(start: Date, end: Date): Promise<HealthSample[]> {
    try {
      const result = await readRecords('Steps', {
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
      });
      return result.records.map((record: any) => ({
        type: 'steps' as const,
        value: record.count,
        recordedAt: record.startTime,
      }));
    } catch { return []; }
  }

  async getSleep(start: Date, end: Date): Promise<SleepSample[]> {
    try {
      const result = await readRecords('SleepSession', {
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
      });
      return result.records.map((record: any) => {
        const totalMinutes = record.stages?.reduce((sum: number, s: any) => {
          return sum + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000;
        }, 0) || 0;
        return {
          type: 'sleep' as const,
          totalDurationMinutes: Math.round(totalMinutes),
          stages: (record.stages || []).map((s: any) => ({
            stage: mapAndroidSleepStage(s.stage),
            startTime: s.startTime,
            endTime: s.endTime,
            durationMinutes: Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000),
          })),
          recordedAt: record.startTime,
        };
      });
    } catch { return []; }
  }

  async getCalories(start: Date, end: Date): Promise<HealthSample[]> {
    try {
      const result = await readRecords('TotalCaloriesBurned', {
        timeRangeFilter: { operator: 'between', startTime: start.toISOString(), endTime: end.toISOString() },
      });
      return result.records.map((record: any) => ({
        type: 'calories' as const,
        value: Math.round(record.energy?.inKilocalories || 0),
        recordedAt: record.startTime,
      }));
    } catch { return []; }
  }
}

function mapAndroidSleepStage(stage: number): 'awake' | 'light' | 'deep' | 'rem' {
  switch (stage) {
    case 1: return 'awake';
    case 2: case 3: return 'light';
    case 4: case 5: return 'deep';
    case 6: return 'rem';
    default: return 'light';
  }
}
