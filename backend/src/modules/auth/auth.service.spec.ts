import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
  const configService = {
    getOrThrow: jest.fn().mockReturnValue('secret'),
    get: jest.fn().mockReturnValue('8h'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('cria um usuário novo, faz hash da senha e retorna o token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      prisma.user.create.mockResolvedValue({ id: '1', email: 'a@a.com', name: 'A' });

      const result = await service.register({ name: 'A', email: 'a@a.com', password: '123456' });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: { name: 'A', email: 'a@a.com', password: 'hashed-password' },
      });
      expect(result).toEqual({
        accessToken: 'signed-token',
        user: { id: '1', email: 'a@a.com', name: 'A' },
      });
    });

    it('rejeita cadastro com email já existente', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(
        service.register({ name: 'A', email: 'a@a.com', password: '123456' }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('autentica com credenciais válidas', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        name: 'A',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'a@a.com', password: '123456' });

      expect(result.accessToken).toBe('signed-token');
    });

    it('rejeita usuário inexistente', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'a@a.com', password: '123456' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejeita senha incorreta', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@a.com',
        name: 'A',
        password: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'a@a.com', password: 'wrong' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
