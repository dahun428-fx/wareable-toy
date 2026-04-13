import { create } from 'zustand';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncHealthData } from '../services/sync/sync-engine';
import { getDevices, registerDevice } from '../services/api';
import type { DevicePlatform } from '@wareable/shared';

const ACTIVE_DEVICE_KEY = 'activeDeviceId';

function detectPlatform(): DevicePlatform {
  return Platform.OS === 'ios' ? 'ios_healthkit' : 'android_health_connect';
}

interface SyncState {
  activeDeviceId: string | null;
  isSyncing: boolean;
  isInitializing: boolean;
  lastSyncedAt: string | null;
  lastSyncCount: number;
  error: string | null;
  initDevice: () => Promise<void>;
  sync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  activeDeviceId: null,
  isSyncing: false,
  isInitializing: false,
  lastSyncedAt: null,
  lastSyncCount: 0,
  error: null,

  initDevice: async () => {
    if (get().activeDeviceId || get().isInitializing) return;
    set({ isInitializing: true });

    try {
      // 캐시된 deviceId 확인
      const cached = await AsyncStorage.getItem(ACTIVE_DEVICE_KEY);
      if (cached) {
        set({ activeDeviceId: cached, isInitializing: false });
        return;
      }

      const platform = detectPlatform();

      // 서버에서 기존 기기 조회
      const devices = await getDevices();
      const existing = devices.find((d) => d.platform === platform && d.isActive);

      if (existing) {
        await AsyncStorage.setItem(ACTIVE_DEVICE_KEY, existing.id);
        set({ activeDeviceId: existing.id, isInitializing: false });
        return;
      }

      // 없으면 새로 등록
      const device = await registerDevice(platform);
      await AsyncStorage.setItem(ACTIVE_DEVICE_KEY, device.id);
      set({ activeDeviceId: device.id, isInitializing: false });
    } catch (err: any) {
      set({ isInitializing: false, error: err.message || 'Device init failed' });
    }
  },

  sync: async () => {
    const { activeDeviceId } = get();
    if (!activeDeviceId) return;

    set({ isSyncing: true, error: null });
    try {
      const result = await syncHealthData(activeDeviceId);
      set({
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        lastSyncCount: result.synced,
      });
    } catch (err: any) {
      set({ isSyncing: false, error: err.message || 'Sync failed' });
    }
  },
}));
