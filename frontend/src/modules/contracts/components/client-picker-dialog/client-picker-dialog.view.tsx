import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/common/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/components/shadcn/dialog';
import { Input } from '@/common/components/shadcn/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/common/components/shadcn/table';
import { formatDocument } from '@/common/utils/formatters';
import type { ClientPickerDialogModel } from './client-picker-dialog.model';

export const ClientPickerDialogView = ({
  open,
  onOpenChange,
  search,
  setSearch,
  filteredClients,
  isLoading,
  selectedClient,
  onSelect,
}: ClientPickerDialogModel) => {
  const { t } = useTranslation('contracts');
  const { t: tCommon } = useTranslation('common');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start font-normal">
          {selectedClient ? selectedClient.name : t('clientPicker.placeholder')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('clientPicker.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('clientPicker.searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-[50vh] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('clientPicker.columns.name')}</TableHead>
                  <TableHead>{t('clientPicker.columns.document')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                      {tCommon('table.loading')}
                    </TableCell>
                  </TableRow>
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-sm text-muted-foreground">
                      {t('clientPicker.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow
                      key={client.id}
                      className="cursor-pointer"
                      onClick={() => onSelect(client.id)}
                    >
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{formatDocument(client.document)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
