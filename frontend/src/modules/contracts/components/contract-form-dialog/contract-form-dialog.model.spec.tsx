import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Contract } from '@/common/types/contract.type';
import { contractService } from '../../services/contract.service';
import { useContractFormDialogModel } from './contract-form-dialog.model';

vi.mock('../../services/contract.service', () => ({
  contractService: {
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

const contract: Contract = {
  id: 'contract-1',
  number: 'CTR-0001',
  type: 'SERVICE',
  value: 300,
  dueDate: '2099-01-01T00:00:00.000Z',
  status: 'ACTIVE',
  closedAt: null,
  createdAt: '',
  updatedAt: '',
  client: { id: 'client-1', name: 'Cliente', document: '11444777000161' },
  items: [
    { id: 'item-1', description: 'Consultoria', quantity: 1, unitValue: 300, subtotal: 300 },
    { id: 'item-2', description: 'Suporte', quantity: 2, unitValue: 100, subtotal: 200 },
  ],
};

const expectedIsoDueDate = new Date('2099-01-01T00:00:00').toISOString();

describe('useContractFormDialogModel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cria um contrato novo chamando apenas contractService.create', async () => {
    vi.mocked(contractService.create).mockResolvedValue({ ...contract, items: [] });

    const { result } = renderHook(() => useContractFormDialogModel({}), { wrapper });

    act(() => {
      result.current.form.setValue('clientId', 'client-1');
      result.current.form.setValue('dueDate', '2099-01-01');
      result.current.form.setValue('items', [{ description: 'Item', quantity: 1, unitValue: 100 }]);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(contractService.create).toHaveBeenCalledWith({
        clientId: 'client-1',
        type: 'SERVICE',
        dueDate: expectedIsoDueDate,
        items: [{ description: 'Item', quantity: 1, unitValue: 100 }],
      });
    });
    expect(contractService.update).not.toHaveBeenCalled();
  });

  // Cobre o fix da revisão de frontend: editar um contrato com itens
  // adicionados, editados e removidos ao mesmo tempo precisa virar uma
  // única chamada a contractService.update (payload composto), não mais um
  // loop de deleteItem/updateItem/addItem por item alterado.
  it('edita contrato + itens (add/editar/remover) numa única chamada a update', async () => {
    vi.mocked(contractService.update).mockResolvedValue(contract);

    const { result } = renderHook(() => useContractFormDialogModel({ contract }), { wrapper });

    act(() => {
      result.current.form.setValue('items', [
        { id: 'item-1', description: 'Consultoria (revisada)', quantity: 2, unitValue: 150 },
        { description: 'Item novo', quantity: 1, unitValue: 50 },
      ]);
    });

    await act(async () => {
      await result.current.onSubmit();
    });

    await waitFor(() => {
      expect(contractService.update).toHaveBeenCalledTimes(1);
    });
    expect(contractService.update).toHaveBeenCalledWith('contract-1', {
      clientId: 'client-1',
      type: 'SERVICE',
      dueDate: expectedIsoDueDate,
      items: [
        { id: 'item-1', description: 'Consultoria (revisada)', quantity: 2, unitValue: 150 },
        { description: 'Item novo', quantity: 1, unitValue: 50 },
      ],
    });
    expect(contractService.create).not.toHaveBeenCalled();
  });
});
