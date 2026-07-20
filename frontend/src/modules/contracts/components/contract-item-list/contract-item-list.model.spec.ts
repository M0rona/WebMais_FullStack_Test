import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import type { ContractFormData } from '@/common/utils/validations';
import { useContractItemListModel } from './contract-item-list.model';

function setup(items: ContractFormData['items']) {
  return renderHook(() => {
    const { control } = useForm<ContractFormData>({
      defaultValues: { clientId: '', type: 'SERVICE', dueDate: '', items },
    });
    return useContractItemListModel({ control });
  });
}

describe('useContractItemListModel', () => {
  it('calcula o total como soma de quantidade * valor unitário dos itens', () => {
    const { result } = setup([
      { description: 'Item 1', quantity: 2, unitValue: 100 },
      { description: 'Item 2', quantity: 1, unitValue: 50 },
    ]);

    expect(result.current.total).toBe(250);
  });

  it('adiciona um novo item à lista', () => {
    const { result } = setup([{ description: 'Item 1', quantity: 1, unitValue: 10 }]);

    act(() => {
      result.current.onAddItem();
    });

    expect(result.current.fields).toHaveLength(2);
  });

  it('remove um item pelo índice', () => {
    const { result } = setup([
      { description: 'Item 1', quantity: 1, unitValue: 10 },
      { description: 'Item 2', quantity: 1, unitValue: 20 },
    ]);

    act(() => {
      result.current.onRemoveItem(0);
    });

    expect(result.current.fields).toHaveLength(1);
  });
});
