import { z } from 'zod';

export const contractItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(2, 'Descrição obrigatória'),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unitValue: z.number().positive('Valor deve ser positivo'),
});
export type ContractItemFormData = z.infer<typeof contractItemSchema>;
