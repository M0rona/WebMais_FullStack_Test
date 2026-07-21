import { HttpService } from '@/common/services/http.service';
import type { Client } from '@/common/types/client.type';
import type { PaginatedResponse } from '@/common/types/paginated-response.type';
import type { ClientFormData } from '@/modules/clients/schemas/client.schema';

interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
}

class ClientService extends HttpService {
  findAll(params?: ListClientsParams): Promise<PaginatedResponse<Client>> {
    return this.get<PaginatedResponse<Client>>('/clients', { params });
  }

  findOne(id: string): Promise<Client> {
    return this.get<Client>(`/clients/${id}`);
  }

  create(data: ClientFormData): Promise<Client> {
    return this.post<Client>('/clients', data);
  }

  update(id: string, data: Partial<ClientFormData>): Promise<Client> {
    return this.patch<Client>(`/clients/${id}`, data);
  }

  delete<T = void>(id: string): Promise<T> {
    return super.delete<T>(`/clients/${id}`);
  }
}

export const clientService = new ClientService();
