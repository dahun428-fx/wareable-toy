import { useEffect } from 'react';
import { Heart, Footprints, Moon, Flame } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useDashboardSummary } from '../hooks/use-health-metrics';
import { MetricCard } from '../components/metrics/metric-card';
import { HeartRateChart } from '../components/charts/heart-rate-chart';
import { StepsBarChart } from '../components/charts/steps-bar-chart';
import { SleepTimeline } from '../components/charts/sleep-timeline';
import { CalorieChart } from '../components/charts/calorie-chart';

export function DashboardPage() {
  const { loadUser } = useAuthStore();
  const { data, isLoading } = useDashboardSummary();
  const summary = data?.data;

  useEffect(() => { loadUser(); }, [loadUser]);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">대시보드</h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Heart} label="심박수"
          value={summary?.heartRate?.latestValue ?? null} unit="bpm"
          trend={summary?.heartRate?.trend} color="text-red-500" bg="bg-red-50"
          loading={isLoading}
        />
        <MetricCard
          icon={Footprints} label="걸음수"
          value={summary?.steps?.latestValue?.toLocaleString() ?? null} unit="걸음"
          trend={summary?.steps?.trend} color="text-blue-500" bg="bg-blue-50"
          loading={isLoading}
        />
        <MetricCard
          icon={Moon} label="수면"
          value={summary?.sleep?.latestValue ?? null} unit="시간"
          trend={summary?.sleep?.trend} color="text-purple-500" bg="bg-purple-50"
          loading={isLoading}
        />
        <MetricCard
          icon={Flame} label="칼로리"
          value={summary?.calories?.latestValue?.toLocaleString() ?? null} unit="kcal"
          trend={summary?.calories?.trend} color="text-orange-500" bg="bg-orange-50"
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="mt-6">
        <HeartRateChart />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StepsBarChart />
        <SleepTimeline />
      </div>
      <div className="mt-6">
        <CalorieChart />
      </div>
    </div>
  );
}
