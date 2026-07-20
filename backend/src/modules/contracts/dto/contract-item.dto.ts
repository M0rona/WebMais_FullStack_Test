import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ContractItemInputSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter no mínimo 2 caracteres'),
  quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
  unitValue: z.coerce.number().positive('Valor unitário deve ser positivo'),
});

export const UpdateContractItemSchema = ContractItemInputSchema.partial();

export class CreateContractItemDto extends createZodDto(ContractItemInputSchema) {}
export class UpdateContractItemDto extends createZodDto(UpdateContractItemSchema) {}

export type ContractItemInputType = z.infer<typeof ContractItemInputSchema>;
export type UpdateContractItemDtoType = z.infer<typeof UpdateContractItemSchema>;
