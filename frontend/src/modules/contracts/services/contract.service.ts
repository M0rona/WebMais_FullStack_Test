import { api } from '@/common/services/api.service';
import type { Contract, ContractsSummary, ContractStatus, ContractType, PaginatedResponse } from '@/common/types';
import type { ContractFormData, ContractItemFormData } from '@/common/utils/validations';

interface ListContractsParams {
  page?: number;
  limit?: number;
  status?: ContractStatus;
  type?: ContractType;
}

export const contractService = {
  findAll: async (params?: ListContractsParams): Promise<PaginatedResponse<Contract>> => {
    const response = await api.get<PaginatedResponse<Contract>>('/contracts', { params });
    return response.data;
  },

  summary: async (): Promise<ContractsSummary> => {
    const response = await api.get<ContractsSummary>('/contracts/summary');
    return response.data;
  },

  findOne: async (id: string): Promise<Contract> => {
    const response = await api.get<Contract>(`/contracts/${id}`);
    return response.data;
  },

  create: async (data: ContractFormData & { dueDate: string }): Promise<Contract> => {
    const response = await api.post<Contract>('/contracts', data);
    return response.data;
  },

  update: async (
    id: string,
    data: { clientId: string; type: ContractFormData['type']; dueDate: string },
  ): Promise<Contract> => {
    const response = await api.patch<Contract>(`/contracts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/contracts/${id}`);
  },

  approve: async (id: string): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/approve`);
    return response.data;
  },

  close: async (id: string): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${id}/close`);
    return response.data;
  },

  addItem: async (contractId: string, item: ContractItemFormData): Promise<Contract> => {
    const response = await api.post<Contract>(`/contracts/${contractId}/items`, item);
    return response.data;
  },

  updateItem: async (
    contractId: string,
    itemId: string,
    item: ContractItemFormData,
  ): Promise<Contract> => {
    const response = await api.patch<Contract>(`/contracts/${contractId}/items/${itemId}`, item);
    return response.data;
  },

  deleteItem: async (contractId: string, itemId: string): Promise<Contract> => {
    const response = await api.delete<Contract>(`/contracts/${contractId}/items/${itemId}`);
    return response.data;
  },
};
