import { useTranslation } from 'react-i18next';
import type { ContractStatus, ContractType } from '@/common/types/contract.type';

export const useContractStatusLabels = (): Record<ContractStatus, string> => {
  const { t } = useTranslation('contracts');
  return {
    DRAFT: t('status.DRAFT'),
    ACTIVE: t('status.ACTIVE'),
    EXPIRED: t('status.EXPIRED'),
    CLOSED: t('status.CLOSED'),
  };
};

export const useContractTypeLabels = (): Record<ContractType, string> => {
  const { t } = useTranslation('contracts');
  return {
    SERVICE: t('type.SERVICE'),
    SUPPLY: t('type.SUPPLY'),
    LEASE: t('type.LEASE'),
  };
};
