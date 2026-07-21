import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/common/components/shadcn/sonner';
import i18next from '@/lib/i18n';
import { queryClient } from '@/lib/query-client';
import { AppRoutes } from '@/routes/app-routes';

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster closeButton />
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;
