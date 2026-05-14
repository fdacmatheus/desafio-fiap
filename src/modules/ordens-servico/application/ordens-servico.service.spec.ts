import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ClientesService } from 'src/modules/clientes/application/clientes.service';
import { Cliente } from 'src/modules/clientes/domain/cliente.entity';
import { PecasService } from 'src/modules/pecas/application/pecas.service';
import { Peca } from 'src/modules/pecas/domain/peca.entity';
import { ServicosService } from 'src/modules/servicos/application/servicos.service';
import { Servico } from 'src/modules/servicos/domain/servico.entity';
import { VeiculosService } from 'src/modules/veiculos/application/veiculos.service';
import { Veiculo } from 'src/modules/veiculos/domain/veiculo.entity';
import { OrdemServico } from '../domain/ordem-servico.entity';
import {
  ORDEM_SERVICO_REPOSITORY,
  OrdemServicoRepository,
} from '../domain/ordem-servico.repository';
import { StatusOS } from '../domain/status-os';
import { OrdensServicoService } from './ordens-servico.service';

const CLIENTE_ID = 'cli-1';
const VEICULO_ID = 'vei-1';
const SERVICO_ID = '550e8400-e29b-41d4-a716-446655440001';
const PECA_ID = '550e8400-e29b-41d4-a716-446655440002';

describe('OrdensServicoService', () => {
  let service: OrdensServicoService;
  let repo: jest.Mocked<OrdemServicoRepository>;
  let clientes: jest.Mocked<ClientesService>;
  let veiculos: jest.Mocked<VeiculosService>;
  let servicos: jest.Mocked<ServicosService>;
  let pecas: jest.Mocked<PecasService>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByNumero: jest.fn(),
      findAll: jest.fn(),
      tempoMedioExecucaoMinutos: jest.fn(),
      delete: jest.fn(),
    };

    clientes = { findById: jest.fn() } as unknown as jest.Mocked<ClientesService>;
    veiculos = { findById: jest.fn() } as unknown as jest.Mocked<VeiculosService>;
    servicos = { findById: jest.fn() } as unknown as jest.Mocked<ServicosService>;
    pecas = {
      findById: jest.fn(),
      saidaEstoque: jest.fn(),
    } as unknown as jest.Mocked<PecasService>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdensServicoService,
        { provide: ORDEM_SERVICO_REPOSITORY, useValue: repo },
        { provide: ClientesService, useValue: clientes },
        { provide: VeiculosService, useValue: veiculos },
        { provide: ServicosService, useValue: servicos },
        { provide: PecasService, useValue: pecas },
      ],
    }).compile();

    service = moduleRef.get(OrdensServicoService);
  });

  const cliente = new Cliente({
    id: CLIENTE_ID,
    nome: 'João',
    documento: '52998224725',
  });
  const veiculo = new Veiculo({
    id: VEICULO_ID,
    clienteId: CLIENTE_ID,
    placa: 'ABC1D23',
    marca: 'VW',
    modelo: 'Gol',
    ano: 2020,
  });

  describe('create', () => {
    it('cria OS com serviços e peças, calculando orçamento', async () => {
      clientes.findById.mockResolvedValue(cliente);
      veiculos.findById.mockResolvedValue(veiculo);
      servicos.findById.mockResolvedValue(
        new Servico({
          id: SERVICO_ID,
          nome: 'Troca de óleo',
          preco: 100,
          duracaoEstimadaMinutos: 60,
        }),
      );
      pecas.findById.mockResolvedValue(
        new Peca({
          id: PECA_ID,
          sku: 'FILTRO',
          nome: 'Filtro de óleo',
          precoUnitario: 30,
          estoque: 10,
          estoqueMinimo: 2,
        }),
      );
      repo.create.mockImplementation(async (os) => os);

      const result = await service.create({
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        servicos: [{ servicoId: SERVICO_ID }],
        pecas: [{ pecaId: PECA_ID, quantidade: 2 }],
      });

      expect(result.orcamento).toBe(160); // 100 + 2*30
      expect(result.status).toBe(StatusOS.RECEBIDA);
    });

    it('rejeita se veículo não pertence ao cliente', async () => {
      clientes.findById.mockResolvedValue(cliente);
      veiculos.findById.mockResolvedValue(
        new Veiculo({ ...veiculo, clienteId: 'outro-cliente' }),
      );
      await expect(
        service.create({ clienteId: CLIENTE_ID, veiculoId: VEICULO_ID }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('aprovar', () => {
    it('aprovação dá baixa no estoque de cada peça e move para EM_EXECUCAO', async () => {
      const os = new OrdemServico({
        id: 'os-1',
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        status: StatusOS.AGUARDANDO_APROVACAO,
        itens: [
          {
            tipo: 'PECA',
            referenciaId: PECA_ID,
            descricao: 'Filtro',
            quantidade: 3,
            precoUnitario: 30,
          },
          {
            tipo: 'SERVICO',
            referenciaId: SERVICO_ID,
            descricao: 'Troca de óleo',
            quantidade: 1,
            precoUnitario: 100,
          },
        ],
      });
      repo.findById.mockResolvedValue(os);
      repo.update.mockImplementation(async (o) => o);

      const result = await service.aprovar('os-1');

      expect(pecas.saidaEstoque).toHaveBeenCalledTimes(1);
      expect(pecas.saidaEstoque).toHaveBeenCalledWith(PECA_ID, 3);
      expect(result.status).toBe(StatusOS.EM_EXECUCAO);
    });

    it('rejeita aprovação se transição inválida', async () => {
      const os = new OrdemServico({
        id: 'os-1',
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        status: StatusOS.RECEBIDA,
      });
      repo.findById.mockResolvedValue(os);
      await expect(service.aprovar('os-1')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findById', () => {
    it('lança NotFound quando inexistente', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.findById('x')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
