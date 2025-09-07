import { z } from 'zod';

export const login_schema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(4, { error: 'Password must be at least 4 characters' })
    .max(16, { error: 'Password must be at most 16 characters' }),
});
