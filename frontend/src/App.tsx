import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import i18next from '@/lib/i18n';
import { AppRoutes } from '@/routes/app-routes';

const queryClient = new QueryClient();

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
