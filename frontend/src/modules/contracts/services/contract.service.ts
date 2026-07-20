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
}

class ContractService extends HttpService {
  findAll(params?: ListContractsParams): Promise<PaginatedResponse<Contract>> {
    return this.get<PaginatedResponse<Contract>>('/contracts', { params });
  }

  summary(): Promise<ContractsSummary> {
    return this.get<ContractsSummary>('/contracts/summary');
  }

  findOne(id: string): Promise<Contract> {
    return this.get<Contract>(`/contracts/${id}`);
  }

  create(data: ContractFormData & { dueDate: string }): Promise<Contract> {
    return this.post<Contract>('/contracts', data);
  }

  update(
    id: string,
    data: { clientId: string; type: ContractFormData['type']; dueDate: string },
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

  addItem(contractId: string, item: ContractItemFormData): Promise<Contract> {
    return this.post<Contract>(`/contracts/${contractId}/items`, item);
  }

  updateItem(contractId: string, itemId: string, item: ContractItemFormData): Promise<Contract> {
    return this.patch<Contract>(`/contracts/${contractId}/items/${itemId}`, item);
  }

  deleteItem(contractId: string, itemId: string): Promise<Contract> {
    return super.delete<Contract>(`/contracts/${contractId}/items/${itemId}`);
  }
}

export const contractService = new ContractService();
