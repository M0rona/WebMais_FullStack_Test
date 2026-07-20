import { Button } from '@/common/components/ui/button';
import type { HeaderModel } from './header.model';

export const HeaderView = ({ userName, onLogout }: HeaderModel) => {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <span className="font-semibold">WebMais — Gestão de Contratos</span>
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
