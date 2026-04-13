import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useHeartRateData } from '../../hooks/use-health-metrics';
import { format } from 'date-fns';

export function HeartRateChart({ start, end }: { start?: string; end?: string }) {
  const { data, isLoading } = useHeartRateData(start, end);
  const detail = data?.data;

  if (isLoading) return <ChartSkeleton />;
  if (!detail?.data?.length) return <EmptyChart message="심박수 데이터가 없습니다" />;

  const chartData = detail.data.map((p) => ({
    time: format(new Date(p.timestamp), 'MM/dd HH:mm'),
    bpm: p.value,
  }));

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">심박수</h3>
        <div className="flex gap-4 text-sm text-gray-500">
          <span>최저 <strong className="text-gray-900">{detail.stats.min}</strong></span>
          <span>평균 <strong className="text-gray-900">{detail.stats.avg}</strong></span>
          <span>최고 <strong className="text-gray-900">{detail.stats.max}</strong></span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} stroke="#9ca3af" />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <ReferenceLine y={detail.stats.avg} stroke="#94a3b8" strokeDasharray="5 5" label="평균" />
          <Line type="monotone" dataKey="bpm" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-[364px] animate-pulse rounded-xl border bg-gray-100" />;
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[364px] items-center justify-center rounded-xl border bg-white">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
