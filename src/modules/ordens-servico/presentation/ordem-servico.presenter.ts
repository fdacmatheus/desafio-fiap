import { OrdemServico } from '../domain/ordem-servico.entity';
import { transicoesPermitidas } from '../domain/status-os';

export class OrdemServicoPresenter {
  static detail(os: OrdemServico) {
    return {
      id: os.id,
      numero: os.numero,
      clienteId: os.clienteId,
      veiculoId: os.veiculoId,
      status: os.status,
      diagnostico: os.diagnostico,
      itens: os.itens.map((i) => ({
        id: i.id,
        tipo: i.tipo,
        referenciaId: i.referenciaId,
        descricao: i.descricao,
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        subtotal: i.subtotal,
      })),
      orcamento: os.orcamento,
      tempoExecucaoMinutos: os.tempoExecucaoMinutos,
      timestamps: {
        recebidaEm: os.recebidaEm,
        diagnosticoEm: os.diagnosticoEm,
        aprovacaoSolicitadaEm: os.aprovacaoSolicitadaEm,
        aprovadaEm: os.aprovadaEm,
        execucaoIniciadaEm: os.execucaoIniciadaEm,
        finalizadaEm: os.finalizadaEm,
        entregueEm: os.entregueEm,
        canceladaEm: os.canceladaEm,
      },
    };
  }

  static summary(os: OrdemServico) {
    return {
      id: os.id,
      numero: os.numero,
      clienteId: os.clienteId,
      veiculoId: os.veiculoId,
      status: os.status,
      orcamento: os.orcamento,
      recebidaEm: os.recebidaEm,
    };
  }

  static status(os: OrdemServico) {
    return {
      numero: os.numero,
      status: os.status,
      proximosStatusPossiveis: transicoesPermitidas(os.status),
      atualizadoEm: os.atualizadoEm,
    };
  }

  static publico(os: OrdemServico) {
    return {
      numero: os.numero,
      status: os.status,
      orcamento: os.orcamento,
      timestamps: {
        recebidaEm: os.recebidaEm,
        diagnosticoEm: os.diagnosticoEm,
        aprovacaoSolicitadaEm: os.aprovacaoSolicitadaEm,
        aprovadaEm: os.aprovadaEm,
        execucaoIniciadaEm: os.execucaoIniciadaEm,
        finalizadaEm: os.finalizadaEm,
        entregueEm: os.entregueEm,
      },
    };
  }
}
