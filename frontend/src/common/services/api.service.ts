import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import i18next from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth-store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register'];

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Accept-Language'] = i18next.language;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => error.config?.url?.includes(path));

    if (error.response?.status === 401 && !isPublicAuthRequest) {
      useAuthStore.getState().clearAuth();
      queryClient.clear();
      toast.error(i18next.t('common:errors.sessionExpired'));
      window.location.href = '/login';
      return Promise.reject(error);
    }

    toast.error(getErrorMessage(error));
    return Promise.reject(error);
  },
);
