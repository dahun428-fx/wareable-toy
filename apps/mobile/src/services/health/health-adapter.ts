import { Platform } from 'react-native';
import type { HealthSample, SleepSample } from '@wareable/shared';

export interface HealthAdapter {
  requestPermissions(): Promise<boolean>;
  getHeartRate(start: Date, end: Date): Promise<HealthSample[]>;
  getSteps(start: Date, end: Date): Promise<HealthSample[]>;
  getSleep(start: Date, end: Date): Promise<SleepSample[]>;
  getCalories(start: Date, end: Date): Promise<HealthSample[]>;
}

export function createHealthAdapter(): HealthAdapter {
  if (Platform.OS === 'ios') {
    const { HealthKitAdapter } = require('./healthkit');
    return new HealthKitAdapter();
  }
  // Default to Health Connect for Android
  const { HealthConnectAdapter } = require('./health-connect');
  return new HealthConnectAdapter();
}
