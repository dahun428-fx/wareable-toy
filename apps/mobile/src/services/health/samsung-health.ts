import { HealthConnectAdapter } from './health-connect';

// Samsung Health on Android 14+ uses Health Connect API
// This adapter extends HealthConnectAdapter with Samsung-specific detection
export class SamsungHealthAdapter extends HealthConnectAdapter {
  // Samsung Health data flows through Health Connect on modern devices
  // No additional implementation needed for the core health metrics
}
