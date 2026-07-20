import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.email({ message: 'Email inválido' }),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const LoginSchema = z.object({
  email: z.email({ message: 'Email inválido' }),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}

export type RegisterDtoType = z.infer<typeof RegisterSchema>;
export type LoginDtoType = z.infer<typeof LoginSchema>;

export interface AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
