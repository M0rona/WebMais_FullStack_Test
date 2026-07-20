import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/common/hooks/use-auth';

export const useHeaderModel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return { userName: user?.name, onLogout };
};

export type HeaderModel = ReturnType<typeof useHeaderModel>;
