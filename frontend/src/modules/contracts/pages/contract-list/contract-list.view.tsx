import { Search } from 'lucide-react';
import { Button } from '@/common/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CONTRACT_STATUS_LABELS, CONTRACT_TYPE_LABELS } from '@/common/constants';
import type { ContractStatus, ContractType } from '@/common/types/contract.type';
import { formatCurrency, formatDate } from '@/common/utils/formatters';
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
  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contratos</h1>
        <ContractFormDialog trigger={<Button>Novo contrato</Button>} />
      </div>

      <ContractSummaryCards selectedStatus={statusFilter} onSelectStatus={onFilterChange} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de contratos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número do contrato ou cliente"
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={STATUS_FILTER_VALUE}>Todos os status</SelectItem>
                {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
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
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TYPE_FILTER_VALUE}>Todos os tipos</SelectItem>
                {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
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
            <p className="text-sm text-muted-foreground">Nenhum contrato encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                              Editar
                            </Button>
                          }
                        />
                      )}

                      {contract.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => onApprove(contract.id)}>
                          Aprovar
                        </Button>
                      )}

                      {(contract.status === 'ACTIVE' || contract.status === 'EXPIRED') && (
                        <ContractCloseDialog
                          contractId={contract.id}
                          contractNumber={contract.number}
                          trigger={
                            <Button size="sm" variant="secondary">
                              Encerrar
                            </Button>
                          }
                        />
                      )}

                      <ContractDeleteDialog
                        contractId={contract.id}
                        trigger={
                          <Button size="sm" variant="destructive">
                            Excluir
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
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
