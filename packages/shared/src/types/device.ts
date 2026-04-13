export type DevicePlatform = 'ios_healthkit' | 'android_health_connect' | 'samsung_health';

export interface Device {
  id: string;
  userId: string;
  platform: DevicePlatform;
  deviceName: string | null;
  deviceModel: string | null;
  lastSyncedAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeviceRequest {
  platform: DevicePlatform;
  deviceName?: string;
  deviceModel?: string;
}
