import type { User } from '@/common/types/user.type';

export interface AuthResponse {
  accessToken: string;
  user: User;
}
