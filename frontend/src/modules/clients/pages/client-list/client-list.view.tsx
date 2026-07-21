import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/common/components/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/shadcn/card';
import { Input } from '@/common/components/shadcn/input';
import { Skeleton } from '@/common/components/shadcn/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/shadcn/table';
import { formatDocument } from '@/common/utils/formatters';
import ClientDeleteDialog from '../../components/client-delete-dialog';
import ClientFormDialog from '../../components/client-form-dialog';
import type { ClientListModel } from './client-list.model';

export const ClientListView = ({
  clients,
  isLoading,
  search,
  page,
  totalPages,
  onSearchChange,
  onPageChange,
}: ClientListModel) => {
  const { t } = useTranslation('clients');
  const { t: tCommon } = useTranslation('common');

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t('list.title')}</h1>
        <ClientFormDialog trigger={<Button>{t('list.newClient')}</Button>} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('list.registered')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('list.searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('list.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('list.columns.name')}</TableHead>
                  <TableHead>{t('list.columns.document')}</TableHead>
                  <TableHead className="text-right">{tCommon('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{formatDocument(client.document)}</TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <ClientFormDialog
                        client={client}
                        trigger={
                          <Button variant="outline" size="sm">
                            {tCommon('actions.edit')}
                          </Button>
                        }
                      />
                      <ClientDeleteDialog
                        clientId={client.id}
                        trigger={
                          <Button variant="destructive" size="sm">
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
