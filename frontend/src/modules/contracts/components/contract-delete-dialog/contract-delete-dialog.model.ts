import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/common/utils/error-handler';
import { contractService } from '../../services/contract.service';

interface ContractDeleteDialogProps {
  contractId: string;
}

export const useContractDeleteDialogModel = ({ contractId }: ContractDeleteDialogProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: ['contracts', 'delete'],
    mutationFn: () => contractService.delete(contractId),
    onSuccess: () => {
      toast.success('Contrato excluído');
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

export type ContractDeleteDialogModel = ReturnType<typeof useContractDeleteDialogModel>;
