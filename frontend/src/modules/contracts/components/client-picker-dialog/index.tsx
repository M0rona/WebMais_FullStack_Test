import { useClientPickerDialogModel } from './client-picker-dialog.model';
import { ClientPickerDialogView } from './client-picker-dialog.view';

interface ClientPickerDialogProps {
  value?: string;
  onChange: (clientId: string) => void;
}

const ClientPickerDialog = (props: ClientPickerDialogProps) => {
  const model = useClientPickerDialogModel(props);
  return <ClientPickerDialogView {...model} />;
};

export default ClientPickerDialog;
