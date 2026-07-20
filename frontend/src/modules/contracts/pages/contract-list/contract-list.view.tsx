import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/common/components/ui/alert-dialog';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Skeleton } from '@/common/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/ui/table';
import { formatCurrency, formatDate } from '@/common/utils/formatters';
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
  onClose,
  onDelete,
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="secondary">
                              Encerrar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Encerrar contrato?</AlertDialogTitle>
                              <AlertDialogDescription>
                                O contrato {contract.number} será marcado como encerrado. Essa ação não
                                pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onClose(contract.id)}>
                                Encerrar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir contrato?</AlertDialogTitle>
                            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(contract.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
