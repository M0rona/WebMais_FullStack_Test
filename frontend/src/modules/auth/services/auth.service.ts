import { api } from '@/common/services/api.service';
import type { AuthResponse } from '@/common/types/auth-response.type';
import type { LoginFormData } from '@/modules/auth/schemas/login.schema';

export const authService = {
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
};
