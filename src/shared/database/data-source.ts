import { config as loadEnv } from 'dotenv';
import { DataSource } from 'typeorm';

loadEnv({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'oficina',
  password: process.env.DB_PASSWORD ?? 'oficina',
  database: process.env.DB_NAME ?? 'oficina',
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/shared/database/migrations/*.ts'],
  synchronize: false,
});
