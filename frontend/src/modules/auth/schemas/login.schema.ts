import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('auth:validation.email.invalid'),
  password: z.string().min(1, 'auth:validation.password.required'),
});
export type LoginFormData = z.infer<typeof loginSchema>;
