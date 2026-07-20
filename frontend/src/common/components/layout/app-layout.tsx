import type { ReactNode } from 'react';
import Header from '@/common/components/header';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => (
  <div className="min-h-screen bg-muted/10">
    <Header />
    <main>{children}</main>
  </div>
);
