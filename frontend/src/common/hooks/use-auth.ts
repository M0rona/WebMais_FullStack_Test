import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import { getErrorMessage } from '@/common/utils/error-handler';
import type { LoginFormData } from '@/modules/auth/schemas/login.schema';

export const useAuth = () => {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const logout = () => {
    clearAuth();
    queryClient.clear();
  };

  return {
    user,
    isAuthenticated: !!token,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
};
