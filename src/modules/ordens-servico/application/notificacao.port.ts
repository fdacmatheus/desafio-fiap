import { OrdemServico } from '../domain/ordem-servico.entity';

export const NOTIFICACAO_PORT = Symbol('NOTIFICACAO_PORT');

export interface NotificacaoPort {
  notificarMudancaStatus(os: OrdemServico, emailCliente: string | null): Promise<void>;
}
