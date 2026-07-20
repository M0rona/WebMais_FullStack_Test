import type { ReactNode } from 'react';
import type { Client } from '@/common/types/client.type';
import { useClientFormDialogModel } from './client-form-dialog.model';
import { ClientFormDialogView } from './client-form-dialog.view';

interface ClientFormDialogProps {
  client?: Client;
  trigger: ReactNode;
}

const ClientFormDialog = ({ client, trigger }: ClientFormDialogProps) => {
  const model = useClientFormDialogModel({ client });
  return <ClientFormDialogView {...model} trigger={trigger} />;
};

export default ClientFormDialog;
