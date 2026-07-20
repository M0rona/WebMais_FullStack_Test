import type { ReactNode } from 'react';
import { useContractDeleteDialogModel } from './contract-delete-dialog.model';
import { ContractDeleteDialogView } from './contract-delete-dialog.view';

interface ContractDeleteDialogProps {
  contractId: string;
  trigger: ReactNode;
}

const ContractDeleteDialog = ({ contractId, trigger }: ContractDeleteDialogProps) => {
  const model = useContractDeleteDialogModel({ contractId });
  return <ContractDeleteDialogView {...model} trigger={trigger} />;
};

export default ContractDeleteDialog;
