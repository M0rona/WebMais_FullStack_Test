import type { ReactNode } from 'react';
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
  const { t } = useTranslation('clients');
  const { t: tCommon } = useTranslation('common');
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? t('form.editTitle') : t('form.newTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <InputField
            label={t('form.name')}
            required
            error={translateError(t, errors.name?.message)}
            {...register('name')}
          />
          <InputField
            label={t('form.document')}
            required
            placeholder={t('form.documentPlaceholder')}
            error={translateError(t, errors.document?.message)}
            {...register('document')}
          />
          <DialogFooter>
            <Button type="submit" loading={isSubmitting}>
              {tCommon('actions.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
