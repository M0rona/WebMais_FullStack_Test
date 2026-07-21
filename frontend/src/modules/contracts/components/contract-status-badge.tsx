import { Badge } from '@/common/components/shadcn/badge';
import type { ContractStatus } from '@/common/types/contract.type';
import { useContractStatusLabels } from '@/modules/contracts/hooks/use-contract-labels';

const STATUS_VARIANT: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  ACTIVE: 'default',
  EXPIRED: 'destructive',
  CLOSED: 'secondary',
};

export const ContractStatusBadge = ({ status }: { status: ContractStatus }) => {
  const labels = useContractStatusLabels();
  return <Badge variant={STATUS_VARIANT[status]}>{labels[status]}</Badge>;
};
