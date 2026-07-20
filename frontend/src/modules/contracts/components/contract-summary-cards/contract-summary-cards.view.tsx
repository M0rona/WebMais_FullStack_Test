import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import type { ContractStatus } from '@/common/types';
import { cn } from '@/lib/utils';
import type { ContractSummaryCardsModel } from './contract-summary-cards.model';

const CARDS = [
  { key: 'draft', label: 'Rascunho', status: 'DRAFT' },
  { key: 'active', label: 'Ativos', status: 'ACTIVE' },
  { key: 'expired', label: 'Vencidos', status: 'EXPIRED' },
  { key: 'closed', label: 'Encerrados', status: 'CLOSED' },
] as const satisfies { key: keyof ContractSummaryCardsModel['summary']; label: string; status: ContractStatus }[];

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
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CARDS.map(({ key, label, status }) => {
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
