import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ContractItemInputSchema = z.object({
  description: z.string().min(2, 'contracts.validation.item.description.min'),
  quantity: z.coerce.number().positive('contracts.validation.item.quantity.positive'),
  unitValue: z.coerce.number().positive('contracts.validation.item.unitValue.positive'),
});

export const UpdateContractItemSchema = ContractItemInputSchema.partial();

export const ContractItemUpsertSchema = ContractItemInputSchema.extend({
  id: z.uuid().optional(),
});

export class CreateContractItemDto extends createZodDto(ContractItemInputSchema) {}
export class UpdateContractItemDto extends createZodDto(UpdateContractItemSchema) {}

export type ContractItemInputType = z.infer<typeof ContractItemInputSchema>;
export type UpdateContractItemDtoType = z.infer<typeof UpdateContractItemSchema>;
export type ContractItemUpsertType = z.infer<typeof ContractItemUpsertSchema>;
