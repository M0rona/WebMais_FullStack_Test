import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Header from '@/common/components/header';
import { ProtectedRoute } from '@/common/components/protected-route';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/modules/auth/pages/login';
import ClientList from '@/modules/clients/pages/client-list';
import ContractList from '@/modules/contracts/pages/contract-list';

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-muted/10">
    <Header />
    <main>{children}</main>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/contracts"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ContractList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ClientList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/contracts" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
