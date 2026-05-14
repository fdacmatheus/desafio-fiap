export interface ServicoProps {
  id?: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  duracaoEstimadaMinutos: number;
  ativo?: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Servico {
  readonly id?: string;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoEstimadaMinutos: number;
  ativo: boolean;
  readonly criadoEm: Date;
  atualizadoEm: Date;

  constructor(props: ServicoProps) {
    if (!props.nome || props.nome.trim().length < 2) {
      throw new Error('Nome do serviço é obrigatório');
    }
    if (typeof props.preco !== 'number' || props.preco < 0) {
      throw new Error('Preço deve ser maior ou igual a zero');
    }
    if (
      !Number.isInteger(props.duracaoEstimadaMinutos) ||
      props.duracaoEstimadaMinutos <= 0
    ) {
      throw new Error('Duração estimada deve ser um inteiro positivo (minutos)');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.descricao = props.descricao?.trim() ?? null;
    this.preco = Number(props.preco.toFixed(2));
    this.duracaoEstimadaMinutos = props.duracaoEstimadaMinutos;
    this.ativo = props.ativo ?? true;
    this.criadoEm = props.criadoEm ?? new Date();
    this.atualizadoEm = props.atualizadoEm ?? new Date();
  }
}
