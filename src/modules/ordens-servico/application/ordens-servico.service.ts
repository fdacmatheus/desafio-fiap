import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ClientesService } from 'src/modules/clientes/application/clientes.service';
import { PecasService } from 'src/modules/pecas/application/pecas.service';
import { ServicosService } from 'src/modules/servicos/application/servicos.service';
import { VeiculosService } from 'src/modules/veiculos/application/veiculos.service';
import {
  ORDEM_SERVICO_REPOSITORY,
  OrdemServicoRepository,
} from '../domain/ordem-servico.repository';
import { OrdemServico } from '../domain/ordem-servico.entity';
import { prioridadeListagem, STATUS_OCULTOS_NA_LISTAGEM, StatusOS } from '../domain/status-os';
import { NOTIFICACAO_PORT, NotificacaoPort } from './notificacao.port';

export interface ItemServicoInput {
  servicoId: string;
  quantidade?: number;
}

export interface ItemPecaInput {
  pecaId: string;
  quantidade: number;
}

export interface CreateOrdemServicoInput {
  clienteId: string;
  veiculoId: string;
  servicos?: ItemServicoInput[];
  pecas?: ItemPecaInput[];
}

@Injectable()
export class OrdensServicoService {
  private readonly logger = new Logger(OrdensServicoService.name);

  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: OrdemServicoRepository,
    private readonly clientes: ClientesService,
    private readonly veiculos: VeiculosService,
    private readonly servicos: ServicosService,
    private readonly pecas: PecasService,
    @Optional()
    @Inject(NOTIFICACAO_PORT)
    private readonly notificacao?: NotificacaoPort,
  ) {}

  async create(input: CreateOrdemServicoInput): Promise<OrdemServico> {
    await this.clientes.findById(input.clienteId);
    const veiculo = await this.veiculos.findById(input.veiculoId);
    if (veiculo.clienteId !== input.clienteId) {
      throw new BadRequestException('Veículo não pertence ao cliente informado');
    }

    const os = new OrdemServico({
      clienteId: input.clienteId,
      veiculoId: input.veiculoId,
    });

    for (const s of input.servicos ?? []) {
      const servico = await this.servicos.findById(s.servicoId);
      os.adicionarItem({
        tipo: 'SERVICO',
        referenciaId: servico.id as string,
        descricao: servico.nome,
        quantidade: s.quantidade ?? 1,
        precoUnitario: servico.preco,
      });
    }

    for (const p of input.pecas ?? []) {
      const peca = await this.pecas.findById(p.pecaId);
      os.adicionarItem({
        tipo: 'PECA',
        referenciaId: peca.id as string,
        descricao: peca.nome,
        quantidade: p.quantidade,
        precoUnitario: peca.precoUnitario,
      });
    }

    return this.repository.create(os);
  }

  async findAll(filtro?: { status?: StatusOS; clienteId?: string }): Promise<OrdemServico[]> {
    const list = await this.repository.findAll(filtro);
    const visiveis = filtro?.status
      ? list
      : list.filter((os) => !STATUS_OCULTOS_NA_LISTAGEM.includes(os.status));
    return visiveis.sort(
      (a, b) =>
        prioridadeListagem(a.status) - prioridadeListagem(b.status) ||
        a.recebidaEm.getTime() - b.recebidaEm.getTime(),
    );
  }

  async findById(id: string): Promise<OrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) throw new NotFoundException('Ordem de serviço não encontrada');
    return os;
  }

  async findByNumero(numero: number): Promise<OrdemServico> {
    const os = await this.repository.findByNumero(numero);
    if (!os) throw new NotFoundException('Ordem de serviço não encontrada');
    return os;
  }

  async iniciarDiagnostico(id: string, diagnostico?: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.iniciarDiagnostico(diagnostico));
    return this.salvarENotificar(os);
  }

  async solicitarAprovacao(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.solicitarAprovacao());
    return this.salvarENotificar(os);
  }

  async aprovar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    return this.aprovarOS(os);
  }

  async responderOrcamento(numero: number, aprovado: boolean): Promise<OrdemServico> {
    const os = await this.findByNumero(numero);
    if (aprovado) return this.aprovarOS(os);
    this.tryDomain(() => os.cancelar());
    return this.salvarENotificar(os);
  }

  async finalizar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.finalizar());
    return this.salvarENotificar(os);
  }

  async entregar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.entregar());
    return this.salvarENotificar(os);
  }

  async cancelar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.cancelar());
    return this.salvarENotificar(os);
  }

  private async aprovarOS(os: OrdemServico): Promise<OrdemServico> {
    this.tryDomain(() => os.aprovar());
    for (const item of os.itens) {
      if (item.tipo === 'PECA') {
        await this.pecas.saidaEstoque(item.referenciaId, item.quantidade);
      }
    }
    return this.salvarENotificar(os);
  }

  private async salvarENotificar(os: OrdemServico): Promise<OrdemServico> {
    const salva = await this.repository.update(os);
    if (this.notificacao) {
      try {
        const cliente = await this.clientes.findById(salva.clienteId);
        await this.notificacao.notificarMudancaStatus(salva, cliente.email);
      } catch (err) {
        this.logger.warn(
          `Falha ao notificar cliente da OS ${salva.numero}: ${(err as Error).message}`,
        );
      }
    }
    return salva;
  }

  async tempoMedioExecucaoMinutos(): Promise<number | null> {
    return this.repository.tempoMedioExecucaoMinutos();
  }

  private tryDomain(fn: () => void): void {
    try {
      fn();
    } catch (err) {
      throw new BadRequestException((err as Error).message);
    }
  }
}
