import type { ReactNode } from 'react';
import { useContractCloseDialogModel } from './contract-close-dialog.model';
import { ContractCloseDialogView } from './contract-close-dialog.view';

interface ContractCloseDialogProps {
  contractId: string;
  contractNumber: string;
  trigger: ReactNode;
}

const ContractCloseDialog = ({ contractId, contractNumber, trigger }: ContractCloseDialogProps) => {
  const model = useContractCloseDialogModel({ contractId });
  return <ContractCloseDialogView {...model} contractNumber={contractNumber} trigger={trigger} />;
};

export default ContractCloseDialog;
