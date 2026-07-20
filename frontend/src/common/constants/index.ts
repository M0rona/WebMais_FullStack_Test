import type { ContractStatus, ContractType } from '@/common/types/contract.type';

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Rascunho',
  ACTIVE: 'Ativo',
  EXPIRED: 'Vencido',
  CLOSED: 'Encerrado',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  SERVICE: 'Prestação de serviço',
  SUPPLY: 'Fornecimento',
  LEASE: 'Locação',
};

export const ERROR_MESSAGES = {
  GENERIC: 'Algo deu errado. Tente novamente.',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente.',
};
