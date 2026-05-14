# Oficina API — Tech Challenge SOAT Fase 1

MVP do back-end de um **Sistema Integrado de Atendimento e Execução de Serviços** para oficina mecânica. Foco em gestão de **ordens de serviço, clientes, veículos, serviços e peças/insumos**, aplicando **DDD** e arquitetura em camadas.

## Stack

- **NestJS** + **TypeScript**
- **PostgreSQL** + **TypeORM**
- **REST** com **Swagger** em `/docs`
- **JWT** (`@nestjs/jwt` + Passport)
- **class-validator / class-transformer** para validação (CPF/CNPJ, placa)
- **Jest** para testes unitários e de integração
- **Docker** + **docker-compose**
- Gerenciador de pacotes: **pnpm**

## Por que PostgreSQL?

- Domínio fortemente relacional (Cliente ↔ Veículo ↔ OS ↔ Itens ↔ Peças/Serviços).
- **ACID** essencial para controle de estoque de peças e mudança de status da OS.
- Suporte nativo a tipos como `uuid`, `numeric`, `timestamp` — adequados para valores monetários e auditoria.
- Maturidade, ecossistema e ferramental (migrations via TypeORM).

## Arquitetura em camadas (por módulo)

```
src/
├── main.ts
├── app.module.ts
├── shared/                       # transversais: validators, filters, database
└── modules/
    ├── auth/
    ├── clientes/
    │   ├── domain/               # entidades + regras puras
    │   ├── application/          # use cases / services
    │   ├── infrastructure/       # repositórios TypeORM, ORM entities
    │   └── presentation/         # controllers, DTOs
    ├── veiculos/
    ├── servicos/
    ├── pecas/
    └── ordens-servico/
```

Cada bounded context é um módulo NestJS isolado com suas 4 camadas. A camada `domain` não depende de NestJS ou TypeORM — apenas regras de negócio puras.

## Como rodar (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/docs
- pgAdmin: http://localhost:5050 (login conforme `.env`)
  - Host do servidor dentro do pgAdmin: `db` · porta `5432`

## Como rodar localmente (sem Docker)

```bash
cp .env.example .env           # ajuste DB_HOST=localhost
pnpm install
pnpm start:dev
```

> É necessário um Postgres rodando localmente (ou suba apenas o `db` do compose: `docker compose up db`).

## Scripts úteis

| Comando                    | Descrição                                |
| -------------------------- | ---------------------------------------- |
| `pnpm start:dev`           | Sobe a API em modo watch                 |
| `pnpm build`               | Compila para `dist/`                     |
| `pnpm test`                | Testes unitários                         |
| `pnpm test:cov`            | Cobertura (alvo ≥ 80% nos domínios)      |
| `pnpm lint`                | ESLint + auto-fix                        |
| `pnpm seed`                | Popula o banco com dados de exemplo      |
| `pnpm migration:generate`  | Gera migration a partir das entities     |
| `pnpm migration:run`       | Aplica migrations                        |

## Seed

**Automático** — Por padrão, ao subir o container da API (`docker compose up`), o seed roda no startup (controlado pela env `AUTO_SEED=true`). A operação é **idempotente**, então só insere o que ainda não existe. Para desativar, defina `AUTO_SEED=false` no `.env`.

**Manual** — em dev local:
```bash
pnpm seed
```

Cria: **admin** (`admin` / `admin123`), 2 clientes (PF + PJ), 3 veículos, 4 serviços, 4 peças com estoque e 1 OS de exemplo (em `AGUARDANDO_APROVACAO`).

## Variáveis de ambiente

Veja `.env.example`. Em produção, **sempre** defina `JWT_SECRET` com valor forte e único.

## Status do MVP

- [x] Estrutura base (NestJS, TypeORM, Swagger, Docker)
- [x] Validadores de CPF/CNPJ e placa
- [x] Autenticação JWT com access + refresh tokens (segredos separados)
- [x] Módulo `clientes` (CRUD)
- [x] Módulo `veiculos` (CRUD, FK cliente, validação de placa)
- [x] Módulo `servicos` (catálogo)
- [x] Módulo `pecas` (CRUD + entrada/saída de estoque + alerta de baixo)
- [x] Módulo `ordens-servico`:
  - Itens (serviços + peças) com cálculo automático de orçamento
  - Máquina de estados: `Recebida → Em diagnóstico → Aguardando aprovação → Em execução → Finalizada → Entregue` (+ `Cancelada`)
  - Aprovação dá baixa automática no estoque das peças
  - Endpoint público `GET /publico/ordens-servico/:numero` para o cliente consultar status
  - `GET /ordens-servico/tempo-medio-execucao` (em minutos)
- [x] Testes unitários nos domínios críticos + e2e do fluxo auth/clientes
