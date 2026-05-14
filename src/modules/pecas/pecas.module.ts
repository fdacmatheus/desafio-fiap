import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PecasService } from './application/pecas.service';
import { PECA_REPOSITORY } from './domain/peca.repository';
import { PecaOrmEntity } from './infrastructure/peca.orm-entity';
import { PecaTypeOrmRepository } from './infrastructure/peca.typeorm.repository';
import { PecasController } from './presentation/pecas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PecaOrmEntity])],
  controllers: [PecasController],
  providers: [
    PecasService,
    { provide: PECA_REPOSITORY, useClass: PecaTypeOrmRepository },
  ],
  exports: [PecasService, PECA_REPOSITORY],
})
export class PecasModule {}
