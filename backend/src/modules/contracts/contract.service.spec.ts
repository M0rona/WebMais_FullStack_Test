import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ContractStatus } from '../../infra/prisma/prisma-client';
import { RedisService } from '../../infra/redis/redis.service';
import { ClientService } from '../clients/client.service';
import { ContractService } from './contract.service';
import { ContractRepository } from './repositories/contract.repository';

describe('ContractService', () => {
  let service: ContractService;

  const contractRepository = {
    generateNumber: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    countByStatus: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    approve: jest.fn(),
    close: jest.fn(),
    addItem: jest.fn(),
    updateItem: jest.fn(),
    deleteItem: jest.fn(),
  };
  const clientService = { findOne: jest.fn() };
  const redis = {
    getJson: jest.fn(),
    setJson: jest.fn(),
    deleteByPrefix: jest.fn(),
    del: jest.fn(),
  };

  const draftContract = {
    id: 'c1',
    status: ContractStatus.DRAFT,
    items: [] as { id: string }[],
  };
  const activeContractWithItem = {
    id: 'c1',
    status: ContractStatus.ACTIVE,
    items: [{ id: 'item-1' }],
  };
  const closedContract = {
    id: 'c1',
    status: ContractStatus.CLOSED,
    items: [{ id: 'item-1' }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ContractService,
        { provide: ContractRepository, useValue: contractRepository },
        { provide: ClientService, useValue: clientService },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get(ContractService);
  });

  describe('create', () => {
    it('valida o cliente, gera o número e invalida o cache', async () => {
      clientService.findOne.mockResolvedValue({ id: 'client-1' });
      contractRepository.generateNumber.mockResolvedValue('CTR-0001');
      contractRepository.create.mockResolvedValue({
        id: 'c1',
        number: 'CTR-0001',
        value: 100,
        items: [],
      });

      await service.create({
        clientId: 'client-1',
        type: 'SERVICE',
        dueDate: new Date(Date.now() + 86_400_000).toISOString(),
        items: [{ description: 'Item', quantity: 1, unitValue: 100 }],
      });

      expect(clientService.findOne).toHaveBeenCalledWith('client-1');
      expect(redis.deleteByPrefix).toHaveBeenCalled();
      expect(redis.del).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('retorna do cache sem consultar o repository quando há hit', async () => {
      redis.getJson.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });

      await service.findAll({ page: 1, limit: 10 });

      expect(contractRepository.findMany).not.toHaveBeenCalled();
    });

    it('consulta o repository e grava no cache quando há miss', async () => {
      redis.getJson.mockResolvedValue(null);
      contractRepository.findMany.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });

      await service.findAll({ page: 1, limit: 10 });

      expect(contractRepository.findMany).toHaveBeenCalled();
      expect(redis.setJson).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('rejeita aprovar contrato sem itens', async () => {
      contractRepository.findOne.mockResolvedValue(draftContract);

      await expect(service.approve('c1')).rejects.toBeInstanceOf(BadRequestException);
      expect(contractRepository.approve).not.toHaveBeenCalled();
    });

    it('rejeita aprovar contrato que não está em DRAFT', async () => {
      contractRepository.findOne.mockResolvedValue(activeContractWithItem);

      await expect(service.approve('c1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('aprova contrato DRAFT com item', async () => {
      contractRepository.findOne.mockResolvedValue({ ...draftContract, items: [{ id: 'item-1' }] });
      contractRepository.approve.mockResolvedValue({
        id: 'c1',
        status: ContractStatus.ACTIVE,
        items: [],
      });

      await service.approve('c1');

      expect(contractRepository.approve).toHaveBeenCalledWith('c1');
      expect(redis.del).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('rejeita encerrar contrato em DRAFT', async () => {
      contractRepository.findOne.mockResolvedValue(draftContract);

      await expect(service.close('c1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejeita encerrar contrato já encerrado', async () => {
      contractRepository.findOne.mockResolvedValue(closedContract);

      await expect(service.close('c1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('encerra contrato ativo', async () => {
      contractRepository.findOne.mockResolvedValue(activeContractWithItem);
      contractRepository.close.mockResolvedValue({
        id: 'c1',
        status: ContractStatus.CLOSED,
        items: [],
      });

      await service.close('c1');

      expect(contractRepository.close).toHaveBeenCalledWith('c1');
    });
  });

  describe('update', () => {
    it('rejeita editar contrato encerrado', async () => {
      contractRepository.findOne.mockResolvedValue(closedContract);

      await expect(service.update('c1', { type: 'SUPPLY' })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('items', () => {
    it('rejeita adicionar item em contrato encerrado', async () => {
      contractRepository.findOne.mockResolvedValue(closedContract);

      await expect(
        service.addItem('c1', { description: 'X', quantity: 1, unitValue: 1 }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejeita atualizar item que não pertence ao contrato', async () => {
      contractRepository.findOne.mockResolvedValue(activeContractWithItem);

      await expect(service.updateItem('c1', 'item-inexistente', {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
