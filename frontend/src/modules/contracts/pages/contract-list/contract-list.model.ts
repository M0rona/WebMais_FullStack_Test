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

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['contracts'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => contractService.approve(id),
    onSuccess: () => {
      toast.success('Contrato aprovado');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const closeMutation = useMutation({
    mutationFn: (id: string) => contractService.close(id),
    onSuccess: () => {
      toast.success('Contrato encerrado');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractService.delete(id),
    onSuccess: () => {
      toast.success('Contrato excluído');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return {
    contracts: data?.data ?? [],
    isLoading,
    statusFilter,
    onFilterChange: setStatusFilter,
    onApprove: (id: string) => approveMutation.mutate(id),
    onClose: (id: string) => closeMutation.mutate(id),
    onDelete: (id: string) => deleteMutation.mutate(id),
  };
};

export type ContractListModel = ReturnType<typeof useContractListModel>;
