import { api } from '@/common/services/api.service';
import type { Client } from '@/common/types';
import type { ClientFormData } from '@/common/utils/validations';

export const clientService = {
  findAll: async (): Promise<Client[]> => {
    const response = await api.get<Client[]>('/clients');
    return response.data;
  },

  create: async (data: ClientFormData): Promise<Client> => {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ClientFormData>): Promise<Client> => {
    const response = await api.patch<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clients/${id}`);
  },
};
