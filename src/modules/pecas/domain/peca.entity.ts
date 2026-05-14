export interface PecaProps {
  id?: string;
  sku: string;
  nome: string;
  descricao?: string | null;
  precoUnitario: number;
  estoque: number;
  estoqueMinimo: number;
  ativo?: boolean;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Peca {
  readonly id?: string;
  sku: string;
  nome: string;
  descricao: string | null;
  precoUnitario: number;
  estoque: number;
  estoqueMinimo: number;
  ativo: boolean;
  readonly criadoEm: Date;
  atualizadoEm: Date;

  constructor(props: PecaProps) {
    if (!props.sku || props.sku.trim().length === 0) {
      throw new Error('SKU é obrigatório');
    }
    if (!props.nome || props.nome.trim().length < 2) {
      throw new Error('Nome da peça é obrigatório');
    }
    if (typeof props.precoUnitario !== 'number' || props.precoUnitario < 0) {
      throw new Error('Preço unitário deve ser maior ou igual a zero');
    }
    if (!Number.isInteger(props.estoque) || props.estoque < 0) {
      throw new Error('Estoque deve ser um inteiro não-negativo');
    }
    if (!Number.isInteger(props.estoqueMinimo) || props.estoqueMinimo < 0) {
      throw new Error('Estoque mínimo deve ser um inteiro não-negativo');
    }

    this.id = props.id;
    this.sku = props.sku.trim().toUpperCase();
    this.nome = props.nome.trim();
    this.descricao = props.descricao?.trim() ?? null;
    this.precoUnitario = Number(props.precoUnitario.toFixed(2));
    this.estoque = props.estoque;
    this.estoqueMinimo = props.estoqueMinimo;
    this.ativo = props.ativo ?? true;
    this.criadoEm = props.criadoEm ?? new Date();
    this.atualizadoEm = props.atualizadoEm ?? new Date();
  }

  get estoqueBaixo(): boolean {
    return this.estoque <= this.estoqueMinimo;
  }

  entrada(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error('Quantidade de entrada deve ser um inteiro positivo');
    }
    this.estoque += quantidade;
    this.atualizadoEm = new Date();
  }

  saida(quantidade: number): void {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new Error('Quantidade de saída deve ser um inteiro positivo');
    }
    if (quantidade > this.estoque) {
      throw new Error(
        `Estoque insuficiente (disponível: ${this.estoque}, solicitado: ${quantidade})`,
      );
    }
    this.estoque -= quantidade;
    this.atualizadoEm = new Date();
  }
}
