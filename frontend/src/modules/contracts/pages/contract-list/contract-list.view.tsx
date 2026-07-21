import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/common/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/shadcn/card';
import { Input } from '@/common/components/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/shadcn/select';
import { Skeleton } from '@/common/components/shadcn/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/shadcn/table';
import type { ContractStatus, ContractType } from '@/common/types/contract.type';
import { formatCurrency, formatDate } from '@/common/utils/formatters';
import { useContractStatusLabels, useContractTypeLabels } from '../../hooks/use-contract-labels';
import ContractCloseDialog from '../../components/contract-close-dialog';
import ContractDeleteDialog from '../../components/contract-delete-dialog';
import ContractFormDialog from '../../components/contract-form-dialog';
import ContractSummaryCards from '../../components/contract-summary-cards';
import { ContractStatusBadge } from '../../components/contract-status-badge';
import { ContractTypeBadge } from '../../components/contract-type-badge';
import type { ContractListModel } from './contract-list.model';

const STATUS_FILTER_VALUE = 'ALL';
const TYPE_FILTER_VALUE = 'ALL';

export const ContractListView = ({
  contracts,
  isLoading,
  statusFilter,
  typeFilter,
  search,
  page,
  totalPages,
  onFilterChange,
  onTypeFilterChange,
  onSearchChange,
  onPageChange,
  onApprove,
}: ContractListModel) => {
  const { t } = useTranslation('contracts');
  const { t: tCommon } = useTranslation('common');
  const statusLabels = useContractStatusLabels();
  const typeLabels = useContractTypeLabels();

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('list.title')}</h1>
        <ContractFormDialog trigger={<Button>{t('list.newContract')}</Button>} />
      </div>

      <ContractSummaryCards selectedStatus={statusFilter} onSelectStatus={onFilterChange} />

      <Card>
        <CardHeader>
          <CardTitle>{t('list.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('list.searchPlaceholder')}
                className="pl-8"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>

            <Select
              value={statusFilter ?? STATUS_FILTER_VALUE}
              onValueChange={(value) =>
                onFilterChange(value === STATUS_FILTER_VALUE ? undefined : (value as ContractStatus))
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={t('list.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STATUS_FILTER_VALUE}>{t('list.allStatuses')}</SelectItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={typeFilter ?? TYPE_FILTER_VALUE}
              onValueChange={(value) =>
                onTypeFilterChange(value === TYPE_FILTER_VALUE ? undefined : (value as ContractType))
              }
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder={t('list.typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TYPE_FILTER_VALUE}>{t('list.allTypes')}</SelectItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('list.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('list.columns.number')}</TableHead>
                  <TableHead>{t('list.columns.client')}</TableHead>
                  <TableHead>{t('list.columns.type')}</TableHead>
                  <TableHead>{t('list.columns.value')}</TableHead>
                  <TableHead>{t('list.columns.dueDate')}</TableHead>
                  <TableHead>{t('list.columns.status')}</TableHead>
                  <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.number}</TableCell>
                    <TableCell>{contract.client?.name}</TableCell>
                    <TableCell>
                      <ContractTypeBadge type={contract.type} />
                    </TableCell>
                    <TableCell>{formatCurrency(contract.value)}</TableCell>
                    <TableCell>{formatDate(contract.dueDate)}</TableCell>
                    <TableCell>
                      <ContractStatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell className="flex flex-wrap justify-end gap-2">
                      {contract.status !== 'CLOSED' && (
                        <ContractFormDialog
                          contract={contract}
                          trigger={
                            <Button variant="outline" size="sm">
                              {tCommon('actions.edit')}
                            </Button>
                          }
                        />
                      )}

                      {contract.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => onApprove(contract.id)}>
                          {t('list.actions.approve')}
                        </Button>
                      )}

                      {(contract.status === 'ACTIVE' || contract.status === 'EXPIRED') && (
                        <ContractCloseDialog
                          contractId={contract.id}
                          contractNumber={contract.number}
                          trigger={
                            <Button size="sm" variant="secondary">
                              {t('list.actions.close')}
                            </Button>
                          }
                        />
                      )}

                      <ContractDeleteDialog
                        contractId={contract.id}
                        trigger={
                          <Button size="sm" variant="destructive">
                            {tCommon('actions.delete')}
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                {tCommon('actions.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {tCommon('table.pageOf', { page, totalPages })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                {tCommon('actions.next')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
