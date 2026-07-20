import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/common/components/button';
import { InputField } from '@/common/components/input-field';
import { translateError } from '@/common/utils/translate-error';
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
import { useContractTypeLabels } from '../../hooks/use-contract-labels';
import ClientPickerDialog from '../client-picker-dialog';
import ContractItemList from '../contract-item-list';
import type { ContractFormDialogModel } from './contract-form-dialog.model';

type ContractFormDialogViewProps = ContractFormDialogModel & {
  trigger: ReactNode; // só o gatilho visual, não precisa passar pelo model
};

export const ContractFormDialogView = ({
  trigger,
  open,
  onOpenChange,
  form,
  onSubmit,
  isEditing,
  isSubmitting,
}: ContractFormDialogViewProps) => {
  const { t } = useTranslation('contracts');
  const { t: tCommon } = useTranslation('common');
  const typeLabels = useContractTypeLabels();
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.editTitle') : t('form.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="grid shrink-0 grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('form.client')}</Label>
              <Controller
                control={control}
                name="clientId"
                render={({ field }) => (
                  <ClientPickerDialog value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.clientId && (
                <p className="text-sm text-destructive">
                  {translateError(t, errors.clientId.message)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('form.type')}</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([value, label]) => (
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
              label={t('form.dueDate')}
              required
              type="date"
              error={translateError(t, errors.dueDate?.message)}
              {...register('dueDate')}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ContractItemList control={control} register={register} errors={errors.items} />
          </div>

          <DialogFooter className="shrink-0">
            <Button type="submit" loading={isSubmitting}>
              {tCommon('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
