import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from '@/common/components/button';
import InputField from '@/common/components/input-field';
import { translateError } from '@/common/utils/translate-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/shadcn/card';
import type { LoginModel } from './login.model';

export const LoginView = ({ form, onSubmit, isLoggingIn }: LoginModel) => {
  const { t } = useTranslation('auth');
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              label={t('login.email')}
              required
              type="email"
              autoComplete="username"
              error={translateError(t, errors.email?.message)}
              {...register('email')}
            />
            <InputField
              label={t('login.password')}
              required
              type="password"
              autoComplete="current-password"
              error={translateError(t, errors.password?.message)}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={isLoggingIn}>
              {t('login.submit')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('login.noAccount')}{' '}
              <Link to="/register" className="text-primary underline-offset-4 hover:underline">
                {t('login.signUp')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
