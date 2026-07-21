import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import { translateError } from '@/common/utils/translate-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/shadcn/card';
import type { RegisterModel } from './register.model';

export const RegisterView = ({ form, onSubmit, isSubmitting }: RegisterModel) => {
  const { t } = useTranslation('auth');
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t('register.title')}</CardTitle>
          <CardDescription>{t('register.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              label={t('register.name')}
              required
              autoComplete="name"
              error={translateError(t, errors.name?.message)}
              {...register('name')}
            />
            <InputField
              label={t('register.email')}
              required
              type="email"
              autoComplete="username"
              error={translateError(t, errors.email?.message)}
              {...register('email')}
            />
            <InputField
              label={t('register.password')}
              required
              type="password"
              autoComplete="new-password"
              error={translateError(t, errors.password?.message)}
              {...register('password')}
            />
            <InputField
              label={t('register.confirmPassword')}
              required
              type="password"
              autoComplete="new-password"
              error={translateError(t, errors.confirmPassword?.message)}
              {...register('confirmPassword')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              {t('register.submit')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('register.haveAccount')}{' '}
              <Link to="/login" className="text-primary underline-offset-4 hover:underline">
                {t('register.signIn')}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
