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
  // presente para itens já existentes (edição); ausente para itens novos — é assim que o
  // model do form-dialog decide POST (novo) vs PATCH (existente) vs DELETE (removido).
  id: z.string().optional(),
  description: z.string().min(2, 'Descrição obrigatória'),
  // number puro, não z.coerce: coerce faz o tipo de input do resolver virar `unknown`,
  // o que quebra a inferência de tipos do useForm<ContractFormData>. A conversão
  // string->number é feita no <Input> via register(name, { valueAsNumber: true }).
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unitValue: z.number().positive('Valor deve ser positivo'),
});
export type ContractItemFormData = z.infer<typeof contractItemSchema>;

export const contractSchema = z.object({
  clientId: z.string().min(1, 'Selecione um cliente'),
  type: z.enum(['SERVICE', 'SUPPLY', 'LEASE']),
  dueDate: z.string().min(1, 'Informe o vencimento'),
  items: z.array(contractItemSchema).min(1, 'Adicione ao menos um item'),
});
export type ContractFormData = z.infer<typeof contractSchema>;
