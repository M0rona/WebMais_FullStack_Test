import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import type { ContractStatus, ContractType } from '@/common/types/contract.type';
import { getErrorMessage } from '@/common/utils/error-handler';
import { contractService } from '../../services/contract.service';

const PAGE_LIMIT = 10;

export const useContractListModel = () => {
  const [statusFilter, setStatusFilter] = useState<ContractStatus | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<ContractType | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contracts', { status: statusFilter, type: typeFilter, search, page }],
    queryFn: () =>
      contractService.findAll({
        status: statusFilter,
        type: typeFilter,
        search: search.trim() || undefined,
        page,
        limit: PAGE_LIMIT,
      }),
  });

  const onFilterChange = (status: ContractStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  };

  const onTypeFilterChange = (type: ContractType | undefined) => {
    setTypeFilter(type);
    setPage(1);
  };

  const onSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
    typeFilter,
    search,
    page,
    totalPages: data?.totalPages ?? 1,
    onFilterChange,
    onTypeFilterChange,
    onSearchChange,
    onPageChange: setPage,
    onApprove: (id: string) => approveMutation.mutate(id),
  };
};

export type ContractListModel = ReturnType<typeof useContractListModel>;
