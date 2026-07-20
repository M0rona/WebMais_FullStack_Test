import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { ContractFormData } from '@/common/utils/validations';
import { useContractItemListModel } from './contract-item-list.model';
import { ContractItemListView } from './contract-item-list.view';

interface ContractItemListProps {
  control: Control<ContractFormData>;
  register: UseFormRegister<ContractFormData>;
  errors?: FieldErrors<ContractFormData>['items'];
}

const ContractItemList = ({ control, register, errors }: ContractItemListProps) => {
  const model = useContractItemListModel({ control });
  return <ContractItemListView {...model} register={register} errors={errors} />;
};

export default ContractItemList;
