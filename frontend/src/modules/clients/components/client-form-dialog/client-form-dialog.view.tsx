import type { ReactNode } from 'react';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ClientFormDialogModel } from './client-form-dialog.model';

type ClientFormDialogViewProps = ClientFormDialogModel & {
  trigger: ReactNode; // só o gatilho visual, não precisa passar pelo model
};

export const ClientFormDialogView = ({
  trigger,
  open,
  setOpen,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
}: ClientFormDialogViewProps) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar cliente' : 'Novo cliente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <InputField label="Nome" required error={errors.name?.message} {...register('name')} />
          <InputField
            label="CPF/CNPJ"
            required
            placeholder="Somente números"
            error={errors.document?.message}
            {...register('document')}
          />
          <DialogFooter>
            <Button type="submit" loading={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
