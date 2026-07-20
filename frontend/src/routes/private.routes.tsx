import { Route } from 'react-router-dom';
import { AppLayout } from '@/common/components/layout/app-layout';
import { ProtectedRoute } from '@/common/components/protected-route';
import ClientList from '@/modules/clients/pages/client-list';
import ContractList from '@/modules/contracts/pages/contract-list';

export const PrivateRoutes = () => (
  <>
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
  </>
);
