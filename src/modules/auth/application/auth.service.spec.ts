import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { User } from '../domain/user.entity';
import { USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UserRepository>;
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    users = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('token') };

    const config: Partial<ConfigService> = {
      get: jest.fn().mockImplementation((_k: string, d?: unknown) => d ?? '15m'),
      getOrThrow: jest.fn().mockReturnValue('secret'),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: users },
        { provide: JwtService, useValue: jwt },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('cria usuário e devolve tokens', async () => {
      users.findByUsername.mockResolvedValue(null);
      users.create.mockImplementation(async (u) => ({ ...u, id: 'u-1' }) as User);

      const result = await service.register('admin', 'senha123');

      expect(result).toEqual({ accessToken: 'token', refreshToken: 'token' });
      expect(jwt.signAsync).toHaveBeenCalledTimes(2);
    });

    it('rejeita username duplicado', async () => {
      users.findByUsername.mockResolvedValue({} as User);
      await expect(service.register('admin', 'senha123')).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('autentica com senha correta', async () => {
      const passwordHash = await bcrypt.hash('senha123', 4);
      users.findByUsername.mockResolvedValue(
        new User({ id: 'u-1', username: 'admin', passwordHash }),
      );

      const result = await service.login('admin', 'senha123');
      expect(result.accessToken).toBe('token');
    });

    it('rejeita senha incorreta', async () => {
      const passwordHash = await bcrypt.hash('senha123', 4);
      users.findByUsername.mockResolvedValue(
        new User({ id: 'u-1', username: 'admin', passwordHash }),
      );
      await expect(service.login('admin', 'errada')).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejeita usuário inexistente', async () => {
      users.findByUsername.mockResolvedValue(null);
      await expect(service.login('x', 'y')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('emite novos tokens para usuário existente', async () => {
      users.findById.mockResolvedValue(
        new User({ id: 'u-1', username: 'admin', passwordHash: 'h' }),
      );
      const result = await service.refresh('u-1');
      expect(result.accessToken).toBe('token');
    });

    it('rejeita refresh para usuário inexistente', async () => {
      users.findById.mockResolvedValue(null);
      await expect(service.refresh('u-1')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
