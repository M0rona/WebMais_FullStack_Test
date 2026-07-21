import { QueryClient } from '@tanstack/react-query';

// Singleton compartilhado entre o provider da árvore React (App.tsx) e
// código fora de componentes (interceptor de 401 em api.service.ts) — sem
// isso, o interceptor não teria como chamar queryClient.clear() e o cache
// do TanStack Query ficaria vivo depois do redirect de sessão expirada,
// diferente do logout manual (use-auth.ts), que já limpa o cache.
export const queryClient = new QueryClient();
