import { Logger, Type } from '@nestjs/common';
import { AuthService } from '../../modules/auth/application/auth.service';
import { USER_REPOSITORY, UserRepository } from '../../modules/auth/domain/user.repository';
import { ClientesService } from '../../modules/clientes/application/clientes.service';
import {
  CLIENTE_REPOSITORY,
  ClienteRepository,
} from '../../modules/clientes/domain/cliente.repository';
import { OrdensServicoService } from '../../modules/ordens-servico/application/ordens-servico.service';
import { PecasService } from '../../modules/pecas/application/pecas.service';
import { PECA_REPOSITORY, PecaRepository } from '../../modules/pecas/domain/peca.repository';
import { ServicosService } from '../../modules/servicos/application/servicos.service';
import {
  SERVICO_REPOSITORY,
  ServicoRepository,
} from '../../modules/servicos/domain/servico.repository';
import { VeiculosService } from '../../modules/veiculos/application/veiculos.service';
import {
  VEICULO_REPOSITORY,
  VeiculoRepository,
} from '../../modules/veiculos/domain/veiculo.repository';

const log = new Logger('Seeder');

export interface Resolver {
  get<T>(token: Type<T> | symbol | string): T;
}

export async function runSeed(app: Resolver): Promise<void> {
  await seedAdmin(app);
  const clientes = await seedClientes(app);
  const veiculos = await seedVeiculos(app, clientes);
  const servicos = await seedServicos(app);
  const pecas = await seedPecas(app);
  await seedOrdemServico(app, clientes[0].id!, veiculos[0].id!, servicos, pecas);
  log.log('✔ Seed concluído com sucesso');
}

async function seedAdmin(app: Resolver) {
  const users = app.get<UserRepository>(USER_REPOSITORY);
  const auth = app.get(AuthService);
  const existing = await users.findByUsername('admin');
  if (existing) {
    log.log('Admin já existe, pulando');
    return;
  }
  await auth.register('admin', 'admin123');
  log.log('Admin criado (admin / admin123)');
}

async function seedClientes(app: Resolver) {
  const repo = app.get<ClienteRepository>(CLIENTE_REPOSITORY);
  const service = app.get(ClientesService);

  const fixtures = [
    {
      nome: 'João da Silva',
      documento: '52998224725',
      email: 'joao@email.com',
      telefone: '+5511999990001',
    },
    {
      nome: 'Auto Peças LTDA',
      documento: '11222333000181',
      email: 'contato@autopecas.com.br',
      telefone: '+5511999990002',
    },
  ];

  const created = [];
  for (const f of fixtures) {
    const existing = await repo.findByDocumento(f.documento);
    if (existing) {
      created.push(existing);
      continue;
    }
    const cli = await service.create(f);
    log.log(`Cliente criado: ${cli.nome} (${cli.tipoDocumento})`);
    created.push(cli);
  }
  return created;
}

async function seedVeiculos(
  app: Resolver,
  clientes: { id?: string }[],
) {
  const repo = app.get<VeiculoRepository>(VEICULO_REPOSITORY);
  const service = app.get(VeiculosService);

  const fixtures = [
    {
      clienteId: clientes[0].id!,
      placa: 'ABC1D23',
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano: 2020,
    },
    {
      clienteId: clientes[0].id!,
      placa: 'XYZ2E45',
      marca: 'Fiat',
      modelo: 'Uno',
      ano: 2018,
    },
    {
      clienteId: clientes[1].id!,
      placa: 'DEF3F67',
      marca: 'Ford',
      modelo: 'Cargo',
      ano: 2022,
    },
  ];

  const created = [];
  for (const f of fixtures) {
    const existing = await repo.findByPlaca(f.placa);
    if (existing) {
      created.push(existing);
      continue;
    }
    const v = await service.create(f);
    log.log(`Veículo criado: ${v.placa} (${v.marca} ${v.modelo})`);
    created.push(v);
  }
  return created;
}

async function seedServicos(app: Resolver) {
  const repo = app.get<ServicoRepository>(SERVICO_REPOSITORY);
  const service = app.get(ServicosService);

  const fixtures = [
    {
      nome: 'Troca de óleo',
      descricao: 'Troca de óleo e filtro',
      preco: 150,
      duracaoEstimadaMinutos: 45,
    },
    {
      nome: 'Alinhamento',
      descricao: 'Alinhamento da direção',
      preco: 120,
      duracaoEstimadaMinutos: 60,
    },
    {
      nome: 'Balanceamento',
      descricao: 'Balanceamento das 4 rodas',
      preco: 100,
      duracaoEstimadaMinutos: 30,
    },
    {
      nome: 'Revisão completa',
      descricao: 'Revisão geral 30k km',
      preco: 800,
      duracaoEstimadaMinutos: 240,
    },
  ];

  const existing = await repo.findAll(true);
  if (existing.length > 0) return existing;

  const created = [];
  for (const f of fixtures) {
    const s = await service.create(f);
    log.log(`Serviço criado: ${s.nome} — R$ ${s.preco.toFixed(2)}`);
    created.push(s);
  }
  return created;
}

async function seedPecas(app: Resolver) {
  const repo = app.get<PecaRepository>(PECA_REPOSITORY);
  const service = app.get(PecasService);

  const fixtures = [
    {
      sku: 'OLEO-5W30',
      nome: 'Óleo 5W30 (litro)',
      precoUnitario: 49.9,
      estoque: 100,
      estoqueMinimo: 10,
    },
    {
      sku: 'FILTRO-OLEO',
      nome: 'Filtro de óleo',
      precoUnitario: 35,
      estoque: 50,
      estoqueMinimo: 5,
    },
    {
      sku: 'FILTRO-AR',
      nome: 'Filtro de ar',
      precoUnitario: 45,
      estoque: 30,
      estoqueMinimo: 5,
    },
    {
      sku: 'PASTILHA-FREIO',
      nome: 'Pastilha de freio (par)',
      precoUnitario: 180,
      estoque: 20,
      estoqueMinimo: 4,
    },
  ];

  const existing = await repo.findAll(true);
  if (existing.length > 0) return existing;

  const created = [];
  for (const f of fixtures) {
    const p = await service.create(f);
    log.log(`Peça criada: ${p.sku} — estoque ${p.estoque}`);
    created.push(p);
  }
  return created;
}

async function seedOrdemServico(
  app: Resolver,
  clienteId: string,
  veiculoId: string,
  servicos: { id?: string }[],
  pecas: { id?: string }[],
) {
  const service = app.get(OrdensServicoService);
  const existentes = await service.findAll();
  if (existentes.length > 0) return;

  const os = await service.create({
    clienteId,
    veiculoId,
    servicos: [{ servicoId: servicos[0].id! }],
    pecas: [
      { pecaId: pecas[0].id!, quantidade: 4 },
      { pecaId: pecas[1].id!, quantidade: 1 },
    ],
  });
  log.log(`OS #${os.numero} criada (R$ ${os.orcamento.toFixed(2)})`);

  await service.iniciarDiagnostico(os.id!, 'Veículo apresenta ruído no motor');
  await service.solicitarAprovacao(os.id!);
  log.log(`OS #${os.numero} aguardando aprovação do cliente`);
}
