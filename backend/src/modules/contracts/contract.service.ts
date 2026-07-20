import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CONTRACTS_CACHE_TTL_SECONDS,
  CONTRACTS_LIST_CACHE_PREFIX,
  CONTRACTS_SUMMARY_CACHE_KEY,
} from '../../common/constants/contract.constants';
import { ContractMapper, ContractResponseDto } from '../../common/mappers/contract.mapper';
import { ContractStatus } from '../../infra/prisma/prisma-client';
import { RedisService } from '../../infra/redis/redis.service';
import { ClientService } from '../clients/client.service';
import { ContractItemInputType, UpdateContractItemDtoType } from './dto/contract-item.dto';
import {
  CreateContractDtoType,
  ListContractsQueryType,
  UpdateContractDtoType,
} from './dto/contract.dto';
import { ContractRepository } from './repositories/contract.repository';
import { ContractCacheService } from './services/contract-cache.service';

export interface ContractsSummaryDto {
  draft: number;
  active: number;
  expired: number;
  closed: number;
}

export interface PaginatedContractsDto {
  data: ContractResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ContractWithItems {
  status: ContractStatus;
  items: { id: string }[];
}

@Injectable()
export class ContractService {
  constructor(
    private contractRepository: ContractRepository,
    private clientService: ClientService,
    private redis: RedisService,
    private contractCache: ContractCacheService,
  ) {}

  async create(dto: CreateContractDtoType): Promise<ContractResponseDto> {
    await this.clientService.findOne(dto.clientId);
    const number = await this.contractRepository.generateNumber();

    const contract = await this.contractRepository.create({
      clientId: dto.clientId,
      type: dto.type,
      dueDate: new Date(dto.dueDate),
      number,
      items: dto.items,
    });

    await this.contractCache.invalidate();
    return ContractMapper.toResponse(contract);
  }

  async findAll(query: ListContractsQueryType): Promise<PaginatedContractsDto> {
    const cacheKey = this.buildListCacheKey(query);
    const cached = await this.redis.getJson<PaginatedContractsDto>(cacheKey);
    if (cached) return cached;

    const result = await this.contractRepository.findMany({
      status: query.status,
      type: query.type,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    const response: PaginatedContractsDto = {
      data: ContractMapper.toResponseList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };

    await this.redis.setJson(cacheKey, response, CONTRACTS_CACHE_TTL_SECONDS);
    return response;
  }

  async summary(): Promise<ContractsSummaryDto> {
    const cached = await this.redis.getJson<ContractsSummaryDto>(CONTRACTS_SUMMARY_CACHE_KEY);
    if (cached) return cached;

    const counts = await this.contractRepository.countByStatus();
    const summary: ContractsSummaryDto = {
      draft: counts.DRAFT,
      active: counts.ACTIVE,
      expired: counts.EXPIRED,
      closed: counts.CLOSED,
    };

    await this.redis.setJson(CONTRACTS_SUMMARY_CACHE_KEY, summary, CONTRACTS_CACHE_TTL_SECONDS);
    return summary;
  }

  async findOne(id: string): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(id);
    return ContractMapper.toResponse(contract);
  }

  async update(id: string, dto: UpdateContractDtoType): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(id);
    this.assertNotClosed(contract.status);

    if (dto.clientId) {
      await this.clientService.findOne(dto.clientId);
    }

    const updated = await this.contractRepository.update(id, {
      ...(dto.clientId && { client: { connect: { id: dto.clientId } } }),
      ...(dto.type && { type: dto.type }),
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
    });

    await this.contractCache.invalidate();
    return ContractMapper.toResponse(updated);
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.contractRepository.delete(id);
    await this.contractCache.invalidate();
  }

  async approve(id: string): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(id);
    if (contract.status !== ContractStatus.DRAFT) {
      throw new BadRequestException('Apenas contratos em rascunho podem ser aprovados');
    }
    if (contract.items.length === 0) {
      throw new BadRequestException('Contrato precisa de ao menos um item para ser aprovado');
    }

    const approved = await this.contractRepository.approve(id);
    await this.contractCache.invalidate();
    return ContractMapper.toResponse(approved);
  }

  async close(id: string): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(id);
    if (contract.status === ContractStatus.DRAFT) {
      throw new BadRequestException('Não é possível encerrar um contrato em rascunho');
    }
    if (contract.status === ContractStatus.CLOSED) {
      throw new BadRequestException('Contrato já está encerrado');
    }

    const closed = await this.contractRepository.close(id);
    await this.contractCache.invalidate();
    return ContractMapper.toResponse(closed);
  }

  async addItem(contractId: string, item: ContractItemInputType): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(contractId);
    this.assertNotClosed(contract.status);

    const updated = await this.contractRepository.addItem(contractId, item);
    await this.contractCache.invalidate();
    return ContractMapper.toResponse(updated);
  }

  async updateItem(
    contractId: string,
    itemId: string,
    dto: UpdateContractItemDtoType,
  ): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(contractId);
    this.assertNotClosed(contract.status);
    this.assertItemBelongsToContract(contract, itemId);

    const updated = await this.contractRepository.updateItem(contractId, itemId, dto);
    await this.contractCache.invalidate();
    return ContractMapper.toResponse(updated);
  }

  async deleteItem(contractId: string, itemId: string): Promise<ContractResponseDto> {
    const contract = await this.getOrThrow(contractId);
    this.assertNotClosed(contract.status);
    this.assertItemBelongsToContract(contract, itemId);

    const updated = await this.contractRepository.deleteItem(contractId, itemId);
    await this.contractCache.invalidate();
    return ContractMapper.toResponse(updated);
  }

  private async getOrThrow(id: string) {
    const contract = await this.contractRepository.findOne(id);
    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }
    return contract;
  }

  private assertNotClosed(status: ContractStatus): void {
    if (status === ContractStatus.CLOSED) {
      throw new BadRequestException('Contrato encerrado não pode ser alterado');
    }
  }

  private assertItemBelongsToContract(contract: ContractWithItems, itemId: string): void {
    const belongsToContract = contract.items.some((item) => item.id === itemId);
    if (!belongsToContract) {
      throw new NotFoundException('Item não encontrado neste contrato');
    }
  }

  private buildListCacheKey(query: ListContractsQueryType): string {
    const status = query.status ?? 'all';
    const type = query.type ?? 'all';
    const search = query.search ?? 'all';
    return `${CONTRACTS_LIST_CACHE_PREFIX}${query.page}:${query.limit}:${status}:${type}:${search}`;
  }
}
