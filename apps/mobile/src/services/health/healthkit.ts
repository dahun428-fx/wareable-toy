import AppleHealthKit, {
  HealthKitPermissions,
  HealthInputOptions,
} from 'react-native-health';
import type { HealthAdapter } from './health-adapter';
import type { HealthSample, SleepSample } from '@wareable/shared';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [],
  },
};

export class HealthKitAdapter implements HealthAdapter {
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (err) => {
        resolve(!err);
      });
    });
  }

  async getHeartRate(start: Date, end: Date): Promise<HealthSample[]> {
    const options: HealthInputOptions = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      ascending: true,
    };
    return new Promise((resolve) => {
      AppleHealthKit.getHeartRateSamples(options, (err, results) => {
        if (err || !results) return resolve([]);
        resolve(results.map((r: any) => ({
          type: 'heart_rate' as const,
          value: r.value,
          recordedAt: r.startDate,
        })));
      });
    });
  }

  async getSteps(start: Date, end: Date): Promise<HealthSample[]> {
    const options: HealthInputOptions = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
    return new Promise((resolve) => {
      AppleHealthKit.getDailyStepCountSamples(options, (err, results) => {
        if (err || !results) return resolve([]);
        resolve(results.map((r: any) => ({
          type: 'steps' as const,
          value: r.value,
          recordedAt: r.startDate,
        })));
      });
    });
  }

  async getSleep(start: Date, end: Date): Promise<SleepSample[]> {
    const options: HealthInputOptions = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
    return new Promise((resolve) => {
      AppleHealthKit.getSleepSamples(options, (err, results) => {
        if (err || !results) return resolve([]);
        const totalMinutes = results.reduce((sum: number, r: any) => {
          const duration = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 60000;
          return sum + duration;
        }, 0);
        resolve([{
          type: 'sleep' as const,
          totalDurationMinutes: Math.round(totalMinutes),
          stages: results.map((r: any) => ({
            stage: mapSleepValue(r.value),
            startTime: r.startDate,
            endTime: r.endDate,
            durationMinutes: Math.round((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 60000),
          })),
          recordedAt: results[0]?.startDate || start.toISOString(),
        }]);
      });
    });
  }

  async getCalories(start: Date, end: Date): Promise<HealthSample[]> {
    const options: HealthInputOptions = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
    return new Promise((resolve) => {
      AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
        if (err || !results) return resolve([]);
        resolve(results.map((r: any) => ({
          type: 'calories' as const,
          value: Math.round(r.value),
          recordedAt: r.startDate,
        })));
      });
    });
  }
}

function mapSleepValue(value: string): 'awake' | 'light' | 'deep' | 'rem' {
  switch (value) {
    case 'AWAKE': return 'awake';
    case 'CORE': return 'light';
    case 'DEEP': return 'deep';
    case 'REM': return 'rem';
    default: return 'light';
  }
}
