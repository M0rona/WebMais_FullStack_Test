import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'clients:validation.name.min'),
  document: z
    .string()
    .min(11, 'clients:validation.document.invalid')
    .max(18, 'clients:validation.document.invalid')
    .regex(/^[\d./-]+$/, 'clients:validation.document.format'),
});
export type ClientFormData = z.infer<typeof clientSchema>;
