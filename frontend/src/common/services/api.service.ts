import axios, { type AxiosError } from 'axios';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import i18next from '@/i18n';
import { useAuthStore } from '@/store/auth-store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

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
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      toast.error(i18next.t('common:errors.sessionExpired'));
      window.location.href = '/login';
      return Promise.reject(error);
    }

    toast.error(getErrorMessage(error));
    return Promise.reject(error);
  },
);
