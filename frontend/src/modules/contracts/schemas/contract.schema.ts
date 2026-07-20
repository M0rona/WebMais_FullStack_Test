import { z } from 'zod';
import { contractItemSchema } from '@/modules/contracts/schemas/contract-item.schema';

export const contractSchema = z.object({
  clientId: z.string().min(1, 'contracts:validation.client.required'),
  type: z.enum(['SERVICE', 'SUPPLY', 'LEASE']),
  dueDate: z.string().min(1, 'contracts:validation.dueDate.required'),
  items: z.array(contractItemSchema).min(1, 'contracts:validation.items.min'),
});
export type ContractFormData = z.infer<typeof contractSchema>;
