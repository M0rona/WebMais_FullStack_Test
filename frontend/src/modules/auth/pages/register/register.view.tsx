import { Link } from 'react-router-dom';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RegisterModel } from './register.model';

export const RegisterView = ({ form, onSubmit, isSubmitting }: RegisterModel) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>WebMais</CardTitle>
          <CardDescription>Gestão de Contratos — crie sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              label="Nome"
              required
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />
            <InputField
              label="Email"
              required
              type="email"
              autoComplete="username"
              error={errors.email?.message}
              {...register('email')}
            />
            <InputField
              label="Senha"
              required
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <InputField
              label="Confirmar senha"
              required
              type="password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Cadastrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta?{' '}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
