import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ContractStatus } from '@/common/types/contract.type';
import { getErrorMessage } from '@/common/utils/error-handler';
import { contractService } from '../../services/contract.service';

export const useContractListModel = () => {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', { status: statusFilter }],
    queryFn: () => contractService.findAll({ status: statusFilter, limit: 50 }),
  });

  const approveMutation = useMutation({
    mutationKey: ['contracts', 'approve'],
    mutationFn: (id: string) => contractService.approve(id),
    onSuccess: () => {
      toast.success('Contrato aprovado');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  return {
    contracts: data?.data ?? [],
    isLoading,
    statusFilter,
    onFilterChange: setStatusFilter,
    onApprove: (id: string) => approveMutation.mutate(id),
  };
};

export type ContractListModel = ReturnType<typeof useContractListModel>;
