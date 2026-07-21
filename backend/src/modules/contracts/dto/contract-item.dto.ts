import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ContractItemInputSchema = z.object({
  description: z.string().min(2, 'contracts.validation.item.description.min'),
  quantity: z.coerce.number().positive('contracts.validation.item.quantity.positive'),
  unitValue: z.coerce.number().positive('contracts.validation.item.unitValue.positive'),
});

export const UpdateContractItemSchema = ContractItemInputSchema.partial();

// Usado no PATCH /contracts/:id (edição em lote de contrato + itens): cada
// item da lista traz `id` quando já existe (atualiza) ou vem sem `id` quando
// é novo (cria) — permite diffar contra os itens atuais do contrato numa
// única transação, em vez de uma requisição HTTP por item alterado.
export const ContractItemUpsertSchema = ContractItemInputSchema.extend({
  id: z.uuid().optional(),
});

export class CreateContractItemDto extends createZodDto(ContractItemInputSchema) {}
export class UpdateContractItemDto extends createZodDto(UpdateContractItemSchema) {}

export type ContractItemInputType = z.infer<typeof ContractItemInputSchema>;
export type UpdateContractItemDtoType = z.infer<typeof UpdateContractItemSchema>;
export type ContractItemUpsertType = z.infer<typeof ContractItemUpsertSchema>;
