import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module';
import { PecasModule } from '../pecas/pecas.module';
import { ServicosModule } from '../servicos/servicos.module';
import { VeiculosModule } from '../veiculos/veiculos.module';
import { NOTIFICACAO_PORT } from './application/notificacao.port';
import { OrdensServicoService } from './application/ordens-servico.service';
import { ORDEM_SERVICO_REPOSITORY } from './domain/ordem-servico.repository';
import { EmailNotificacaoAdapter } from './infrastructure/email-notificacao.adapter';
import { ItemOSOrmEntity } from './infrastructure/item-os.orm-entity';
import { OrdemServicoOrmEntity } from './infrastructure/ordem-servico.orm-entity';
import { OrdemServicoTypeOrmRepository } from './infrastructure/ordem-servico.typeorm.repository';
import { OrdensServicoPublicoController } from './presentation/ordens-servico-publico.controller';
import { OrdensServicoController } from './presentation/ordens-servico.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemServicoOrmEntity, ItemOSOrmEntity]),
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    PecasModule,
  ],
  controllers: [OrdensServicoController, OrdensServicoPublicoController],
  providers: [
    OrdensServicoService,
    { provide: ORDEM_SERVICO_REPOSITORY, useClass: OrdemServicoTypeOrmRepository },
    { provide: NOTIFICACAO_PORT, useClass: EmailNotificacaoAdapter },
  ],
  exports: [OrdensServicoService],
})
export class OrdensServicoModule {}
