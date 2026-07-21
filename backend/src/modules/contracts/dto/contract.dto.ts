import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { ContractItemInputSchema, ContractItemUpsertSchema } from './contract-item.dto';

export const ContractTypeSchema = z.enum(['SERVICE', 'SUPPLY', 'LEASE']);
export const ContractStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CLOSED']);

const dueDateSchema = z.iso
  .datetime('contracts.validation.dueDate.invalid')
  .refine((date) => new Date(date) > new Date(), {
    message: 'contracts.validation.dueDate.future',
  });

export const CreateContractSchema = z.object({
  clientId: z.uuid('contracts.validation.client.invalid'),
  type: ContractTypeSchema.default('SERVICE'),
  dueDate: dueDateSchema,
  items: z.array(ContractItemInputSchema).min(1, 'contracts.validation.items.min'),
});

export const UpdateContractSchema = z.object({
  clientId: z.uuid('contracts.validation.client.invalid').optional(),
  type: ContractTypeSchema.optional(),
  dueDate: dueDateSchema.optional(),
  items: z.array(ContractItemUpsertSchema).min(1, 'contracts.validation.items.min').optional(),
});

export const ListContractsQuerySchema = PaginationQuerySchema.extend({
  status: ContractStatusSchema.optional(),
  type: ContractTypeSchema.optional(),
  search: z.string().optional(),
});

export class CreateContractDto extends createZodDto(CreateContractSchema) {}
export class UpdateContractDto extends createZodDto(UpdateContractSchema) {}
export class ListContractsQueryDto extends createZodDto(ListContractsQuerySchema) {}

export type CreateContractDtoType = z.infer<typeof CreateContractSchema>;
export type UpdateContractDtoType = z.infer<typeof UpdateContractSchema>;
export type ListContractsQueryType = z.infer<typeof ListContractsQuerySchema>;
