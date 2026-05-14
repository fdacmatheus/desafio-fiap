import { isValidCnpj, isValidCpf } from 'src/shared/validators/cpf-cnpj.validator';

export type TipoDocumento = 'CPF' | 'CNPJ';

export interface ClienteProps {
  id?: string;
  nome: string;
  documento: string;
  email?: string | null;
  telefone?: string | null;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class Cliente {
  readonly id?: string;
  nome: string;
  documento: string;
  email: string | null;
  telefone: string | null;
  readonly criadoEm: Date;
  atualizadoEm: Date;

  constructor(props: ClienteProps) {
    if (!props.nome || props.nome.trim().length < 2) {
      throw new Error('Nome do cliente é obrigatório');
    }
    if (!isValidCpf(props.documento) && !isValidCnpj(props.documento)) {
      throw new Error('Documento (CPF/CNPJ) inválido');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.documento = props.documento.replace(/\D/g, '');
    this.email = props.email ?? null;
    this.telefone = props.telefone ?? null;
    this.criadoEm = props.criadoEm ?? new Date();
    this.atualizadoEm = props.atualizadoEm ?? new Date();
  }

  get tipoDocumento(): TipoDocumento {
    return this.documento.length === 11 ? 'CPF' : 'CNPJ';
  }
}
