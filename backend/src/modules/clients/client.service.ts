import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Client } from '../../infra/prisma/prisma-client';
import { ClientMapper, ClientResponseDto } from '../../common/mappers/client.mapper';
import { translate } from '../../common/utils/i18n.util';
import { CreateClientDtoType, ListClientsQueryType, UpdateClientDtoType } from './dto/client.dto';
import { ClientRepository } from './repositories/client.repository';

export interface PaginatedClientsDto {
  data: ClientResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ClientService {
  constructor(private clientRepository: ClientRepository) {}

  async create(dto: CreateClientDtoType): Promise<ClientResponseDto> {
    await this.assertDocumentAvailable(dto.document);
    const client = await this.clientRepository.create(dto);
    return ClientMapper.toResponse(client);
  }

  async findAll(query: ListClientsQueryType): Promise<PaginatedClientsDto> {
    const result = await this.clientRepository.findMany(query);
    return {
      data: ClientMapper.toResponseList(result.data),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async findOne(id: string): Promise<ClientResponseDto> {
    const client = await this.getOrThrow(id);
    return ClientMapper.toResponse(client);
  }

  async update(id: string, dto: UpdateClientDtoType): Promise<ClientResponseDto> {
    await this.getOrThrow(id);
    if (dto.document) {
      await this.assertDocumentAvailable(dto.document, id);
    }
    const client = await this.clientRepository.update(id, dto);
    return ClientMapper.toResponse(client);
  }

  async delete(id: string): Promise<void> {
    await this.getOrThrow(id);
    const contractsCount = await this.clientRepository.countContracts(id);
    if (contractsCount > 0) {
      throw new BadRequestException(
        translate(
          'clients.errors.hasContracts',
          'Cliente possui contratos vinculados e não pode ser excluído',
        ),
      );
    }
    await this.clientRepository.delete(id);
  }

  private async getOrThrow(id: string): Promise<Client> {
    const client = await this.clientRepository.findOne(id);
    if (!client) {
      throw new NotFoundException(translate('clients.errors.notFound', 'Cliente não encontrado'));
    }
    return client;
  }

  private async assertDocumentAvailable(document: string, ignoreClientId?: string): Promise<void> {
    const existing = await this.clientRepository.findByDocument(document);
    if (existing && existing.id !== ignoreClientId) {
      throw new ConflictException(
        translate('clients.errors.documentInUse', 'Já existe um cliente com este documento'),
      );
    }
  }
}
