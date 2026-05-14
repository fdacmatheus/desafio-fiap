import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
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
import { StatusOS } from '../domain/status-os';

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
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: OrdemServicoRepository,
    private readonly clientes: ClientesService,
    private readonly veiculos: VeiculosService,
    private readonly servicos: ServicosService,
    private readonly pecas: PecasService,
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

  findAll(filtro?: { status?: StatusOS; clienteId?: string }): Promise<OrdemServico[]> {
    return this.repository.findAll(filtro);
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
    return this.repository.update(os);
  }

  async solicitarAprovacao(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.solicitarAprovacao());
    return this.repository.update(os);
  }

  async aprovar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.aprovar());
    for (const item of os.itens) {
      if (item.tipo === 'PECA') {
        await this.pecas.saidaEstoque(item.referenciaId, item.quantidade);
      }
    }
    return this.repository.update(os);
  }

  async finalizar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.finalizar());
    return this.repository.update(os);
  }

  async entregar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.entregar());
    return this.repository.update(os);
  }

  async cancelar(id: string): Promise<OrdemServico> {
    const os = await this.findById(id);
    this.tryDomain(() => os.cancelar());
    return this.repository.update(os);
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
