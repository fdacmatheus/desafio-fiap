import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './application/clientes.service';
import { CLIENTE_REPOSITORY } from './domain/cliente.repository';
import { ClienteOrmEntity } from './infrastructure/cliente.orm-entity';
import { ClienteTypeOrmRepository } from './infrastructure/cliente.typeorm.repository';
import { ClientesController } from './presentation/clientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteOrmEntity])],
  controllers: [ClientesController],
  providers: [
    ClientesService,
    { provide: CLIENTE_REPOSITORY, useClass: ClienteTypeOrmRepository },
  ],
  exports: [ClientesService, CLIENTE_REPOSITORY],
})
export class ClientesModule {}
