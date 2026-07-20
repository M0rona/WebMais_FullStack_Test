import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { isValidCpfOrCnpj } from '../../../common/utils/document.util';

export const CreateClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  document: z
    .string()
    .regex(/^\d{11}$|^\d{14}$/, 'Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos, sem formatação')
    .refine(isValidCpfOrCnpj, { message: 'CPF/CNPJ inválido' }),
});

export const UpdateClientSchema = CreateClientSchema.partial();

export class CreateClientDto extends createZodDto(CreateClientSchema) {}
export class UpdateClientDto extends createZodDto(UpdateClientSchema) {}

export type CreateClientDtoType = z.infer<typeof CreateClientSchema>;
export type UpdateClientDtoType = z.infer<typeof UpdateClientSchema>;
