import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { ContractCloseDialogModel } from './contract-close-dialog.model';

type ContractCloseDialogViewProps = ContractCloseDialogModel & {
  trigger: ReactNode; // só o gatilho visual, não precisa passar pelo model
  contractNumber: string; // só usado na mensagem, não afeta lógica
};

export const ContractCloseDialogView = ({
  trigger,
  contractNumber,
  onConfirm,
}: ContractCloseDialogViewProps) => {
  const { t } = useTranslation('contracts');
  const { t: tCommon } = useTranslation('common');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('closeDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('closeDialog.description', { number: contractNumber })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('closeDialog.confirm')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
