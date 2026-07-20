import { useContractListModel } from './contract-list.model';
import { ContractListView } from './contract-list.view';

const ContractList = () => {
  const model = useContractListModel();
  return <ContractListView {...model} />;
};

export default ContractList;
