import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/common/hooks/use-auth';
import { loginSchema, type LoginFormData } from '@/modules/auth/schemas/login.schema';

export const useLoginModel = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await login(data);
      navigate('/contracts');
    } catch {
      // noop
    }
  });

  return { form, onSubmit, isLoggingIn };
};

export type LoginModel = ReturnType<typeof useLoginModel>;
