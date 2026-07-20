import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { ContractFormData } from '@/modules/contracts/schemas/contract.schema';
import { useContractItemListModel } from './contract-item-list.model';
import { ContractItemListView } from './contract-item-list.view';

interface ContractItemListProps {
  control: Control<ContractFormData>;
  register: UseFormRegister<ContractFormData>;
  errors?: FieldErrors<ContractFormData>['items'];
}

const ContractItemList = ({ control, register, errors }: ContractItemListProps) => {
  const model = useContractItemListModel({ control });
  return <ContractItemListView {...model} control={control} register={register} errors={errors} />;
};

export default ContractItemList;
