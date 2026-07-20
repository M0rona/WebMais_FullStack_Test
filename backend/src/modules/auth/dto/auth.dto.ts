import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'auth.validation.name.min'),
  email: z.email({ message: 'auth.validation.email.invalid' }),
  password: z.string().min(6, 'auth.validation.password.min'),
});

export const LoginSchema = z.object({
  email: z.email({ message: 'auth.validation.email.invalid' }),
  password: z.string().min(1, 'auth.validation.password.required'),
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
