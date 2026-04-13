import type { MetricType } from './health.js';

export interface DateRange {
  start: string;
  end: string;
}

export type AggregationInterval = 'hour' | 'day' | 'week' | 'month';

export interface MetricSummary {
  type: MetricType;
  latestValue: number | null;
  unit: string;
  trend: number | null; // percentage change from previous period
  updatedAt: string | null;
}

export interface DashboardSummary {
  heartRate: MetricSummary;
  steps: MetricSummary;
  sleep: MetricSummary;
  calories: MetricSummary;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface MetricDetail {
  type: MetricType;
  data: TimeSeriesPoint[];
  aggregation: AggregationInterval;
  range: DateRange;
  stats: {
    min: number;
    max: number;
    avg: number;
    total?: number;
  };
}
