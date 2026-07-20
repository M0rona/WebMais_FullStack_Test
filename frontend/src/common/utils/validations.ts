import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  document: z
    .string()
    .min(11, 'Documento inválido')
    .max(18, 'Documento inválido')
    .regex(/^[\d./-]+$/, 'Documento deve conter apenas números (CPF ou CNPJ)'),
});
export type ClientFormData = z.infer<typeof clientSchema>;

export const contractItemSchema = z.object({
  description: z.string().min(2, 'Descrição obrigatória'),
  quantity: z.coerce.number().positive('Quantidade deve ser positiva'),
  unitValue: z.coerce.number().positive('Valor deve ser positivo'),
});
export type ContractItemFormData = z.infer<typeof contractItemSchema>;

export const contractSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  type: z.enum(['SERVICE', 'SUPPLY', 'LEASE']),
  dueDate: z.string().min(1, 'Informe o vencimento'),
  items: z.array(contractItemSchema).min(1, 'Adicione ao menos um item'),
});
export type ContractFormData = z.infer<typeof contractSchema>;
