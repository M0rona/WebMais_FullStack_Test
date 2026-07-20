import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { Contract } from '@/common/types/contract.type';
import { getErrorMessage } from '@/common/utils/error-handler';
import { contractSchema, type ContractFormData } from '@/modules/contracts/schemas/contract.schema';
import { contractService } from '../../services/contract.service';

interface ContractFormDialogProps {
  contract?: Contract;
}

export const useContractFormDialogModel = ({ contract }: ContractFormDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation('contracts');
  const isEditing = !!contract;

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      clientId: contract?.client?.id ?? '',
      type: contract?.type ?? 'SERVICE',
      dueDate: contract?.dueDate ? contract.dueDate.slice(0, 10) : '',
      items: contract?.items?.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitValue: item.unitValue,
      })) ?? [{ description: '', quantity: 1, unitValue: 0 }],
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['contracts'] });
  };

  // Fecha o dialog e limpa o form (valores E erros de validação). Precisa
  // rodar tanto ao fechar manualmente (X/overlay/Escape) quanto após salvar
  // com sucesso — sem isso, fechar o dialog depois de um Salvar com campos
  // vazios (validação client-side, sem chegar a chamar a mutation) deixa os
  // erros de formState.errors presos no form, que reaparecem ao reabrir.
  const closeAndReset = () => {
    setOpen(false);
    form.reset();
  };

  const onOpenChange = (next: boolean) => {
    if (next) {
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

      await contractService.update(contract.id, {
        clientId: data.clientId,
        type: data.type,
        dueDate,
      });

      const originalItemIds = new Set((contract.items ?? []).map((item) => item.id));
      const currentItemIds = new Set(data.items.map((item) => item.id).filter(Boolean));

      for (const originalId of originalItemIds) {
        if (!currentItemIds.has(originalId)) {
          await contractService.deleteItem(contract.id, originalId);
        }
      }

      for (const item of data.items) {
        const payload = {
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue,
        };
        if (item.id) {
          await contractService.updateItem(contract.id, item.id, payload);
        } else {
          await contractService.addItem(contract.id, payload);
        }
      }

      return contractService.findOne(contract.id);
    },
    onSuccess: () => {
      toast.success(isEditing ? t('toasts.updated') : t('toasts.created'));
      invalidate();
      closeAndReset();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = form.handleSubmit((data) => mutation.mutate(data));

  return { open, onOpenChange, form, onSubmit, isEditing, isSubmitting: mutation.isPending };
};

export type ContractFormDialogModel = ReturnType<typeof useContractFormDialogModel>;
