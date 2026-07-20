import { api } from '@/common/services/api.service';
import type { AuthResponse } from '@/common/types';
import type { LoginFormData } from '@/common/utils/validations';

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
