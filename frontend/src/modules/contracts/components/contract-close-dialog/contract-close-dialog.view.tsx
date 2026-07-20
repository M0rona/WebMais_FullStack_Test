import type { ReactNode } from 'react';
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
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Encerrar contrato?</AlertDialogTitle>
          <AlertDialogDescription>
            O contrato {contractNumber} será marcado como encerrado. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Encerrar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
