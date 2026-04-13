import { StepsBarChart } from '../components/charts/steps-bar-chart';

export function StepsPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">걸음수 상세</h2>
      <StepsBarChart />
    </div>
  );
}
