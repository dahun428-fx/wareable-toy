import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCaloriesData } from '../../hooks/use-health-metrics';
import { format } from 'date-fns';

export function CalorieChart({ start, end }: { start?: string; end?: string }) {
  const { data, isLoading } = useCaloriesData(start, end);
  const detail = data?.data;

  if (isLoading) return <div className="h-[364px] animate-pulse rounded-xl border bg-gray-100" />;
  if (!detail?.data?.length) return (
    <div className="flex h-[364px] items-center justify-center rounded-xl border bg-white">
      <p className="text-sm text-gray-400">칼로리 데이터가 없습니다</p>
    </div>
  );

  const chartData = detail.data.map((p) => ({
    date: format(new Date(p.timestamp), 'MM/dd'),
    calories: Math.round(p.value),
  }));

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">칼로리</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>총 <strong className="text-gray-900">{detail.stats.total?.toLocaleString()} kcal</strong></span>
          <span>일 평균 <strong className="text-gray-900">{detail.stats.avg.toLocaleString()} kcal</strong></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <Bar dataKey="calories" fill="#f97316" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
