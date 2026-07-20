import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CONTRACT_TYPE_LABELS } from '@/common/constants';
import ClientPickerDialog from '../client-picker-dialog';
import ContractItemList from '../contract-item-list';
import type { ContractFormDialogModel } from './contract-form-dialog.model';

type ContractFormDialogViewProps = ContractFormDialogModel & {
  trigger: ReactNode; // só o gatilho visual, não precisa passar pelo model
};

export const ContractFormDialogView = ({
  trigger,
  open,
  setOpen,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
}: ContractFormDialogViewProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar contrato' : 'Novo contrato'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="grid shrink-0 grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <ClientPickerDialog value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="shrink-0">
            <InputField
              label="Vencimento"
              required
              type="date"
              error={errors.dueDate?.message}
              {...register('dueDate')}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ContractItemList control={control} register={register} errors={errors.items} />
          </div>

          <DialogFooter className="shrink-0">
            <Button type="submit" loading={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
