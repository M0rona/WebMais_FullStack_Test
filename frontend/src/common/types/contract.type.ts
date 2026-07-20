import type { ContractItem } from '@/common/types/contract-item.type';

export type ContractType = 'SERVICE' | 'SUPPLY' | 'LEASE';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface Contract {
  id: string;
  number: string;
  type: ContractType;
  value: number;
  dueDate: string;
  status: ContractStatus;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; document: string };
  items?: ContractItem[];
}
