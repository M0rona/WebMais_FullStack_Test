import { useQuery } from '@tanstack/react-query';
import { contractService } from '../../services/contract.service';

export const useContractSummaryCardsModel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['contracts', 'summary'],
    queryFn: contractService.summary,
  });

  return {
    summary: data ?? { draft: 0, active: 0, expired: 0, closed: 0 },
    isLoading,
  };
};

export type ContractSummaryCardsModel = ReturnType<typeof useContractSummaryCardsModel>;
