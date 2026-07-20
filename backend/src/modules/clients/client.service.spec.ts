import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientRepository } from './repositories/client.repository';

describe('ClientService', () => {
  let service: ClientService;

  const repository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    findByDocument: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    countContracts: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [ClientService, { provide: ClientRepository, useValue: repository }],
    }).compile();

    service = module.get(ClientService);
  });

  describe('create', () => {
    it('cria cliente quando o documento ainda não existe', async () => {
      repository.findByDocument.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: '1',
        name: 'Acme',
        document: '11444777000161',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create({ name: 'Acme', document: '11444777000161' });

      expect(result.id).toBe('1');
      expect(repository.create).toHaveBeenCalled();
    });

    it('rejeita documento já cadastrado', async () => {
      repository.findByDocument.mockResolvedValue({ id: '2' });

      await expect(
        service.create({ name: 'Acme', document: '11444777000161' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('permite manter o mesmo documento do próprio cliente', async () => {
      repository.findOne.mockResolvedValue({ id: '1', document: '11444777000161' });
      repository.findByDocument.mockResolvedValue({ id: '1' });
      repository.update.mockResolvedValue({
        id: '1',
        name: 'Acme LTDA',
        document: '11444777000161',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.update('1', { name: 'Acme LTDA' });

      expect(result.name).toBe('Acme LTDA');
    });

    it('rejeita troca para documento de outro cliente', async () => {
      repository.findOne.mockResolvedValue({ id: '1', document: '11444777000161' });
      repository.findByDocument.mockResolvedValue({ id: '2' });

      await expect(service.update('1', { document: '52998224725' })).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('rejeita atualizar cliente inexistente', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('nope', { name: 'X' })).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete', () => {
    it('exclui cliente sem contratos vinculados', async () => {
      repository.findOne.mockResolvedValue({ id: '1' });
      repository.countContracts.mockResolvedValue(0);

      await service.delete('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });

    it('bloqueia exclusão de cliente com contratos vinculados', async () => {
      repository.findOne.mockResolvedValue({ id: '1' });
      repository.countContracts.mockResolvedValue(3);

      await expect(service.delete('1')).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});
