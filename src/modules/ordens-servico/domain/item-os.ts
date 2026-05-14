export type TipoItem = 'SERVICO' | 'PECA';

export interface ItemOSProps {
  id?: string;
  tipo: TipoItem;
  referenciaId: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
}

export class ItemOS {
  readonly id?: string;
  tipo: TipoItem;
  referenciaId: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;

  constructor(props: ItemOSProps) {
    if (props.tipo !== 'SERVICO' && props.tipo !== 'PECA') {
      throw new Error('Tipo de item inválido');
    }
    if (!props.referenciaId) {
      throw new Error('referenciaId é obrigatório');
    }
    if (!Number.isInteger(props.quantidade) || props.quantidade <= 0) {
      throw new Error('Quantidade deve ser inteiro positivo');
    }
    if (typeof props.precoUnitario !== 'number' || props.precoUnitario < 0) {
      throw new Error('precoUnitario deve ser ≥ 0');
    }

    this.id = props.id;
    this.tipo = props.tipo;
    this.referenciaId = props.referenciaId;
    this.descricao = props.descricao;
    this.quantidade = props.quantidade;
    this.precoUnitario = Number(props.precoUnitario.toFixed(2));
  }

  get subtotal(): number {
    return Number((this.precoUnitario * this.quantidade).toFixed(2));
  }
}
