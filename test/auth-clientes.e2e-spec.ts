import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserOrmEntity } from 'src/modules/auth/infrastructure/user.orm-entity';
import { ClientesModule } from 'src/modules/clientes/clientes.module';
import { ClienteOrmEntity } from 'src/modules/clientes/infrastructure/cliente.orm-entity';

describe('Auth + Clientes (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_EXPIRES_IN = '5m';
    process.env.JWT_REFRESH_EXPIRES_IN = '1h';

    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          dropSchema: true,
          entities: [UserOrmEntity, ClienteOrmEntity],
          synchronize: true,
        }),
        AuthModule,
        ClientesModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registra um usuário admin e retorna tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ username: 'admin', password: 'senha123' })
      .expect(201);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it('bloqueia GET /clientes sem token', async () => {
    await request(app.getHttpServer()).get('/api/clientes').expect(401);
  });

  it('cria e lista cliente com token', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/clientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'João', documento: '52998224725' })
      .expect(201);

    expect(create.body.documento).toBe('52998224725');

    const list = await request(app.getHttpServer())
      .get('/api/clientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body).toHaveLength(1);
  });

  it('rejeita CPF inválido', async () => {
    await request(app.getHttpServer())
      .post('/api/clientes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ nome: 'X', documento: '111.111.111-11' })
      .expect(400);
  });
});
