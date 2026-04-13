import type { MetricType } from '../types/health.js';

export const METRIC_UNITS: Record<MetricType, string> = {
  heart_rate: 'bpm',
  steps: '걸음',
  sleep: '시간',
  calories: 'kcal',
  exercise: '분',
};

export const METRIC_DISPLAY_NAMES: Record<MetricType, string> = {
  heart_rate: '심박수',
  steps: '걸음수',
  sleep: '수면',
  calories: '칼로리',
  exercise: '운동',
};

export const METRIC_COLORS: Record<MetricType, string> = {
  heart_rate: '#ef4444',
  steps: '#3b82f6',
  sleep: '#8b5cf6',
  calories: '#f97316',
  exercise: '#22c55e',
};
