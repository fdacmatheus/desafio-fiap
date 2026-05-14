import { Module } from '@nestjs/common';
import { AuthModule } from '../../modules/auth/auth.module';
import { ClientesModule } from '../../modules/clientes/clientes.module';
import { OrdensServicoModule } from '../../modules/ordens-servico/ordens-servico.module';
import { PecasModule } from '../../modules/pecas/pecas.module';
import { ServicosModule } from '../../modules/servicos/servicos.module';
import { VeiculosModule } from '../../modules/veiculos/veiculos.module';
import { SeedService } from './seed.service';

@Module({
  imports: [
    AuthModule,
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    PecasModule,
    OrdensServicoModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
