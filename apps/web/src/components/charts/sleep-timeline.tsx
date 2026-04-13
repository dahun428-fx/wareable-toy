import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSleepData } from '../../hooks/use-health-metrics';
import { format } from 'date-fns';

export function SleepTimeline({ start, end }: { start?: string; end?: string }) {
  const { data, isLoading } = useSleepData(start, end);
  const detail = data?.data;

  if (isLoading) return <div className="h-[364px] animate-pulse rounded-xl border bg-gray-100" />;
  if (!detail?.data?.length) return (
    <div className="flex h-[364px] items-center justify-center rounded-xl border bg-white">
      <p className="text-sm text-gray-400">수면 데이터가 없습니다</p>
    </div>
  );

  const chartData = detail.data.map((p) => ({
    date: format(new Date(p.timestamp), 'MM/dd'),
    hours: Math.round(p.value * 10) / 10,
  }));

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">수면</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>평균 <strong className="text-gray-900">{detail.stats.avg}시간</strong></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" unit="h" />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <Area type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} fill="url(#sleepGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
