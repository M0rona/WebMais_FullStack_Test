import { Badge } from '@/common/components/ui/badge';
import { CONTRACT_TYPE_LABELS } from '@/common/constants';
import type { ContractType } from '@/common/types';

export const ContractTypeBadge = ({ type }: { type: ContractType }) => (
  <Badge variant="outline">{CONTRACT_TYPE_LABELS[type]}</Badge>
);
