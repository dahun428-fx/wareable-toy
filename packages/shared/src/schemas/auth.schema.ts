import { z } from 'zod';

export const googleOAuthSchema = z.object({
  idToken: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
