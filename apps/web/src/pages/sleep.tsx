import { SleepTimeline } from '../components/charts/sleep-timeline';

export function SleepPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">수면 상세</h2>
      <SleepTimeline />
    </div>
  );
}
