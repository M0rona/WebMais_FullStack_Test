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
} from '@/common/components/shadcn/alert-dialog';
import type { ContractDeleteDialogModel } from './contract-delete-dialog.model';

type ContractDeleteDialogViewProps = ContractDeleteDialogModel & {
  trigger: ReactNode;
};

export const ContractDeleteDialogView = ({ trigger, onConfirm }: ContractDeleteDialogViewProps) => {
  const { t } = useTranslation('contracts');
  const { t: tCommon } = useTranslation('common');

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('deleteDialog.description')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{tCommon('actions.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
