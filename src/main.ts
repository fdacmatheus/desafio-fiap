import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Oficina API')
    .setDescription('MVP do sistema integrado de atendimento e execução de serviços da oficina')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação — register, login e refresh de tokens JWT')
    .addTag('clientes', 'Gestão de clientes (CRUD)')
    .addTag('veiculos', 'Gestão de veículos (CRUD)')
    .addTag('servicos', 'Catálogo de serviços (CRUD)')
    .addTag('pecas', 'Gestão de peças e insumos com controle de estoque')
    .addTag('ordens-servico', 'Ordens de serviço, orçamento e fluxo de status (admin)')
    .addTag('ordens-servico-publico', 'Consulta pública de OS pelo número (sem JWT)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      persistAuthorization: true,
    },
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

void bootstrap();
