import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ContractStatus } from '@/common/types/contract.type';
import { cn } from '@/lib/utils';
import type { ContractSummaryCardsModel } from './contract-summary-cards.model';

const CARDS = [
  { key: 'draft', labelKey: 'summary.draft', status: 'DRAFT' },
  { key: 'active', labelKey: 'summary.active', status: 'ACTIVE' },
  { key: 'expired', labelKey: 'summary.expired', status: 'EXPIRED' },
  { key: 'closed', labelKey: 'summary.closed', status: 'CLOSED' },
] as const satisfies {
  key: keyof ContractSummaryCardsModel['summary'];
  labelKey: string;
  status: ContractStatus;
}[];

type ContractSummaryCardsViewProps = ContractSummaryCardsModel & {
  selectedStatus?: ContractStatus;
  onSelectStatus: (status: ContractStatus | undefined) => void;
};

export const ContractSummaryCardsView = ({
  summary,
  isLoading,
  selectedStatus,
  onSelectStatus,
}: ContractSummaryCardsViewProps) => {
  const { t } = useTranslation('contracts');

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARDS.map(({ key, labelKey, status }) => {
        const label = t(labelKey);
        const isActive = selectedStatus === status;
        return (
          <Card
            key={key}
            role="button"
            tabIndex={0}
            onClick={() => onSelectStatus(isActive ? undefined : status)}
            className={cn(
              'cursor-pointer transition-colors hover:border-primary',
              isActive && 'border-primary',
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <p className="text-2xl font-bold">{summary[key]}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
