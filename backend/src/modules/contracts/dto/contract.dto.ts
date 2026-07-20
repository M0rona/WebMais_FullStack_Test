import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { ContractItemInputSchema } from './contract-item.dto';

export const ContractTypeSchema = z.enum(['SERVICE', 'SUPPLY', 'LEASE']);
export const ContractStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CLOSED']);

const dueDateSchema = z.iso
  .datetime('Data de vencimento inválida')
  .refine((date) => new Date(date) > new Date(), {
    message: 'Data de vencimento deve ser no futuro',
  });

export const CreateContractSchema = z.object({
  clientId: z.uuid('Cliente inválido'),
  type: ContractTypeSchema.default('SERVICE'),
  dueDate: dueDateSchema,
  items: z.array(ContractItemInputSchema).min(1, 'Contrato precisa de ao menos um item'),
});

export const UpdateContractSchema = z.object({
  clientId: z.uuid('Cliente inválido').optional(),
  type: ContractTypeSchema.optional(),
  dueDate: dueDateSchema.optional(),
});

export const ListContractsQuerySchema = PaginationQuerySchema.extend({
  status: ContractStatusSchema.optional(),
  type: ContractTypeSchema.optional(),
});

export class CreateContractDto extends createZodDto(CreateContractSchema) {}
export class UpdateContractDto extends createZodDto(UpdateContractSchema) {}
export class ListContractsQueryDto extends createZodDto(ListContractsQuerySchema) {}

export type CreateContractDtoType = z.infer<typeof CreateContractSchema>;
export type UpdateContractDtoType = z.infer<typeof UpdateContractSchema>;
export type ListContractsQueryType = z.infer<typeof ListContractsQuerySchema>;
