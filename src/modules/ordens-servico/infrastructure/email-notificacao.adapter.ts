import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { OrdemServico } from '../domain/ordem-servico.entity';
import { NotificacaoPort } from '../application/notificacao.port';

const DESCRICAO_STATUS: Record<string, string> = {
  RECEBIDA: 'Recebida',
  EM_DIAGNOSTICO: 'Em diagnóstico',
  AGUARDANDO_APROVACAO: 'Aguardando aprovação do orçamento',
  EM_EXECUCAO: 'Em execução',
  FINALIZADA: 'Finalizada',
  ENTREGUE: 'Entregue',
  CANCELADA: 'Cancelada',
};

@Injectable()
export class EmailNotificacaoAdapter implements NotificacaoPort {
  private readonly logger = new Logger(EmailNotificacaoAdapter.name);
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: ConfigService) {
    this.from = config.get<string>('SMTP_FROM', 'oficina@oficina.com');
    this.transporter = createTransport({
      host: config.get<string>('SMTP_HOST', 'localhost'),
      port: config.get<number>('SMTP_PORT', 1025),
      secure: false,
      auth: config.get<string>('SMTP_USER')
        ? {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASSWORD'),
          }
        : undefined,
    });
  }

  async notificarMudancaStatus(os: OrdemServico, emailCliente: string | null): Promise<void> {
    if (!emailCliente) {
      this.logger.warn(`OS ${os.numero}: cliente sem e-mail cadastrado, notificação ignorada`);
      return;
    }

    const statusLegivel = DESCRICAO_STATUS[os.status] ?? os.status;
    await this.transporter.sendMail({
      from: this.from,
      to: emailCliente,
      subject: `Oficina — OS #${os.numero}: ${statusLegivel}`,
      text: [
        `Olá!`,
        ``,
        `Sua ordem de serviço #${os.numero} mudou de situação: ${statusLegivel}.`,
        `Orçamento atual: R$ ${os.orcamento.toFixed(2)}`,
        ``,
        `Acompanhe pelo endpoint público: /api/publico/ordens-servico/${os.numero}`,
      ].join('\n'),
    });
    this.logger.log(`OS ${os.numero}: e-mail de status enviado para ${emailCliente}`);
  }
}
