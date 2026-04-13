import { HeartRateChart } from '../components/charts/heart-rate-chart';

export function HeartRatePage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">심박수 상세</h2>
      <HeartRateChart />
    </div>
  );
}
