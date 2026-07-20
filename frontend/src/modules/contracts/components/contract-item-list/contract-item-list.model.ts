import { useFieldArray, useWatch, type Control } from 'react-hook-form';
import type { ContractFormData } from '@/modules/contracts/schemas/contract.schema';

interface ContractItemListProps {
  control: Control<ContractFormData>;
}

export const useContractItemListModel = ({ control }: ContractItemListProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' }) ?? [];

  const total = watchedItems.reduce(
    (sum, item) => sum + (Number(item?.quantity) || 0) * (Number(item?.unitValue) || 0),
    0,
  );

  const onAddItem = () => append({ description: '', quantity: 1, unitValue: 0 });

  return { fields, watchedItems, total, onAddItem, onRemoveItem: remove };
};

export type ContractItemListModel = ReturnType<typeof useContractItemListModel>;
