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
import { NOTIFICACAO_PORT } from './notificacao.port';
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
      veiculos.findById.mockResolvedValue(new Veiculo({ ...veiculo, clienteId: 'outro-cliente' }));
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

  describe('responderOrcamento (webhook público)', () => {
    it('aprova o orçamento pelo número e inicia execução', async () => {
      const os = new OrdemServico({
        id: 'os-1',
        numero: 42,
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        status: StatusOS.AGUARDANDO_APROVACAO,
        itens: [
          {
            tipo: 'SERVICO',
            referenciaId: SERVICO_ID,
            descricao: 'Troca de óleo',
            quantidade: 1,
            precoUnitario: 100,
          },
        ],
      });
      repo.findByNumero.mockResolvedValue(os);
      repo.update.mockImplementation(async (o) => o);

      const result = await service.responderOrcamento(42, true);
      expect(result.status).toBe(StatusOS.EM_EXECUCAO);
    });

    it('recusa o orçamento cancelando a OS', async () => {
      const os = new OrdemServico({
        id: 'os-1',
        numero: 42,
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        status: StatusOS.AGUARDANDO_APROVACAO,
      });
      repo.findByNumero.mockResolvedValue(os);
      repo.update.mockImplementation(async (o) => o);

      const result = await service.responderOrcamento(42, false);
      expect(result.status).toBe(StatusOS.CANCELADA);
    });
  });

  describe('findAll (listagem para a oficina)', () => {
    function osCom(status: StatusOS, recebidaEm: Date) {
      return new OrdemServico({
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        status,
        recebidaEm,
      });
    }

    it('ordena por prioridade de status e mais antigas primeiro, ocultando finalizadas/entregues/canceladas', async () => {
      const antiga = new Date('2026-01-01');
      const nova = new Date('2026-02-01');
      repo.findAll.mockResolvedValue([
        osCom(StatusOS.RECEBIDA, antiga),
        osCom(StatusOS.ENTREGUE, antiga),
        osCom(StatusOS.EM_EXECUCAO, nova),
        osCom(StatusOS.EM_EXECUCAO, antiga),
        osCom(StatusOS.FINALIZADA, antiga),
        osCom(StatusOS.AGUARDANDO_APROVACAO, nova),
        osCom(StatusOS.EM_DIAGNOSTICO, antiga),
      ]);

      const list = await service.findAll();

      expect(list.map((os) => os.status)).toEqual([
        StatusOS.EM_EXECUCAO,
        StatusOS.EM_EXECUCAO,
        StatusOS.AGUARDANDO_APROVACAO,
        StatusOS.EM_DIAGNOSTICO,
        StatusOS.RECEBIDA,
      ]);
      expect(list[0].recebidaEm).toEqual(antiga);
      expect(list[1].recebidaEm).toEqual(nova);
    });

    it('mantém o filtro explícito por status mesmo para status ocultos', async () => {
      repo.findAll.mockResolvedValue([osCom(StatusOS.FINALIZADA, new Date())]);
      const list = await service.findAll({ status: StatusOS.FINALIZADA });
      expect(list).toHaveLength(1);
    });
  });

  describe('notificação de mudança de status', () => {
    it('notifica o cliente por e-mail após transição de status', async () => {
      const notificacao = { notificarMudancaStatus: jest.fn() };
      const moduleRef = await Test.createTestingModule({
        providers: [
          OrdensServicoService,
          { provide: ORDEM_SERVICO_REPOSITORY, useValue: repo },
          { provide: ClientesService, useValue: clientes },
          { provide: VeiculosService, useValue: veiculos },
          { provide: ServicosService, useValue: servicos },
          { provide: PecasService, useValue: pecas },
          { provide: NOTIFICACAO_PORT, useValue: notificacao },
        ],
      }).compile();
      const svc = moduleRef.get(OrdensServicoService);

      const os = new OrdemServico({
        id: 'os-1',
        numero: 7,
        clienteId: CLIENTE_ID,
        veiculoId: VEICULO_ID,
        status: StatusOS.RECEBIDA,
      });
      repo.findById.mockResolvedValue(os);
      repo.update.mockImplementation(async (o) => o);
      clientes.findById.mockResolvedValue(
        new Cliente({
          id: CLIENTE_ID,
          nome: 'João',
          documento: '52998224725',
          email: 'joao@email.com',
        }),
      );

      await svc.iniciarDiagnostico('os-1');

      expect(notificacao.notificarMudancaStatus).toHaveBeenCalledWith(
        expect.objectContaining({ status: StatusOS.EM_DIAGNOSTICO }),
        'joao@email.com',
      );
    });
  });
});
