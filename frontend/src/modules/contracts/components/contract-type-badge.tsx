import { Badge } from '@/common/components/shadcn/badge';
import type { ContractType } from '@/common/types/contract.type';
import { useContractTypeLabels } from '@/modules/contracts/hooks/use-contract-labels';

export const ContractTypeBadge = ({ type }: { type: ContractType }) => {
  const labels = useContractTypeLabels();
  return <Badge variant="outline">{labels[type]}</Badge>;
};
