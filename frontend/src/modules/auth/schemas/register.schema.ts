import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'auth:validation.name.min'),
    email: z.email('auth:validation.email.invalid'),
    password: z.string().min(6, 'auth:validation.password.min'),
    confirmPassword: z.string().min(6, 'auth:validation.password.min'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'auth:validation.confirmPassword.mismatch',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
