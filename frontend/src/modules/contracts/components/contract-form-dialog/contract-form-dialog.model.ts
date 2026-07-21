import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Contract } from '@/common/types/contract.type';
import { contractSchema, type ContractFormData } from '@/modules/contracts/schemas/contract.schema';
import { contractService } from '../../services/contract.service';

interface ContractFormDialogProps {
  contract?: Contract;
}

function buildDefaultValues(contract?: Contract): ContractFormData {
  return {
    clientId: contract?.client?.id ?? '',
    type: contract?.type ?? 'SERVICE',
    dueDate: contract?.dueDate ? contract.dueDate.slice(0, 10) : '',
    items: contract?.items?.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitValue: item.unitValue,
    })) ?? [{ description: '', quantity: 1, unitValue: 0 }],
  };
}

export const useContractFormDialogModel = ({ contract }: ContractFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation('contracts');
  const isEditing = !!contract;

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: buildDefaultValues(contract),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['contracts'] });
  };

  const closeAndReset = () => {
    setOpen(false);
    form.reset();
  };

  const onOpenChange = (next: boolean) => {
    if (next) {
      form.reset(buildDefaultValues(contract));
      setOpen(true);
    } else {
      closeAndReset();
    }
  };

  const mutation = useMutation({
    mutationKey: ['contracts', isEditing ? 'update' : 'create'],
    mutationFn: async (data: ContractFormData) => {
      const dueDate = new Date(`${data.dueDate}T00:00:00`).toISOString();

      if (!isEditing) {
        return contractService.create({ ...data, dueDate });
      }

      return contractService.update(contract.id, {
        clientId: data.clientId,
        type: data.type,
        dueDate,
        items: data.items,
      });
    },
    onSuccess: () => {
      toast.success(isEditing ? t('toasts.updated') : t('toasts.created'));
      invalidate();
      closeAndReset();
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { open, onOpenChange, form, onSubmit, isEditing, isSubmitting: mutation.isPending };
};

export type ContractFormDialogModel = ReturnType<typeof useContractFormDialogModel>;
