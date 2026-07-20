import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/common/hooks/use-auth';

export const useHeaderModel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const onLanguageChange = (language: string) => {
    void i18n.changeLanguage(language);
  };

  return { userName: user?.name, onLogout, language: i18n.language, onLanguageChange };
};

export type HeaderModel = ReturnType<typeof useHeaderModel>;
