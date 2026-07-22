import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Peca } from '../domain/peca.entity';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecasService } from './pecas.service';

const baseInput = {
  sku: 'FILTRO',
  nome: 'Filtro de óleo',
  precoUnitario: 30,
  estoque: 10,
  estoqueMinimo: 2,
};

describe('PecasService', () => {
  let service: PecasService;
  let repo: jest.Mocked<PecaRepository>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySku: jest.fn(),
      findAll: jest.fn(),
      findEstoqueBaixo: jest.fn(),
      delete: jest.fn(),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [PecasService, { provide: PECA_REPOSITORY, useValue: repo }],
    }).compile();
    service = moduleRef.get(PecasService);
  });

  it('rejeita criação com SKU duplicado', async () => {
    repo.findBySku.mockResolvedValue(new Peca(baseInput));
    await expect(service.create(baseInput)).rejects.toBeInstanceOf(ConflictException);
  });

  it('cria peça quando SKU é único', async () => {
    repo.findBySku.mockResolvedValue(null);
    repo.create.mockImplementation(async (p) => p);
    const result = await service.create(baseInput);
    expect(result.sku).toBe('FILTRO');
  });

  it('saídaEstoque decrementa e persiste', async () => {
    const peca = new Peca({ ...baseInput, id: 'p-1' });
    repo.findById.mockResolvedValue(peca);
    repo.update.mockImplementation(async (p) => p);
    const result = await service.saidaEstoque('p-1', 4);
    expect(result.estoque).toBe(6);
  });

  it('saída maior que estoque lança BadRequest', async () => {
    repo.findById.mockResolvedValue(new Peca({ ...baseInput, estoque: 1 }));
    await expect(service.saidaEstoque('p-1', 5)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('findById lança NotFound quando inexistente', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findById('x')).rejects.toBeInstanceOf(NotFoundException);
  });
});
