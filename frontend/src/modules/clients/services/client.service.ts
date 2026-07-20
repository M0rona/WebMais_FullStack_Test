import { HttpService } from '@/common/services/http.service';
import type { Client } from '@/common/types/client.type';
import type { ClientFormData } from '@/modules/clients/schemas/client.schema';

class ClientService extends HttpService {
  findAll(): Promise<Client[]> {
    return this.get<Client[]>('/clients');
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
