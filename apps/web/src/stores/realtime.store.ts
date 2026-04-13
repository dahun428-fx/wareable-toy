import { create } from 'zustand';

interface RealtimeState {
  isConnected: boolean;
  latestHeartRate: { bpm: number; recordedAt: string } | null;
  setConnected: (connected: boolean) => void;
  setLatestHeartRate: (data: { bpm: number; recordedAt: string }) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isConnected: false,
  latestHeartRate: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setLatestHeartRate: (data) => set({ latestHeartRate: data }),
}));
