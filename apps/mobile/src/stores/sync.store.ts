import { create } from 'zustand';
import { syncHealthData } from '../services/sync/sync-engine';

interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: string | null;
  lastSyncCount: number;
  error: string | null;
  sync: (deviceId: string) => Promise<void>;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncedAt: null,
  lastSyncCount: 0,
  error: null,

  sync: async (deviceId: string) => {
    set({ isSyncing: true, error: null });
    try {
      const result = await syncHealthData(deviceId);
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
