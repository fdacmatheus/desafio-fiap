import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicosService } from './application/servicos.service';
import { SERVICO_REPOSITORY } from './domain/servico.repository';
import { ServicoOrmEntity } from './infrastructure/servico.orm-entity';
import { ServicoTypeOrmRepository } from './infrastructure/servico.typeorm.repository';
import { ServicosController } from './presentation/servicos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServicoOrmEntity])],
  controllers: [ServicosController],
  providers: [ServicosService, { provide: SERVICO_REPOSITORY, useClass: ServicoTypeOrmRepository }],
  exports: [ServicosService, SERVICO_REPOSITORY],
})
export class ServicosModule {}
