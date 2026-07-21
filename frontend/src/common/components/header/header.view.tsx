import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { Button } from '@/common/components/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/shadcn/select';
import { cn } from '@/lib/utils';
import type { HeaderModel } from './header.model';

const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const;

export const HeaderView = ({ userName, onLogout, language, onLanguageChange }: HeaderModel) => {
  const { t } = useTranslation();

  const navItems = [
    { to: '/contracts', label: t('nav.contracts') },
    { to: '/clients', label: t('nav.clients') },
  ];

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold">{t('appTitle')}</span>
          <nav className="flex items-center gap-4">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                    isActive && 'text-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[130px]" aria-label={t('language.label')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {t(`language.${lang}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">{userName}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            {t('actions.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
};
