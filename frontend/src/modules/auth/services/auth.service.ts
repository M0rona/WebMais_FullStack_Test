import { HttpService } from '@/common/services/http.service';
import type { AuthResponse } from '@/common/types/auth-response.type';
import type { LoginFormData } from '@/modules/auth/schemas/login.schema';

class AuthService extends HttpService {
  login(data: LoginFormData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', data);
  }
}

export const authService = new AuthService();
