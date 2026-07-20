import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import { contractService } from '../../services/contract.service';

interface ContractCloseDialogProps {
  contractId: string;
}

export const useContractCloseDialogModel = ({ contractId }: ContractCloseDialogProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['contracts', 'close'],
    mutationFn: () => contractService.close(contractId),
    onSuccess: () => {
      toast.success('Contrato encerrado');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  return { onConfirm: () => mutation.mutate() };
};

export type ContractCloseDialogModel = ReturnType<typeof useContractCloseDialogModel>;
