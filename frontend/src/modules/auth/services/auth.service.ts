import { HttpService } from '@/common/services/http.service';
import type { AuthResponse } from '@/common/types/auth-response.type';
import type { LoginFormData } from '@/modules/auth/schemas/login.schema';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

class AuthService extends HttpService {
  login(data: LoginFormData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/login', data);
  }

  register(data: RegisterData): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/register', data);
  }
}

export const authService = new AuthService();
