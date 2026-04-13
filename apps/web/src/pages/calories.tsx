import { CalorieChart } from '../components/charts/calorie-chart';

export function CaloriesPage() {
  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">칼로리 상세</h2>
      <CalorieChart />
    </div>
  );
}
