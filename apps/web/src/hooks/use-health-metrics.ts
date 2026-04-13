import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ApiResponse, DashboardSummary, MetricDetail } from '@wareable/shared';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get<ApiResponse<DashboardSummary>>('/api/dashboard/summary'),
    refetchInterval: 30_000,
  });
}

export function useHeartRateData(start?: string, end?: string) {
  return useQuery({
    queryKey: ['dashboard', 'heart-rate', start, end],
    queryFn: () => {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      const qs = params.toString();
      return api.get<ApiResponse<MetricDetail>>(`/api/dashboard/heart-rate${qs ? `?${qs}` : ''}`);
    },
    refetchInterval: 30_000,
  });
}

export function useStepsData(start?: string, end?: string) {
  return useQuery({
    queryKey: ['dashboard', 'steps', start, end],
    queryFn: () => {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      const qs = params.toString();
      return api.get<ApiResponse<MetricDetail>>(`/api/dashboard/steps${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useSleepData(start?: string, end?: string) {
  return useQuery({
    queryKey: ['dashboard', 'sleep', start, end],
    queryFn: () => {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      const qs = params.toString();
      return api.get<ApiResponse<MetricDetail>>(`/api/dashboard/sleep${qs ? `?${qs}` : ''}`);
    },
  });
}

export function useCaloriesData(start?: string, end?: string) {
  return useQuery({
    queryKey: ['dashboard', 'calories', start, end],
    queryFn: () => {
      const params = new URLSearchParams();
      if (start) params.set('start', start);
      if (end) params.set('end', end);
      const qs = params.toString();
      return api.get<ApiResponse<MetricDetail>>(`/api/dashboard/calories${qs ? `?${qs}` : ''}`);
    },
  });
}
