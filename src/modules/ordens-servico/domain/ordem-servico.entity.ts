import { ItemOS, ItemOSProps } from './item-os';
import { podeTransitar, StatusOS } from './status-os';

export interface OrdemServicoProps {
  id?: string;
  numero?: number;
  clienteId: string;
  veiculoId: string;
  status?: StatusOS;
  diagnostico?: string | null;
  itens?: ItemOSProps[];
  recebidaEm?: Date;
  diagnosticoEm?: Date | null;
  aprovacaoSolicitadaEm?: Date | null;
  aprovadaEm?: Date | null;
  execucaoIniciadaEm?: Date | null;
  finalizadaEm?: Date | null;
  entregueEm?: Date | null;
  canceladaEm?: Date | null;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class OrdemServico {
  readonly id?: string;
  numero?: number;
  clienteId: string;
  veiculoId: string;
  status: StatusOS;
  diagnostico: string | null;
  itens: ItemOS[];
  recebidaEm: Date;
  diagnosticoEm: Date | null;
  aprovacaoSolicitadaEm: Date | null;
  aprovadaEm: Date | null;
  execucaoIniciadaEm: Date | null;
  finalizadaEm: Date | null;
  entregueEm: Date | null;
  canceladaEm: Date | null;
  readonly criadoEm: Date;
  atualizadoEm: Date;

  constructor(props: OrdemServicoProps) {
    if (!props.clienteId) throw new Error('clienteId é obrigatório');
    if (!props.veiculoId) throw new Error('veiculoId é obrigatório');

    this.id = props.id;
    this.numero = props.numero;
    this.clienteId = props.clienteId;
    this.veiculoId = props.veiculoId;
    this.status = props.status ?? StatusOS.RECEBIDA;
    this.diagnostico = props.diagnostico ?? null;
    this.itens = (props.itens ?? []).map((i) => new ItemOS(i));
    this.recebidaEm = props.recebidaEm ?? new Date();
    this.diagnosticoEm = props.diagnosticoEm ?? null;
    this.aprovacaoSolicitadaEm = props.aprovacaoSolicitadaEm ?? null;
    this.aprovadaEm = props.aprovadaEm ?? null;
    this.execucaoIniciadaEm = props.execucaoIniciadaEm ?? null;
    this.finalizadaEm = props.finalizadaEm ?? null;
    this.entregueEm = props.entregueEm ?? null;
    this.canceladaEm = props.canceladaEm ?? null;
    this.criadoEm = props.criadoEm ?? new Date();
    this.atualizadoEm = props.atualizadoEm ?? new Date();
  }

  get orcamento(): number {
    return Number(
      this.itens.reduce((total, item) => total + item.subtotal, 0).toFixed(2),
    );
  }

  get tempoExecucaoMinutos(): number | null {
    if (!this.execucaoIniciadaEm || !this.finalizadaEm) return null;
    const diff = this.finalizadaEm.getTime() - this.execucaoIniciadaEm.getTime();
    return Math.round(diff / 60000);
  }

  adicionarItem(item: ItemOSProps): void {
    if (this.status !== StatusOS.RECEBIDA && this.status !== StatusOS.EM_DIAGNOSTICO) {
      throw new Error('Itens só podem ser adicionados antes da aprovação do orçamento');
    }
    this.itens.push(new ItemOS(item));
    this.atualizadoEm = new Date();
  }

  removerItem(itemId: string): void {
    if (this.status !== StatusOS.RECEBIDA && this.status !== StatusOS.EM_DIAGNOSTICO) {
      throw new Error('Itens só podem ser removidos antes da aprovação do orçamento');
    }
    const idx = this.itens.findIndex((i) => i.id === itemId);
    if (idx < 0) throw new Error('Item não encontrado na OS');
    this.itens.splice(idx, 1);
    this.atualizadoEm = new Date();
  }

  iniciarDiagnostico(diagnostico?: string): void {
    this.transitar(StatusOS.EM_DIAGNOSTICO);
    if (diagnostico) this.diagnostico = diagnostico;
    this.diagnosticoEm = new Date();
  }

  solicitarAprovacao(): void {
    if (this.itens.length === 0) {
      throw new Error('OS sem itens não pode solicitar aprovação');
    }
    this.transitar(StatusOS.AGUARDANDO_APROVACAO);
    this.aprovacaoSolicitadaEm = new Date();
  }

  aprovar(): void {
    this.transitar(StatusOS.EM_EXECUCAO);
    this.aprovadaEm = new Date();
    this.execucaoIniciadaEm = new Date();
  }

  finalizar(): void {
    this.transitar(StatusOS.FINALIZADA);
    this.finalizadaEm = new Date();
  }

  entregar(): void {
    this.transitar(StatusOS.ENTREGUE);
    this.entregueEm = new Date();
  }

  cancelar(): void {
    this.transitar(StatusOS.CANCELADA);
    this.canceladaEm = new Date();
  }

  private transitar(novoStatus: StatusOS): void {
    if (!podeTransitar(this.status, novoStatus)) {
      throw new Error(
        `Transição inválida: ${this.status} → ${novoStatus}`,
      );
    }
    this.status = novoStatus;
    this.atualizadoEm = new Date();
  }
}
