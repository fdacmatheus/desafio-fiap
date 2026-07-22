import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from '../clientes/clientes.module';
import { VeiculosService } from './application/veiculos.service';
import { VEICULO_REPOSITORY } from './domain/veiculo.repository';
import { VeiculoOrmEntity } from './infrastructure/veiculo.orm-entity';
import { VeiculoTypeOrmRepository } from './infrastructure/veiculo.typeorm.repository';
import { VeiculosController } from './presentation/veiculos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VeiculoOrmEntity]), ClientesModule],
  controllers: [VeiculosController],
  providers: [VeiculosService, { provide: VEICULO_REPOSITORY, useClass: VeiculoTypeOrmRepository }],
  exports: [VeiculosService, VEICULO_REPOSITORY],
})
export class VeiculosModule {}
