import { Badge } from '@/common/components/ui/badge';
import { CONTRACT_STATUS_LABELS } from '@/common/constants';
import type { ContractStatus } from '@/common/types';

const STATUS_VARIANT: Record<ContractStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'outline',
  ACTIVE: 'default',
  EXPIRED: 'destructive',
  CLOSED: 'secondary',
};

export const ContractStatusBadge = ({ status }: { status: ContractStatus }) => (
  <Badge variant={STATUS_VARIANT[status]}>{CONTRACT_STATUS_LABELS[status]}</Badge>
);
