export type ContractType = 'SERVICE' | 'SUPPLY' | 'LEASE';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  subtotal: number;
}

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

export interface ContractsSummary {
  draft: number;
  active: number;
  expired: number;
  closed: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
