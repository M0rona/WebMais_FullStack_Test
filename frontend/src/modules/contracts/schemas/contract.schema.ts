import { z } from 'zod';
import { contractItemSchema } from '@/modules/contracts/schemas/contract-item.schema';

export const contractSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  type: z.enum(['SERVICE', 'SUPPLY', 'LEASE']),
  dueDate: z.string().min(1, 'Informe o vencimento'),
  items: z.array(contractItemSchema).min(1, 'Adicione ao menos um item'),
});
export type ContractFormData = z.infer<typeof contractSchema>;
