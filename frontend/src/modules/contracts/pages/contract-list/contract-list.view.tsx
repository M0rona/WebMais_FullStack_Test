import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/common/utils/formatters';
import ContractCloseDialog from '../../components/contract-close-dialog';
import ContractDeleteDialog from '../../components/contract-delete-dialog';
import ContractFormDialog from '../../components/contract-form-dialog';
import ContractSummaryCards from '../../components/contract-summary-cards';
import { ContractStatusBadge } from '../../components/contract-status-badge';
import { ContractTypeBadge } from '../../components/contract-type-badge';
import type { ContractListModel } from './contract-list.model';

export const ContractListView = ({
  contracts,
  isLoading,
  statusFilter,
  onFilterChange,
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
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
