export interface UserProps {
  id?: string;
  username: string;
  passwordHash: string;
  criadoEm?: Date;
  atualizadoEm?: Date;
}

export class User {
  readonly id?: string;
  username: string;
  passwordHash: string;
  readonly criadoEm: Date;
  atualizadoEm: Date;

  constructor(props: UserProps) {
    if (!props.username || props.username.trim().length < 3) {
      throw new Error('Username deve ter ao menos 3 caracteres');
    }
    if (!props.passwordHash) {
      throw new Error('passwordHash é obrigatório');
    }
    this.id = props.id;
    this.username = props.username.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.criadoEm = props.criadoEm ?? new Date();
    this.atualizadoEm = props.atualizadoEm ?? new Date();
  }
}
