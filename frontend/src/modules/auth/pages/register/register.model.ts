import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import { registerSchema, type RegisterFormData } from '@/modules/auth/schemas/register.schema';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/store/auth-store';

export const useRegisterModel = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: ({ name, email, password }: RegisterFormData) =>
      authService.register({ name, email, password }),
    onSuccess: (data) => {
      setAuth(data);
      navigate('/contracts');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { form, onSubmit, isSubmitting: mutation.isPending };
};

export type RegisterModel = ReturnType<typeof useRegisterModel>;
