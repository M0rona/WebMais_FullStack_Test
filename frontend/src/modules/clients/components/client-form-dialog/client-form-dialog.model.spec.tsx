import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clientService } from '../../services/client.service';
import { useClientFormDialogModel } from './client-form-dialog.model';

vi.mock('../../services/client.service', () => ({
  clientService: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useClientFormDialogModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cria um cliente novo quando não recebe client', async () => {
    vi.mocked(clientService.create).mockResolvedValue({
      id: '1',
      name: 'Acme',
      document: '11444777000161',
      createdAt: '',
      updatedAt: '',
    });

    const { result } = renderHook(() => useClientFormDialogModel({}), { wrapper });

    act(() => {
      result.current.form.setValue('name', 'Acme');
      result.current.form.setValue('document', '11444777000161');
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(clientService.create).toHaveBeenCalledWith({ name: 'Acme', document: '11444777000161' });
    });
    expect(clientService.update).not.toHaveBeenCalled();
  });

  it('atualiza um cliente existente quando recebe client', async () => {
    const client = {
      id: '2',
      name: 'Old Name',
      document: '11444777000161',
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(clientService.update).mockResolvedValue(client);

    const { result } = renderHook(() => useClientFormDialogModel({ client }), { wrapper });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(clientService.update).toHaveBeenCalledWith('2', {
        name: 'Old Name',
        document: '11444777000161',
      });
    });
    expect(clientService.create).not.toHaveBeenCalled();
  });
});
