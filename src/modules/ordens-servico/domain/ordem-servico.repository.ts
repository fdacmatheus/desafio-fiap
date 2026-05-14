import { StatusOS } from './status-os';
import { OrdemServico } from './ordem-servico.entity';

export const ORDEM_SERVICO_REPOSITORY = Symbol('ORDEM_SERVICO_REPOSITORY');

export interface TempoMedioPorStatus {
  status: StatusOS;
  totalOrdens: number;
  tempoMedioMinutos: number;
}

export interface OrdemServicoRepository {
  create(os: OrdemServico): Promise<OrdemServico>;
  update(os: OrdemServico): Promise<OrdemServico>;
  findById(id: string): Promise<OrdemServico | null>;
  findByNumero(numero: number): Promise<OrdemServico | null>;
  findAll(filtro?: { status?: StatusOS; clienteId?: string }): Promise<OrdemServico[]>;
  tempoMedioExecucaoMinutos(): Promise<number | null>;
  delete(id: string): Promise<void>;
}
