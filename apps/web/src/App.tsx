import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { HeartRatePage } from './pages/heart-rate';
import { StepsPage } from './pages/steps';
import { SleepPage } from './pages/sleep';
import { CaloriesPage } from './pages/calories';
import { MainLayout } from './components/layout/main-layout';
import { ProtectedRoute } from './components/auth/protected-route';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/heart-rate" element={<HeartRatePage />} />
        <Route path="/steps" element={<StepsPage />} />
        <Route path="/sleep" element={<SleepPage />} />
        <Route path="/calories" element={<CaloriesPage />} />
      </Route>
    </Routes>
  );
}
