import type { ReactNode } from 'react';
import { useClientDeleteDialogModel } from './client-delete-dialog.model';
import { ClientDeleteDialogView } from './client-delete-dialog.view';

interface ClientDeleteDialogProps {
  clientId: string;
  trigger: ReactNode;
}

const ClientDeleteDialog = ({ clientId, trigger }: ClientDeleteDialogProps) => {
  const model = useClientDeleteDialogModel({ clientId });
  return <ClientDeleteDialogView {...model} trigger={trigger} />;
};

export default ClientDeleteDialog;
