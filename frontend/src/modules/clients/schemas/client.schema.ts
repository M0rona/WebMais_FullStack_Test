import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  document: z
    .string()
    .min(11, 'Documento inválido')
    .max(18, 'Documento inválido')
    .regex(/^[\d./-]+$/, 'Documento deve conter apenas números (CPF ou CNPJ)'),
});
export type ClientFormData = z.infer<typeof clientSchema>;
