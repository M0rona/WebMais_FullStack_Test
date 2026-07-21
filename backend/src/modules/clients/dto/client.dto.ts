import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PaginationQuerySchema } from '../../../common/dto/pagination.dto';
import { isValidCpfOrCnpj } from '../../../common/utils/document.util';

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'clients.validation.name.min'),
  document: z
    .string()
    .regex(/^\d{11}$|^\d{14}$/, 'clients.validation.document.format')
    .refine(isValidCpfOrCnpj, { message: 'clients.validation.document.invalid' }),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export const ListClientsQuerySchema = PaginationQuerySchema.extend({
  search: z.string().optional(),
});

export class CreateClientDto extends createZodDto(CreateClientSchema) {}
export class UpdateClientDto extends createZodDto(UpdateClientSchema) {}
export class ListClientsQueryDto extends createZodDto(ListClientsQuerySchema) {}

export type CreateClientDtoType = z.infer<typeof CreateClientSchema>;
export type UpdateClientDtoType = z.infer<typeof UpdateClientSchema>;
export type ListClientsQueryType = z.infer<typeof ListClientsQuerySchema>;
