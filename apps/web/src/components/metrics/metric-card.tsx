import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number | null;
  unit: string;
  trend?: number | null;
  color: string;
  bg: string;
  loading?: boolean;
}

export function MetricCard({ icon: Icon, label, value, unit, trend, color, bg, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="mt-4 h-8 w-24 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bg)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {value !== null && value !== undefined ? value : '--'}
        </span>
        {unit && <span className="mb-0.5 text-sm text-gray-500">{unit}</span>}
      </div>
      {trend !== null && trend !== undefined && (
        <div className={cn('mt-2 flex items-center gap-1 text-xs', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
          {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>{trend >= 0 ? '+' : ''}{trend}% 전일 대비</span>
        </div>
      )}
    </div>
  );
}
