import { useTranslation } from 'react-i18next';
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
import { formatDocument } from '@/common/utils/formatters';
import ClientDeleteDialog from '../../components/client-delete-dialog';
import ClientFormDialog from '../../components/client-form-dialog';
import type { ClientListModel } from './client-list.model';

export const ClientListView = ({ clients, isLoading }: ClientListModel) => {
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
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
