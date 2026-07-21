import { HttpService } from '@/common/services/http.service';
import type { Contract, ContractStatus, ContractType } from '@/common/types/contract.type';
import type { ContractsSummary } from '@/common/types/contracts-summary.type';
import type { PaginatedResponse } from '@/common/types/paginated-response.type';
import type { ContractFormData } from '@/modules/contracts/schemas/contract.schema';
import type { ContractItemFormData } from '@/modules/contracts/schemas/contract-item.schema';

interface ListContractsParams {
  page?: number;
  limit?: number;
  status?: ContractStatus;
  type?: ContractType;
  search?: string;
}

class ContractService extends HttpService {
  findAll(params?: ListContractsParams): Promise<PaginatedResponse<Contract>> {
    return this.get<PaginatedResponse<Contract>>('/contracts', { params });
  }

  summary(): Promise<ContractsSummary> {
    return this.get<ContractsSummary>('/contracts/summary');
  }

  create(data: ContractFormData & { dueDate: string }): Promise<Contract> {
    return this.post<Contract>('/contracts', data);
  }

  // `items` opcional: quando enviado, o backend substitui a lista de itens
  // do contrato inteira numa única transação (ver spec 02-backend.md),
  // evitando N requisições sequenciais de add/update/delete por item.
  update(
    id: string,
    data: {
      clientId: string;
      type: ContractFormData['type'];
      dueDate: string;
      items?: ContractItemFormData[];
    },
  ): Promise<Contract> {
    return this.patch<Contract>(`/contracts/${id}`, data);
  }

  delete<T = void>(id: string): Promise<T> {
    return super.delete<T>(`/contracts/${id}`);
  }

  approve(id: string): Promise<Contract> {
    return this.post<Contract>(`/contracts/${id}/approve`);
  }

  close(id: string): Promise<Contract> {
    return this.post<Contract>(`/contracts/${id}/close`);
  }
}

export const contractService = new ContractService();
