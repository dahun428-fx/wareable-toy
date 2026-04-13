import 'dotenv/config';

export const env = {
  PORT: parseInt(process.env.PORT || '3002', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://wareable:devpassword@localhost:5433/wareable',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6380',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
} as const;
