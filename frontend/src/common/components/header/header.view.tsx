import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HeaderModel } from './header.model';

const NAV_ITEMS = [
  { to: '/contracts', label: 'Contratos' },
  { to: '/clients', label: 'Clientes' },
];

export const HeaderView = ({ userName, onLogout }: HeaderModel) => {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold">WebMais — Gestão de Contratos</span>
          <nav className="flex items-center gap-4">
            {NAV_ITEMS.map(({ to, label }) => (
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
          <span className="text-sm text-muted-foreground">{userName}</span>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};
