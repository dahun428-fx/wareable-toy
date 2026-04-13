export const API_PATHS = {
  AUTH: {
    GOOGLE: '/api/auth/google',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    ME: '/api/users/me',
  },
  DEVICES: {
    BASE: '/api/devices',
    BY_ID: (id: string) => `/api/devices/${id}`,
  },
  HEALTH: {
    SYNC: '/api/health/sync',
  },
  DASHBOARD: {
    SUMMARY: '/api/dashboard/summary',
    HEART_RATE: '/api/dashboard/heart-rate',
    STEPS: '/api/dashboard/steps',
    SLEEP: '/api/dashboard/sleep',
    CALORIES: '/api/dashboard/calories',
  },
  WS: '/api/ws',
} as const;
