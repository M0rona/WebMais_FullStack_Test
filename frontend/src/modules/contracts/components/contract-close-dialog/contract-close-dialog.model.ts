import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { contractService } from '../../services/contract.service';

interface ContractCloseDialogProps {
  contractId: string;
}

export const useContractCloseDialogModel = ({ contractId }: ContractCloseDialogProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('contracts');

  const mutation = useMutation({
    mutationKey: ['contracts', 'close'],
    mutationFn: () => contractService.close(contractId),
    onSuccess: () => {
      toast.success(t('toasts.closed'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  return { onConfirm: () => mutation.mutate() };
};

export type ContractCloseDialogModel = ReturnType<typeof useContractCloseDialogModel>;
