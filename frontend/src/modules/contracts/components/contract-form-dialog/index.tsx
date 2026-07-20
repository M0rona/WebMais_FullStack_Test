import type { ReactNode } from 'react';
import type { Contract } from '@/common/types/contract.type';
import { useContractFormDialogModel } from './contract-form-dialog.model';
import { ContractFormDialogView } from './contract-form-dialog.view';

interface ContractFormDialogProps {
  contract?: Contract;
  trigger: ReactNode;
}

const ContractFormDialog = ({ contract, trigger }: ContractFormDialogProps) => {
  const model = useContractFormDialogModel({ contract });
  return <ContractFormDialogView {...model} trigger={trigger} />;
};

export default ContractFormDialog;
