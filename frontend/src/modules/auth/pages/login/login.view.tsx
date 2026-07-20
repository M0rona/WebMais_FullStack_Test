import { Link } from 'react-router-dom';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LoginModel } from './login.model';

export const LoginView = ({ form, onSubmit, isLoggingIn }: LoginModel) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>WebMais</CardTitle>
          <CardDescription>Gestão de Contratos — entre com sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
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
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={isLoggingIn}>
              Entrar
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem conta?{' '}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
