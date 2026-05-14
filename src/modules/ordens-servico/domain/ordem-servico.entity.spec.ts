import { OrdemServico } from './ordem-servico.entity';
import { StatusOS } from './status-os';

const baseProps = {
  clienteId: 'cli-1',
  veiculoId: 'vei-1',
};

const itemServico = {
  tipo: 'SERVICO' as const,
  referenciaId: 'srv-1',
  descricao: 'Troca de óleo',
  quantidade: 1,
  precoUnitario: 100,
};

const itemPeca = {
  tipo: 'PECA' as const,
  referenciaId: 'pec-1',
  descricao: 'Filtro',
  quantidade: 2,
  precoUnitario: 50,
};

describe('OrdemServico — criação', () => {
  it('cria OS com status RECEBIDA e orçamento zero quando sem itens', () => {
    const os = new OrdemServico(baseProps);
    expect(os.status).toBe(StatusOS.RECEBIDA);
    expect(os.orcamento).toBe(0);
  });

  it('calcula orçamento somando subtotais dos itens', () => {
    const os = new OrdemServico({ ...baseProps, itens: [itemServico, itemPeca] });
    expect(os.orcamento).toBe(200); // 100 + 2*50
  });

  it('rejeita criação sem clienteId', () => {
    expect(() => new OrdemServico({ ...baseProps, clienteId: '' })).toThrow(/clienteId/);
  });
});

describe('OrdemServico — máquina de estados', () => {
  function osComItens() {
    return new OrdemServico({ ...baseProps, itens: [itemServico] });
  }

  it('fluxo feliz completo', () => {
    const os = osComItens();
    os.iniciarDiagnostico('motor com folga');
    expect(os.status).toBe(StatusOS.EM_DIAGNOSTICO);
    expect(os.diagnostico).toBe('motor com folga');

    os.solicitarAprovacao();
    expect(os.status).toBe(StatusOS.AGUARDANDO_APROVACAO);

    os.aprovar();
    expect(os.status).toBe(StatusOS.EM_EXECUCAO);
    expect(os.aprovadaEm).toBeInstanceOf(Date);
    expect(os.execucaoIniciadaEm).toBeInstanceOf(Date);

    os.finalizar();
    expect(os.status).toBe(StatusOS.FINALIZADA);

    os.entregar();
    expect(os.status).toBe(StatusOS.ENTREGUE);
  });

  it('rejeita solicitar aprovação sem itens', () => {
    const os = new OrdemServico(baseProps);
    os.iniciarDiagnostico();
    expect(() => os.solicitarAprovacao()).toThrow(/sem itens/);
  });

  it('rejeita transição inválida (RECEBIDA → EM_EXECUCAO)', () => {
    const os = osComItens();
    expect(() => os.aprovar()).toThrow(/Transição inválida/);
  });

  it('permite cancelar a partir de RECEBIDA, EM_DIAGNOSTICO, AGUARDANDO_APROVACAO e EM_EXECUCAO', () => {
    const os1 = osComItens();
    os1.cancelar();
    expect(os1.status).toBe(StatusOS.CANCELADA);

    const os2 = osComItens();
    os2.iniciarDiagnostico();
    os2.cancelar();
    expect(os2.status).toBe(StatusOS.CANCELADA);
  });

  it('não permite alterar itens depois de aguardando aprovação', () => {
    const os = osComItens();
    os.iniciarDiagnostico();
    os.solicitarAprovacao();
    expect(() => os.adicionarItem(itemPeca)).toThrow(/aprovação/);
  });
});

describe('OrdemServico — tempo de execução', () => {
  it('calcula tempoExecucaoMinutos entre execucaoIniciadaEm e finalizadaEm', () => {
    const inicio = new Date('2025-01-01T10:00:00Z');
    const fim = new Date('2025-01-01T11:30:00Z');
    const os = new OrdemServico({
      ...baseProps,
      status: StatusOS.FINALIZADA,
      execucaoIniciadaEm: inicio,
      finalizadaEm: fim,
    });
    expect(os.tempoExecucaoMinutos).toBe(90);
  });

  it('retorna null se não houver início ou fim', () => {
    const os = new OrdemServico(baseProps);
    expect(os.tempoExecucaoMinutos).toBeNull();
  });
});
