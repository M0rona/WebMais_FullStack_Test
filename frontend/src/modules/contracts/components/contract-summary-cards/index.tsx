import type { ContractStatus } from '@/common/types/contract.type';
import { useContractSummaryCardsModel } from './contract-summary-cards.model';
import { ContractSummaryCardsView } from './contract-summary-cards.view';

interface ContractSummaryCardsProps {
  selectedStatus?: ContractStatus;
  onSelectStatus: (status: ContractStatus | undefined) => void;
}

const ContractSummaryCards = ({ selectedStatus, onSelectStatus }: ContractSummaryCardsProps) => {
  const model = useContractSummaryCardsModel();
  return <ContractSummaryCardsView {...model} selectedStatus={selectedStatus} onSelectStatus={onSelectStatus} />;
};

export default ContractSummaryCards;
