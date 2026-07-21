import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/modules/auth/services/auth.service';
import { useAuthStore } from '@/store/auth-store';
import type { LoginFormData } from '@/modules/auth/schemas/login.schema';

export const useAuth = () => {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: (data: LoginFormData) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data);
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
