import { z } from 'zod';

export const contractItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(2, 'contracts:validation.item.description.required'),
  quantity: z.number().positive('contracts:validation.item.quantity.positive'),
  unitValue: z.number().positive('contracts:validation.item.unitValue.positive'),
});
export type ContractItemFormData = z.infer<typeof contractItemSchema>;
