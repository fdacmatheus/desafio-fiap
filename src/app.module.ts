import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { OrdensServicoModule } from './modules/ordens-servico/ordens-servico.module';
import { PecasModule } from './modules/pecas/pecas.module';
import { ServicosModule } from './modules/servicos/servicos.module';
import { VeiculosModule } from './modules/veiculos/veiculos.module';
import { SeedModule } from './shared/database/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'oficina'),
        password: config.get<string>('DB_PASSWORD', 'oficina'),
        database: config.get<string>('DB_NAME', 'oficina'),
        autoLoadEntities: true,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    ClientesModule,
    VeiculosModule,
    ServicosModule,
    PecasModule,
    OrdensServicoModule,
    SeedModule,
  ],
})
export class AppModule {}
